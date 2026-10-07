import { clusterRects, organiseLayout, type Rect, reconcileGroups } from '@/lib/clusters';
import type { AppNode, CanvasGroup } from '@/model/types';
import { nodeSpecs } from '@/nodes/catalog';
import { newId } from '@/nodes/factory';
import { startNewUndoStep, useCanvasStore } from './canvasStore';

/** Used for content-sized nodes React Flow has not measured yet (e.g. in tests). */
const FALLBACK_SIZE = { width: 240, height: 120 };

/** A node's box on the canvas: its rendered size when known, else its stored or default size. */
export function nodeRect(node: AppNode): Rect {
  const size = nodeSpecs[node.type].size ?? FALLBACK_SIZE;
  return {
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    width: node.measured?.width ?? node.width ?? size.width,
    height: node.measured?.height ?? node.height ?? size.height,
  };
}

/**
 * Recomputes groups from the current node positions without moving anything, keeping the ids of
 * groups that still exist. Saved with the canvas. Returns the groups in reading order.
 */
export function refreshGroups(): CanvasGroup[] {
  const { nodes, groups, setGroups } = useCanvasStore.getState();
  const clusters = clusterRects(nodes.map(nodeRect)).map((c) => c.map((r) => r.id));
  const next = reconcileGroups(groups, clusters, newId);
  setGroups(next);
  return next;
}

/** Packs nearby nodes into tidy groups with even padding, as one undo step, and saves the groups. */
export function organiseCanvas(): void {
  const { nodes, moveNodes } = useCanvasStore.getState();
  const layout = organiseLayout(clusterRects(nodes.map(nodeRect)));
  startNewUndoStep();
  moveNodes(layout);
  startNewUndoStep();
  refreshGroups();
}
