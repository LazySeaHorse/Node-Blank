import { type NodeChange, useStoreApi } from '@xyflow/react';
import { useCallback, useEffect, useRef } from 'react';
import { nodeRect } from '@/lib/nodeRect';
import { encloses, type SectionDragSnapshot, snapshotSectionDrag, withSectionDrag } from '@/lib/sections';
import type { AppNode } from '@/model/types';
import { useCanvasStore } from '@/store/canvasStore';

/**
 * Behaviour that makes sections work as boxes: dragging one carries the nodes inside it, and a
 * marquee only keeps a section selected when it surrounds the whole box (otherwise it would grab
 * every section it merely touched).
 */
type Box = { x: number; y: number; width: number; height: number };

export function useSections() {
  const flow = useStoreApi();
  const drags = useRef(new Map<string, SectionDragSnapshot>());

  const startDrag = useCallback((dragged: AppNode[]) => {
    const { nodes } = useCanvasStore.getState();
    const rects = nodes.map(nodeRect);
    drags.current.clear();
    for (const node of dragged) {
      if (node.type !== 'section') continue;
      const rect = rects.find((r) => r.id === node.id);
      if (rect) drags.current.set(node.id, snapshotSectionDrag(rect, rects));
    }
  }, []);
  const endDrag = useCallback(() => drags.current.clear(), []);

  // The marquee's last rectangle in canvas coordinates; React Flow clears its own before the end event.
  const marquee = useRef<Box | null>(null);
  useEffect(
    () =>
      flow.subscribe((state) => {
        const rect = state.userSelectionRect;
        if (!state.userSelectionActive || !rect) return;
        const [tx, ty, zoom] = state.transform;
        marquee.current = {
          x: (rect.x - tx) / zoom,
          y: (rect.y - ty) / zoom,
          width: rect.width / zoom,
          height: rect.height / zoom,
        };
      }),
    [flow],
  );

  const onSelectionEnd = useCallback(() => {
    const box = marquee.current;
    marquee.current = null;
    if (!box) return;
    const { nodes, onNodesChange: apply } = useCanvasStore.getState();
    const grabbed = nodes.filter((n) => n.type === 'section' && n.selected && !encloses(box, nodeRect(n)));
    if (grabbed.length > 0) apply(grabbed.map((n) => ({ type: 'select', id: n.id, selected: false })));
  }, []);

  const onNodesChange = useCallback((changes: NodeChange<AppNode>[]) => {
    useCanvasStore.getState().onNodesChange(withSectionDrag(changes, drags.current));
  }, []);

  return {
    onNodesChange,
    onSelectionEnd,
    onNodeDragStart: (_: unknown, __: AppNode, dragged: AppNode[]) => startDrag(dragged),
    onSelectionDragStart: (_: unknown, dragged: AppNode[]) => startDrag(dragged),
    onNodeDragStop: endDrag,
    onSelectionDragStop: endDrag,
  };
}
