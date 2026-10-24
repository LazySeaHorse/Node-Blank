import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  type NodeChange,
  ReactFlow,
  type ReactFlowProps,
  SelectionMode,
  useKeyPress,
  useReactFlow,
} from '@xyflow/react';
import { type CSSProperties, type DragEvent, type MouseEvent, useCallback, useEffect, useMemo } from 'react';
import { setAgentView, useAgentStore } from '@/agent';
import { cn } from '@/lib/cn';
import { SECTION_Z } from '@/lib/sections';
import type { AppNode } from '@/model/types';
import { nodeSpecs } from '@/nodes/catalog';
import { nodeTypes } from '@/nodes/nodeTypes';
import { dragHasPdf } from '@/nodes/pdf/drop';
import { useCanvasStore } from '@/store/canvasStore';
import { useUiStore } from '@/store/uiStore';
import { ContextMenu } from '@/ui/ContextMenu';
import { useClipboard } from './clipboard';
import { edgeTypes } from './links/LinkEdge';
import { GRID, withSnappedResize } from './snap';
import { useCanvasActions } from './useCanvasActions';
import { useContextMenu } from './useContextMenu';
import { useSearchEdges, useSearchHighlight } from './useSearch';
import { useSections } from './useSections';
import { useShortcuts } from './useShortcuts';
import { useZoomTier } from './zoomTier';

const proOptions = { hideAttribution: true };
/** Diameter of a background dot. */
const DOT = 1.5;

/** Desktop: left-drag selects, middle/right-drag or Shift+scroll pans, scroll / pinch zooms. */
const editableProps: Partial<ReactFlowProps<AppNode>> = {
  selectionOnDrag: true,
  selectionMode: SelectionMode.Partial,
  panOnDrag: [1, 2],
  deleteKeyCode: ['Delete', 'Backspace'],
  // Nodes only connect in linking mode (see below); the invisible handle on each would otherwise take every click.
  nodesConnectable: false,
  multiSelectionKeyCode: 'Shift',
  snapToGrid: true,
  snapGrid: [GRID, GRID],
  // Arrow keys would otherwise nudge the selected nodes.
  disableKeyboardA11y: true,
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
  const edges = useCanvasStore((s) => s.edges);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const theme = useUiStore((s) => s.theme);
  const touched = useAgentStore((s) => s.touched);
  const searched = useSearchHighlight(nodes);
  const displayEdges = useSearchEdges(edges, nodes);
  const multipleSelected = useMemo(() => nodes.filter((n) => n.selected).length > 1, [nodes]);
  const sectionHandlers = useSections();
  const { onNodesChange: applyChanges } = sectionHandlers;
  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) =>
      applyChanges(withSnappedResize(changes, useCanvasStore.getState().nodes)),
    [applyChanges],
  );
  const { tier, scale } = useZoomTier();
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
  // Figma-style wheel: scroll zooms, holding Shift pans instead.
  const panningScroll = useKeyPress('Shift');
  const { addNode, dropPdfs } = useCanvasActions();
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

  // Only kinds this browser supports take drops, so other browsers keep their default for dragged files.
  const pdfDroppable = (event: DragEvent) =>
    !readOnly && nodeSpecs.pdf.available?.() !== false && dragHasPdf(event.dataTransfer);
  const onDragOver = (event: DragEvent) => {
    if (!pdfDroppable(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };
  const onDrop = (event: DragEvent) => {
    if (!pdfDroppable(event)) return;
    event.preventDefault();
    void dropPdfs(event.dataTransfer, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  };

  return (
    <>
      <ReactFlow<AppNode>
        nodes={displayNodes}
        nodeTypes={nodeTypes}
        edges={displayEdges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Loose}
        edgesReconnectable={false}
        {...sectionHandlers}
        onNodesChange={onNodesChange}
        defaultViewport={useCanvasStore.getState().viewport}
        onMoveEnd={(_, viewport) => setViewport(viewport)}
        onDoubleClick={placeNode}
        onDragOver={onDragOver}
        onDrop={onDrop}
        zoomOnDoubleClick={false}
        zoomOnScroll={!panningScroll}
        panOnScroll={panningScroll}
        minZoom={0.1}
        maxZoom={4}
        colorMode={theme}
        proOptions={proOptions}
        className={cn(readOnly && 'read-only', multipleSelected && 'multi-select')}
        data-zoom={tier}
        style={{ '--tz': scale } as CSSProperties}
        {...(readOnly ? readOnlyProps : editableProps)}
      >
        {/* Offset so the dots sit on the grid lines that nodes snap to. */}
        <Background variant={BackgroundVariant.Dots} gap={GRID} size={DOT} offset={(DOT - GRID) / 2} />
      </ReactFlow>
      <ContextMenu at={menu?.at ?? null} items={menu?.items ?? []} onClose={closeMenu} />
    </>
  );
}
