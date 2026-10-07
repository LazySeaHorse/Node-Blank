import { useCallback } from 'react';
import type { NodeDataMap, NodeKind } from '@/model/types';
import { useCanvasStore } from '@/store/canvasStore';

/** Returns a setter that merges a patch into one node's data. */
export function useUpdateNodeData<K extends NodeKind>(id: string) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  return useCallback((patch: Partial<NodeDataMap[K]>) => updateNodeData<K>(id, patch), [id, updateNodeData]);
}
