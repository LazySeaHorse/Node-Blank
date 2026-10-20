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
  /** Changed on both sides, or never synced from here though both have it. */
  | 'conflict'
  /** Not in the cloud yet. */
  | 'local-only'
  /** Not on this device yet. */
  | 'cloud-only';

export function compareCanvas(
  local: CanvasMeta | undefined,
  record: SyncRecord | undefined,
  remote: CloudEntry | undefined,
): SyncStatus {
  if (!remote) return 'local-only';
  if (!local) return 'cloud-only';
  const localChanged = !record || local.updatedAt !== record.localUpdatedAt;
  const remoteChanged = !record || remote.rev !== record.rev;
  if (localChanged && remoteChanged) return 'conflict';
  if (localChanged) return 'local-newer';
  return remoteChanged ? 'cloud-newer' : 'synced';
}

/** Whether a bulk push or pull may act on a canvas in this state without asking: anything else could lose changes. */
export const pushable = (status: SyncStatus) => status === 'local-newer' || status === 'local-only';
export const pullable = (status: SyncStatus) => status === 'cloud-newer' || status === 'cloud-only';

export interface CanvasSync {
  /** The status of each canvas on this device. */
  statuses: Record<string, SyncStatus>;
  /** Cloud copies this device does not have, with the entry that describes each. */
  cloudOnly: { id: string; entry: CloudEntry }[];
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
  const cloudOnly = Object.entries(remote)
    .filter(([id]) => !here.has(id))
    .map(([id, entry]) => ({ id, entry }))
    .sort((a, b) => b.entry.updatedAt - a.entry.updatedAt);
  return { statuses, cloudOnly };
}
