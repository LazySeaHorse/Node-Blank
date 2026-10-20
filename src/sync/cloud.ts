import { z } from 'zod';
import { fromBase64, toBase64 } from './codec';
import { DecryptError, deriveKey, KDF_ITERATIONS, newSalt, open, seal } from './crypto';
import { SyncError } from './errors';
import type { BinStore } from './jsonbin';
import { type CloudCanvas, packCanvas, unpackCanvas } from './pack';

/**
 * The cloud side of sync, over any `BinStore`. One bin, the manifest, holds the salt for the password and an
 * encrypted index of the canvases; each canvas lives in its own bins, one per piece. Names are in the
 * encrypted index, so the store sees nothing but sizes.
 *
 * A push overwrites the canvas's bins, then the index. This assumes one person syncing from one device at a
 * time, who has checked first: the index is read by a check and trusted after that, not re-read before each
 * write. A push that dies halfway can leave the cloud copy unreadable until it is pushed again.
 */

const APP_TAG = 'node-blank-sync';
const VERSION = 1;
const INDEX_CONTEXT = 'index';

const manifestSchema = z.object({
  app: z.literal(APP_TAG),
  version: z.literal(VERSION),
  kdf: z.object({ iterations: z.number().int().positive(), salt: z.string() }),
  index: z.string(),
});

const entrySchema = z
  .object({
    /** Empty for a deleted canvas, whose name is not kept. */
    name: z.string(),
    /** When the copy was uploaded, or the canvas deleted. */
    updatedAt: z.number(),
    /** Changes with every upload and deletion: how a device tells whether the cloud copy is the one it last saw. */
    rev: z.string(),
    /** The bins holding the pieces, in order; none once deleted. */
    bins: z.array(z.string()),
    /**
     * A tombstone: the canvas was deleted. It stays in the index so devices that still have the canvas learn
     * of it, rather than putting it back.
     */
    deleted: z.boolean().optional(),
  })
  .refine((entry) => entry.deleted || entry.bins.length > 0);

const indexSchema = z.object({
  canvases: z.record(z.string(), entrySchema),
  /** Bins that could not be deleted when they were replaced; tried again on the next push. */
  trash: z.array(z.string()),
});

const pieceSchema = z.object({ v: z.literal(VERSION), i: z.number().int().min(0), d: z.string() });

export type CloudEntry = z.infer<typeof entrySchema>;
export type CloudIndex = z.infer<typeof indexSchema>;

/** A canvas to upload, or with `canvas: null` to delete. */
export interface PushJob {
  id: string;
  canvas: CloudCanvas | null;
}

const EMPTY_INDEX: CloudIndex = { canvases: {}, trash: [] };

function parse<T>(schema: z.ZodType<T>, value: unknown, what: string): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new SyncError('format', `The cloud ${what} is not in a format this version knows.`);
  return result.data;
}

export class Cloud {
  private constructor(
    private readonly store: BinStore,
    readonly manifestId: string,
    private readonly key: CryptoKey,
    private readonly kdf: { iterations: number; salt: string },
  ) {}

  /**
   * The index as last read or written here. Everything but a check works from this instead of reading the
   * cloud again, so it assumes nobody else changed the cloud since the last check.
   */
  private known?: CloudIndex;

  /** Starts a new, empty cloud save protected by `password`. */
  static async create(store: BinStore, password: string, iterations = KDF_ITERATIONS): Promise<Cloud> {
    const salt = newSalt();
    const key = await deriveKey(password, salt, iterations);
    const kdf = { iterations, salt: toBase64(salt) };
    const manifestId = await store.create(await manifestOf(key, kdf, EMPTY_INDEX));
    return new Cloud(store, manifestId, key, kdf);
  }

  /** Joins the cloud save in bin `manifestId`; throws a `password` error if the password does not open it. */
  static async connect(store: BinStore, manifestId: string, password: string): Promise<Cloud> {
    const manifest = parse(manifestSchema, await store.read(manifestId), 'save');
    const key = await deriveKey(password, fromBase64(manifest.kdf.salt), manifest.kdf.iterations);
    const cloud = new Cloud(store, manifestId, key, manifest.kdf);
    await cloud.readIndex(manifest);
    return cloud;
  }

  async readIndex(manifest?: z.infer<typeof manifestSchema>): Promise<CloudIndex> {
    const current = manifest ?? parse(manifestSchema, await this.store.read(this.manifestId), 'save');
    try {
      const plain = await open(this.key, fromBase64(current.index), INDEX_CONTEXT);
      const index = parse(indexSchema, JSON.parse(new TextDecoder().decode(plain)), 'index');
      this.known = index;
      return index;
    } catch (error) {
      if (error instanceof DecryptError)
        throw new SyncError('password', 'That password does not open the cloud save.');
      throw error;
    }
  }

  private async writeIndex(index: CloudIndex): Promise<void> {
    await this.store.update(this.manifestId, await manifestOf(this.key, this.kdf, index));
    this.known = index;
  }

  /** The cloud copy of `id`; `canvas` is null if it was deleted. */
  async pull(id: string): Promise<{ entry: CloudEntry; canvas: CloudCanvas | null }> {
    const entry = (await this.current()).canvases[id];
    if (!entry) throw new SyncError('not-found', 'The cloud has no copy of this canvas.');
    if (entry.deleted) return { entry, canvas: null };
    const pieces: string[] = [];
    for (const bin of entry.bins) pieces.push(parse(pieceSchema, await this.store.read(bin), 'canvas').d);
    return { entry, canvas: await unpackCanvas(this.key, id, entry.rev, pieces) };
  }

  /** Uploads `canvas` as the new cloud copy of `id`. */
  async push(id: string, canvas: CloudCanvas, now = Date.now()): Promise<CloudEntry> {
    return this.pushOne({ id, canvas }, now);
  }

  /** Deletes the cloud copy of `id`, leaving a tombstone in its place. */
  async remove(id: string, now = Date.now()): Promise<CloudEntry> {
    return this.pushOne({ id, canvas: null }, now);
  }

  private async pushOne(job: PushJob, now: number): Promise<CloudEntry> {
    const { entries, failed } = await this.pushMany([job], now);
    if (failed[0]) throw failed[0].error;
    return entries[job.id];
  }

  private async current(): Promise<CloudIndex> {
    return this.known ?? (await this.readIndex());
  }

  /**
   * Uploads or deletes several canvases with one write to the index, however many there are. A canvas's
   * existing bins are overwritten in place, so a canvas of one piece costs a single write plus the index.
   * Each canvas too big to sync is reported in `failed` and the rest go ahead; any other error stops
   * everything. Bins are not written back to how they were, so a push that dies halfway can leave a canvas
   * unreadable in the cloud until it is pushed again.
   */
  async pushMany(
    jobs: PushJob[],
    now = Date.now(),
  ): Promise<{ entries: Record<string, CloudEntry>; failed: { id: string; error: SyncError }[] }> {
    const index = await this.current();
    const entries: Record<string, CloudEntry> = {};
    const failed: { id: string; error: SyncError }[] = [];
    const surplus = [...index.trash];
    const created: string[] = [];
    let written: CloudIndex;
    try {
      for (const { id, canvas } of jobs) {
        const rev = crypto.randomUUID();
        const old = index.canvases[id]?.bins ?? [];
        if (!canvas) {
          entries[id] = { name: '', updatedAt: now, rev, bins: [], deleted: true };
          surplus.push(...old);
          continue;
        }
        try {
          const pieces = await packCanvas(this.key, id, rev, canvas);
          const bins: string[] = [];
          for (const [i, d] of pieces.entries()) {
            const data = { v: VERSION, i, d };
            if (old[i]) {
              await this.store.update(old[i], data);
              bins.push(old[i]);
            } else {
              bins.push(await this.store.create(data));
              created.push(bins[i]);
            }
          }
          surplus.push(...old.slice(pieces.length));
          entries[id] = { name: canvas.name, updatedAt: now, rev, bins };
        } catch (error) {
          if (!(error instanceof SyncError && error.kind === 'too-large')) throw error;
          failed.push({ id, error });
        }
      }
      if (Object.keys(entries).length === 0) return { entries, failed };
      written = { ...index, canvases: { ...index.canvases, ...entries } };
      await this.writeIndex(written);
    } catch (error) {
      await Promise.allSettled(created.map((bin) => this.store.remove(bin)));
      throw error;
    }
    // The push has succeeded; tidying the bins it no longer needs must not undo it.
    await this.discard(surplus, written).catch(() => undefined);
    return { entries, failed };
  }

  /** Deletes bins nothing refers to any more; those that will not go are remembered for next time. */
  private async discard(bins: string[], index: CloudIndex): Promise<void> {
    const kept: string[] = [];
    for (const bin of bins) {
      try {
        await this.store.remove(bin);
      } catch (error) {
        if (!(error instanceof SyncError && error.kind === 'not-found')) kept.push(bin);
      }
    }
    if (kept.length === index.trash.length && kept.every((bin, i) => bin === index.trash[i])) return;
    await this.writeIndex({ ...index, trash: kept });
  }
}

async function manifestOf(key: CryptoKey, kdf: { iterations: number; salt: string }, index: CloudIndex) {
  const sealed = await seal(key, new TextEncoder().encode(JSON.stringify(index)), INDEX_CONTEXT);
  return { app: APP_TAG, version: VERSION, kdf, index: toBase64(sealed) };
}
