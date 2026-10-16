import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type ReactFlowProps,
  SelectionMode,
  useReactFlow,
} from '@xyflow/react';
import { type MouseEvent, useEffect, useMemo } from 'react';
import { setAgentView, useAgentStore } from '@/agent';
import { SECTION_Z } from '@/lib/sections';
import type { AppNode } from '@/model/types';
import { nodeTypes } from '@/nodes/nodeTypes';
import { useCanvasStore } from '@/store/canvasStore';
import { useUiStore } from '@/store/uiStore';
import { ContextMenu } from '@/ui/ContextMenu';
import { useClipboard } from './clipboard';
import { useCanvasActions } from './useCanvasActions';
import { useContextMenu } from './useContextMenu';
import { useSearchHighlight } from './useSearch';
import { useSections } from './useSections';
import { useShortcuts } from './useShortcuts';

const proOptions = { hideAttribution: true };

/** Desktop: left-drag selects, middle/right-drag or scroll pans, pinch / Ctrl+scroll zooms. */
const editableProps: Partial<ReactFlowProps<AppNode>> = {
  selectionOnDrag: true,
  selectionMode: SelectionMode.Partial,
  panOnDrag: [1, 2],
  panOnScroll: true,
  deleteKeyCode: ['Delete', 'Backspace'],
  multiSelectionKeyCode: 'Shift',
};

/** Mobile: look, don't touch. */
const readOnlyProps: Partial<ReactFlowProps<AppNode>> = {
  nodesDraggable: false,
  nodesConnectable: false,
  nodesFocusable: false,
  elementsSelectable: false,
  deleteKeyCode: null,
  selectionKeyCode: null,
  multiSelectionKeyCode: null,
  panOnDrag: true,
  zoomOnPinch: true,
};

/** The open canvas. Remount (via `key`) when switching canvases so the stored viewport is applied. */
export function Canvas({ readOnly }: { readOnly: boolean }) {
  const nodes = useCanvasStore((s) => s.nodes);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const theme = useUiStore((s) => s.theme);
  const touched = useAgentStore((s) => s.touched);
  const searched = useSearchHighlight(nodes);
  const sectionHandlers = useSections();
  const displayNodes = useMemo(
    () =>
      searched.map((n) => {
        const node = touched.has(n.id) ? { ...n, className: 'ai-touched' } : n;
        // Sections sit behind everything and only their header takes the pointer, so the canvas
        // underneath (marquee, double-click to add a node, panning) keeps working inside them.
        return node.type === 'section'
          ? {
              ...node,
              zIndex: SECTION_Z,
              dragHandle: '.section-handle',
              style: { pointerEvents: 'none' as const },
            }
          : node;
      }),
    [searched, touched],
  );
  const { addNode } = useCanvasActions();
  const { screenToFlowPosition, fitView } = useReactFlow();

  useEffect(() => {
    setAgentView({
      fitNodes: (ids) =>
        void fitView({ nodes: ids.map((id) => ({ id })), duration: 400, padding: 0.3, maxZoom: 1.2 }),
    });
    return () => setAgentView(null);
  }, [fitView]);
  useShortcuts(readOnly);
  useClipboard(readOnly);
  const { menu, close: closeMenu } = useContextMenu(readOnly);

  const placeNode = (event: MouseEvent) => {
    const target = event.target as Element;
    if (readOnly || !target.classList.contains('react-flow__pane')) return;
    addNode(useUiStore.getState().tool, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  };

  return (
    <>
      <ReactFlow<AppNode>
        nodes={displayNodes}
        nodeTypes={nodeTypes}
        {...sectionHandlers}
        defaultViewport={useCanvasStore.getState().viewport}
        onMoveEnd={(_, viewport) => setViewport(viewport)}
        onDoubleClick={placeNode}
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={4}
        colorMode={theme}
        proOptions={proOptions}
        className={readOnly ? 'read-only' : undefined}
        {...(readOnly ? readOnlyProps : editableProps)}
      >
        <Background variant={BackgroundVariant.Lines} gap={40} />
      </ReactFlow>
      <ContextMenu at={menu?.at ?? null} items={menu?.items ?? []} onClose={closeMenu} />
    </>
  );
}
