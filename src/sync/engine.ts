import { create } from 'zustand';
import * as repo from '@/persistence/canvasRepo';
import * as workspace from '@/store/workspace';
import { Cloud, type CloudEntry } from './cloud';
import { SyncError, type SyncErrorKind } from './errors';
import { jsonbin } from './jsonbin';
import { keepLocalImages } from './pack';
import { isConfigured, useSyncSettings } from './settings';
import { compareAll, pullable, pushable } from './status';

/**
 * Runs cloud sync against this device's canvases. `check` looks at the cloud and remembers what it found;
 * the status of each canvas is then worked out from that and from what is on the device (see `compareAll`),
 * so it stays right as canvases are edited. Push and pull never decide for themselves what to overwrite:
 * the caller has already asked.
 */

interface SyncState {
  /** The cloud's canvases as of the last check; null before any. */
  entries: Record<string, CloudEntry> | null;
  checkedAt: number | null;
  /** Ids of canvases being synced, or every one while a bulk action runs. */
  busy: string[] | 'all';
}

export const useSync = create<SyncState>(() => ({ entries: null, checkedAt: null, busy: [] }));

let session: { signature: string; cloud: Promise<Cloud> } | undefined;

const settingsOrThrow = () => {
  const settings = useSyncSettings.getState();
  if (!isConfigured(settings)) throw new SyncError('other', 'Set up cloud sync first.');
  return settings;
};

/** The cloud save for the current settings; the password is only stretched into a key once per session. */
function cloudOf(): Promise<Cloud> {
  const { key, keyKind, manifestId, password } = settingsOrThrow();
  const signature = JSON.stringify([key, keyKind, manifestId, password]);
  if (session?.signature !== signature) {
    const cloud = Cloud.connect(jsonbin(key, keyKind), manifestId, password);
    const mine = { signature, cloud };
    session = mine;
    // A failed connection is not kept, so fixing the settings (or the network) and trying again works.
    cloud.catch(() => {
      if (session === mine) session = undefined;
    });
  }
  return session.cloud;
}

/**
 * Checks `key` and `password` against the save in bin `manifestId`, or against a new save if there is none
 * yet, and returns the bin's id. Settings are not touched.
 */
export async function connect(options: {
  key: string;
  keyKind: 'master' | 'access';
  manifestId: string;
  password: string;
}): Promise<string> {
  const store = jsonbin(options.key, options.keyKind);
  const cloud = options.manifestId
    ? await Cloud.connect(store, options.manifestId, options.password)
    : await Cloud.create(store, options.password);
  return cloud.manifestId;
}

let tail: Promise<unknown> = Promise.resolve();
/** One thing at a time: two pushes at once could swap each other's changes to the index. */
const exclusive = <T>(task: () => Promise<T>): Promise<T> => {
  const run = tail.then(task, task);
  tail = run.catch(() => undefined);
  return run;
};

const markBusy = async <T>(ids: string[] | 'all', task: () => Promise<T>): Promise<T> => {
  useSync.setState({ busy: ids });
  try {
    return await task();
  } finally {
    useSync.setState({ busy: [] });
  }
};

const remember = (patch: Record<string, CloudEntry>) =>
  useSync.setState((s) => ({ entries: { ...s.entries, ...patch } }));

async function lookAtCloud(): Promise<Record<string, CloudEntry>> {
  const entries = (await (await cloudOf()).readIndex()).canvases;
  useSync.setState({ entries, checkedAt: Date.now() });
  return entries;
}

async function sendCanvas(id: string): Promise<void> {
  await workspace.flushSave();
  const meta = await repo.getCanvas(id);
  if (!meta) throw new SyncError('not-found', 'That canvas is not on this device.');
  const content = await repo.loadContent(id);
  const entry = await (await cloudOf()).push(id, { name: meta.name, content });
  await repo.putSyncRecord({ id, rev: entry.rev, localUpdatedAt: meta.updatedAt });
  remember({ [id]: entry });
}

async function fetchCanvas(id: string): Promise<void> {
  await workspace.flushSave();
  const { entry, canvas } = await (await cloudOf()).pull(id);
  const nodes = keepLocalImages(canvas.content.nodes, (await repo.loadContent(id)).nodes);
  await workspace.savePulledCanvas(id, canvas.name, { ...canvas.content, nodes }, entry.rev);
  remember({ [id]: entry });
}

/** Looks at the cloud, to see which canvases differ. Changes nothing. */
export const check = () => exclusive(() => markBusy('all', async () => void (await lookAtCloud())));

export const push = (id: string) => exclusive(() => markBusy([id], () => sendCanvas(id)));

export const pull = (id: string) => exclusive(() => markBusy([id], () => fetchCanvas(id)));

export interface BulkResult {
  done: number;
  failed: { id: string; message: string }[];
}

/** After these the rest would fail the same way, so a bulk action stops instead of trying each. */
const FATAL: SyncErrorKind[] = ['auth', 'password', 'network', 'rate-limit'];

/**
 * Pushes (or pulls) every canvas that can go without overwriting changes: those only changed on this side,
 * or missing on the other. Canvases changed on both sides are left for the user to settle one by one.
 */
export const syncAll = (direction: 'push' | 'pull') =>
  exclusive(() =>
    markBusy('all', async () => {
      const entries = await lookAtCloud();
      const { statuses, cloudOnly } = compareAll(
        await repo.listCanvases(),
        await repo.listSyncRecords(),
        entries,
      );
      const ids =
        direction === 'push'
          ? Object.keys(statuses).filter((id) => pushable(statuses[id]))
          : [...Object.keys(statuses).filter((id) => pullable(statuses[id])), ...cloudOnly.map((c) => c.id)];
      const result: BulkResult = { done: 0, failed: [] };
      for (const id of ids) {
        try {
          await (direction === 'push' ? sendCanvas(id) : fetchCanvas(id));
          result.done++;
        } catch (error) {
          if (!(error instanceof SyncError)) throw error;
          result.failed.push({ id, message: error.message });
          if (FATAL.includes(error.kind)) break;
        }
      }
      return result;
    }),
  );

/** Drops what was learned of the cloud, e.g. after the settings changed. */
export function reset() {
  session = undefined;
  useSync.setState({ entries: null, checkedAt: null, busy: [] });
}
