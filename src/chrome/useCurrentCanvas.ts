import { useLiveQuery } from 'dexie-react-hooks';
import { getCanvas, listCanvases } from '@/persistence/canvasRepo';
import { useWorkspace } from '@/store/workspace';

/** Metadata of the open canvas; live-updates on rename. */
export function useCurrentCanvas() {
  const id = useWorkspace((s) => s.currentId);
  return useLiveQuery(() => (id ? getCanvas(id) : undefined), [id]);
}

/** All canvases, most recent first; live-updates on any change. */
export const useCanvasList = () => useLiveQuery(listCanvases, []);
