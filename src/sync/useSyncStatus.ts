import { useLiveQuery } from 'dexie-react-hooks';
import { listCanvases, listSyncRecords } from '@/persistence/canvasRepo';
import { useSync } from './engine';
import { type CanvasSync, compareAll } from './status';

/** The sync status of every canvas, or null until the cloud has been checked. Follows edits as they happen. */
export function useSyncStatus(): CanvasSync | null {
  const entries = useSync((s) => s.entries);
  const locals = useLiveQuery(listCanvases, []);
  const records = useLiveQuery(listSyncRecords, []);
  if (!entries || !locals || !records) return null;
  return compareAll(locals, records, entries);
}
