import type { XYPosition } from '@xyflow/react';
import type { AppNode, NodeDataMap, NodeKind, NodeOf } from '@/model/types';
import { nodeSpecs } from './catalog';

export const newId = (): string => crypto.randomUUID();

export function createNode<K extends NodeKind>(
  kind: K,
  position: XYPosition,
  data?: Partial<NodeDataMap[K]>,
  size?: { width: number; height: number },
): NodeOf<K> {
  const spec = nodeSpecs[kind];
  const dimensions = size ?? spec.size;
  return {
    id: newId(),
    type: kind,
    position,
    data: { ...spec.defaults(), ...data },
    ...dimensions,
  } as unknown as NodeOf<K>;
}

/** Copies nodes with fresh ids, shifted by `offset`. */
export function cloneNodes(nodes: AppNode[], offset: XYPosition): AppNode[] {
  return nodes.map(
    (node) =>
      ({
        ...stripTransient(node),
        id: newId(),
        position: { x: node.position.x + offset.x, y: node.position.y + offset.y },
        data: structuredClone(node.data),
      }) as AppNode,
  );
}

/** Drops React Flow's runtime-only fields so a node can be saved, exported, or diffed for undo. */
export function stripTransient(node: AppNode): AppNode {
  const { id, type, position, data, width, height } = node;
  return { id, type, position, data, ...(width && height ? { width, height } : {}) } as AppNode;
}

export function searchTextOf(node: AppNode): string {
  const spec = nodeSpecs[node.type] as { searchText: (d: AppNode['data']) => string };
  return spec.searchText(node.data);
}
