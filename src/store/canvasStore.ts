import { applyNodeChanges, type NodeChange, type Viewport, type XYPosition } from '@xyflow/react';
import isEqual from 'fast-deep-equal';
import { temporal } from 'zundo';
import { create } from 'zustand';
import {
  type AppNode,
  type CanvasContent,
  type CanvasGroup,
  DEFAULT_VIEWPORT,
  type NodeDataMap,
  type NodeKind,
} from '@/model/types';
import { cloneNodes, stripTransient } from '@/nodes/factory';

/** Burst of edits closer together than this collapses into a single undo step. */
const HISTORY_COALESCE_MS = 400;
const DUPLICATE_OFFSET = { x: 30, y: 30 };

export interface CanvasState {
  nodes: AppNode[];
  viewport: Viewport;
  /** Not undoable: groups are derived from positions and refreshed whenever they are needed. */
  groups: CanvasGroup[];
  onNodesChange: (changes: NodeChange<AppNode>[]) => void;
  setViewport: (viewport: Viewport) => void;
  addNodes: (nodes: AppNode[]) => void;
  updateNodeData: <K extends NodeKind>(id: string, patch: Partial<NodeDataMap[K]>) => void;
  duplicateSelected: () => void;
  clear: () => void;
  setGroups: (groups: CanvasGroup[]) => void;
  /** Moves nodes to new positions in one update. */
  moveNodes: (positions: Map<string, XYPosition>) => void;
  load: (content: CanvasContent) => void;
}

/**
 * Edits arriving within HISTORY_COALESCE_MS of the previous one extend the current undo step instead of
 * starting a new one, so typing a word or dragging a node is a single undo.
 */
let lastEditAt = Number.NEGATIVE_INFINITY;
const startNewUndoStep = () => {
  lastEditAt = Number.NEGATIVE_INFINITY;
};

const deselect = (nodes: AppNode[]) => nodes.map((n) => (n.selected ? { ...n, selected: false } : n));

export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      viewport: DEFAULT_VIEWPORT,
      groups: [],

      onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),

      setViewport: (viewport) => set({ viewport }),

      addNodes: (nodes) =>
        set({ nodes: [...deselect(get().nodes), ...nodes.map((n) => ({ ...n, selected: true }))] }),

      updateNodeData: (id, patch) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? ({ ...n, data: { ...n.data, ...patch } } as AppNode) : n,
          ),
        }),

      duplicateSelected: () => {
        const selected = get().nodes.filter((n) => n.selected);
        if (selected.length > 0) get().addNodes(cloneNodes(selected, DUPLICATE_OFFSET));
      },

      clear: () => set({ nodes: [] }),

      setGroups: (groups) => set({ groups }),

      moveNodes: (positions) =>
        set({
          nodes: get().nodes.map((n) => {
            const position = positions.get(n.id);
            return position ? { ...n, position } : n;
          }),
        }),

      load: ({ nodes, viewport, groups = [] }) => {
        set({ nodes, viewport, groups });
        useCanvasStore.temporal.getState().clear();
        startNewUndoStep();
      },
    }),
    {
      // Only node content is undoable: selection, measurement and the viewport are not.
      partialize: (state) => ({ nodes: state.nodes.map(stripTransient) }),
      equality: isEqual,
      handleSet: (handleSet) => (pastState, replace) => {
        const now = Date.now();
        if (now - lastEditAt > HISTORY_COALESCE_MS) handleSet(pastState, replace as false);
        lastEditAt = now;
      },
      limit: 200,
    },
  ),
);

/** Makes the next content change its own undo step instead of extending the current one. */
export { startNewUndoStep };

export const undo = () => {
  useCanvasStore.temporal.getState().undo();
  startNewUndoStep();
};
export const redo = () => {
  useCanvasStore.temporal.getState().redo();
  startNewUndoStep();
};

/** Snapshot of the open canvas in its persisted form. */
export function getCanvasContent(): CanvasContent {
  const { nodes, viewport, groups } = useCanvasStore.getState();
  return { nodes: nodes.map(stripTransient), viewport, ...(groups.length > 0 ? { groups } : {}) };
}
