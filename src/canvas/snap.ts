import type { NodeChange } from '@xyflow/react';
import type { AppNode } from '@/model/types';

/** The canvas grid: the dot spacing, and the step that moving and resizing snap to. */
export const GRID = 24;

/**
 * React Flow snaps a resize by whole grid steps from where the edge started, so a node whose size is off the grid
 * keeps an off-grid edge. Rounding the size up while resizing lands the dragged edge on the dots; up, so it never
 * drops under the node's minimum. Images keep their aspect ratio instead.
 */
export function withSnappedResize(changes: NodeChange<AppNode>[], nodes: AppNode[]): NodeChange<AppNode>[] {
  if (!changes.some((c) => c.type === 'dimensions' && c.resizing)) return changes;
  const images = new Set(nodes.filter((n) => n.type === 'image').map((n) => n.id));
  const up = (v: number) => Math.ceil(v / GRID) * GRID;
  return changes.map((c) =>
    c.type === 'dimensions' && c.resizing && c.dimensions && !images.has(c.id)
      ? { ...c, dimensions: { width: up(c.dimensions.width), height: up(c.dimensions.height) } }
      : c,
  );
}
