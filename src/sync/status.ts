import type { CanvasMeta } from '@/model/types';
import type { CloudEntry } from './cloud';

/** What a device remembers of its last sync of a canvas: the cloud revision, and the local save that matched it. */
export interface SyncRecord {
  id: string;
  rev: string;
  localUpdatedAt: number;
}

export type SyncStatus =
  | 'synced'
  /** Changed here since the last sync: push. */
  | 'local-newer'
  /** Changed in the cloud since the last sync: pull. */
  | 'cloud-newer'
  /** Changed on both sides, or never synced from here though both have it; or changed here and deleted in the cloud. */
  | 'conflict'
  /** Not in the cloud yet. */
  | 'local-only'
  /** Not on this device yet. */
  | 'cloud-only'
  /** Deleted on this device since the last sync: push to delete it in the cloud, or pull to bring it back. */
  | 'deleted-here'
  /** Deleted in the cloud, and unchanged here since: pull to delete it here, or push to restore it there. */
  | 'deleted-in-cloud'
  /** Deleted on both sides: nothing left to show. */
  | 'gone';

export function compareCanvas(
  local: CanvasMeta | undefined,
  record: SyncRecord | undefined,
  remote: CloudEntry | undefined,
): SyncStatus {
  if (!remote) return 'local-only';
  if (!local) {
    if (remote.deleted) return 'gone';
    // Deleted here only if the cloud copy is still the one that was last synced; if it has moved on, it is news.
    return record?.rev === remote.rev ? 'deleted-here' : 'cloud-only';
  }
  const localChanged = !record || local.updatedAt !== record.localUpdatedAt;
  if (remote.deleted) return localChanged ? 'conflict' : 'deleted-in-cloud';
  const remoteChanged = !record || remote.rev !== record.rev;
  if (localChanged && remoteChanged) return 'conflict';
  if (localChanged) return 'local-newer';
  return remoteChanged ? 'cloud-newer' : 'synced';
}

/** Whether a bulk push or pull may act on a canvas in this state without asking: anything else could lose changes. */
export const pushable = (status: SyncStatus) =>
  status === 'local-newer' || status === 'local-only' || status === 'deleted-here';
export const pullable = (status: SyncStatus) =>
  status === 'cloud-newer' || status === 'cloud-only' || status === 'deleted-in-cloud';

export interface CanvasSync {
  /** The status of each canvas on this device. */
  statuses: Record<string, SyncStatus>;
  /** Cloud copies this device does not have, with the entry that describes each. */
  cloudOnly: { id: string; entry: CloudEntry }[];
  /** Canvases deleted on this device that the cloud still has, as last synced. */
  deletedHere: { id: string; entry: CloudEntry }[];
}

/** Every canvas's status, from what is on this device and the last look at the cloud. */
export function compareAll(
  locals: CanvasMeta[],
  records: SyncRecord[],
  remote: Record<string, CloudEntry>,
): CanvasSync {
  const recordOf = new Map(records.map((r) => [r.id, r]));
  const statuses: Record<string, SyncStatus> = {};
  for (const meta of locals) statuses[meta.id] = compareCanvas(meta, recordOf.get(meta.id), remote[meta.id]);
  const here = new Set(locals.map((m) => m.id));
  const cloudOnly: CanvasSync['cloudOnly'] = [];
  const deletedHere: CanvasSync['deletedHere'] = [];
  for (const [id, entry] of Object.entries(remote)) {
    if (here.has(id)) continue;
    const status = compareCanvas(undefined, recordOf.get(id), entry);
    if (status === 'cloud-only') cloudOnly.push({ id, entry });
    else if (status === 'deleted-here') deletedHere.push({ id, entry });
  }
  const newestFirst = (a: { entry: CloudEntry }, b: { entry: CloudEntry }) =>
    b.entry.updatedAt - a.entry.updatedAt;
  return { statuses, cloudOnly: cloudOnly.sort(newestFirst), deletedHere: deletedHere.sort(newestFirst) };
}
