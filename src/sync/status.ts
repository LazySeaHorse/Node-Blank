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
