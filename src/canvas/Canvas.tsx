import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type ReactFlowProps,
  SelectionMode,
  useReactFlow,
} from '@xyflow/react';
import type { MouseEvent } from 'react';
import type { AppNode } from '@/model/types';
import { nodeTypes } from '@/nodes/nodeTypes';
import { useCanvasStore } from '@/store/canvasStore';
import { useUiStore } from '@/store/uiStore';
import { useCanvasActions } from './useCanvasActions';
import { useSearchHighlight } from './useSearch';
import { useShortcuts } from './useShortcuts';

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
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const theme = useUiStore((s) => s.theme);
  const displayNodes = useSearchHighlight(nodes);
  const { addNode } = useCanvasActions();
  const { screenToFlowPosition } = useReactFlow();
  useShortcuts(readOnly);

  const placeNode = (event: MouseEvent) => {
    const target = event.target as Element;
    if (readOnly || !target.classList.contains('react-flow__pane')) return;
    addNode(useUiStore.getState().tool, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  };

  return (
    <ReactFlow<AppNode>
      nodes={displayNodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      defaultViewport={useCanvasStore.getState().viewport}
      onMoveEnd={(_, viewport) => setViewport(viewport)}
      onDoubleClick={placeNode}
      zoomOnDoubleClick={false}
      minZoom={0.1}
      maxZoom={4}
      colorMode={theme}
      attributionPosition="bottom-left"
      className={readOnly ? 'read-only' : undefined}
      {...(readOnly ? readOnlyProps : editableProps)}
    >
      <Background variant={BackgroundVariant.Lines} gap={40} />
    </ReactFlow>
  );
}
