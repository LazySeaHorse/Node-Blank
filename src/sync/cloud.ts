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
 * A push writes new bins, then switches the index over to them, then deletes the old ones: until the switch,
 * the index points at a complete older copy, so a push that dies halfway loses nothing.
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
      return parse(indexSchema, JSON.parse(new TextDecoder().decode(plain)), 'index');
    } catch (error) {
      if (error instanceof DecryptError)
        throw new SyncError('password', 'That password does not open the cloud save.');
      throw error;
    }
  }

  private async writeIndex(index: CloudIndex): Promise<void> {
    await this.store.update(this.manifestId, await manifestOf(this.key, this.kdf, index));
  }

  /** The cloud copy of `id`; `canvas` is null if it was deleted. */
  async pull(id: string): Promise<{ entry: CloudEntry; canvas: CloudCanvas | null }> {
    const entry = (await this.readIndex()).canvases[id];
    if (!entry) throw new SyncError('not-found', 'The cloud has no copy of this canvas.');
    if (entry.deleted) return { entry, canvas: null };
    const pieces: string[] = [];
    for (const bin of entry.bins) pieces.push(parse(pieceSchema, await this.store.read(bin), 'canvas').d);
    return { entry, canvas: await unpackCanvas(this.key, id, entry.rev, pieces) };
  }

  /** Uploads `canvas` as the new cloud copy of `id`. */
  async push(id: string, canvas: CloudCanvas, now = Date.now()): Promise<CloudEntry> {
    const rev = crypto.randomUUID();
    const pieces = await packCanvas(this.key, id, rev, canvas);
    const bins: string[] = [];
    const entry: CloudEntry = { name: canvas.name, updatedAt: now, rev, bins };
    let written: CloudIndex;
    let replaced: string[];
    try {
      for (const [i, d] of pieces.entries()) bins.push(await this.store.create({ v: VERSION, i, d }));
      // Read just before writing, so changes other devices made to other canvases meanwhile are kept.
      const index = await this.readIndex();
      replaced = [...index.trash, ...(index.canvases[id]?.bins ?? [])];
      written = { ...index, canvases: { ...index.canvases, [id]: entry } };
      await this.writeIndex(written);
    } catch (error) {
      // Nothing points at the new bins, so they would only be clutter.
      await Promise.allSettled(bins.map((bin) => this.store.remove(bin)));
      throw error;
    }
    // The push has succeeded; tidying the old bins must not undo it.
    await this.discard(replaced, written).catch(() => undefined);
    return entry;
  }

  /** Deletes the cloud copy of `id`, leaving a tombstone in its place. */
  async remove(id: string, now = Date.now()): Promise<CloudEntry> {
    const index = await this.readIndex();
    const entry: CloudEntry = { name: '', updatedAt: now, rev: crypto.randomUUID(), bins: [], deleted: true };
    const written = { ...index, canvases: { ...index.canvases, [id]: entry } };
    await this.writeIndex(written);
    await this.discard([...index.trash, ...(index.canvases[id]?.bins ?? [])], written).catch(() => undefined);
    return entry;
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
