import {
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeChange,
  type NodeChange,
  type Viewport,
  type XYPosition,
} from '@xyflow/react';
import isEqual from 'fast-deep-equal';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { cloneGraph, findLink, normaliseLinkData, sanitizeEdges, stripEdge } from '@/lib/links';
import { nodeRect } from '@/lib/nodeRect';
import { expandWithContents } from '@/lib/sections';
import {
  type AppEdge,
  type AppNode,
  type CanvasContent,
  type CanvasGroup,
  DEFAULT_VIEWPORT,
  type LinkData,
  type NodeDataMap,
  type NodeKind,
} from '@/model/types';
import { newId, stripTransient } from '@/nodes/factory';

/** Burst of edits closer together than this collapses into a single undo step. */
const HISTORY_COALESCE_MS = 400;
const DUPLICATE_OFFSET = { x: 30, y: 30 };

export interface CanvasState {
  nodes: AppNode[];
  /** Links between nodes. Undoable together with the nodes. */
  edges: AppEdge[];
  viewport: Viewport;
  /** Not undoable: groups are derived from positions and refreshed whenever they are needed. */
  groups: CanvasGroup[];
  onNodesChange: (changes: NodeChange<AppNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<AppEdge>[]) => void;
  /**
   * Selects exactly the nodes `pickNode` returns true for, and the links `pickEdge` does (given the ids of the
   * selected nodes); no link stays selected when `pickEdge` is omitted.
   */
  setSelection: (
    pickNode: (node: AppNode) => boolean,
    pickEdge?: (edge: AppEdge, selectedNodeIds: ReadonlySet<string>) => boolean,
  ) => void;
  setViewport: (viewport: Viewport) => void;
  /** Adds nodes (and the links among them) selected; every other node and link is deselected. */
  addNodes: (nodes: AppNode[], edges?: AppEdge[]) => void;
  updateNodeData: <K extends NodeKind>(id: string, patch: Partial<NodeDataMap[K]>) => void;
  duplicateSelected: () => void;
  /**
   * Links `source` to `target` as one undo step and selects only the new link. Returns its id, or null when
   * a node is missing, both ends are the same, or the link already exists (which is then selected instead).
   */
  linkNodes: (source: string, target: string, data?: LinkData) => string | null;
  updateEdgeData: (id: string, patch: Partial<LinkData>) => void;
  /** Swaps a link's ends; its head stays at the target, so the arrow now points the other way. */
  reverseEdge: (id: string) => void;
  /** Removes nodes and links as one undo step. Links to a removed node go with it. A section's contents stay. */
  deleteElements: (nodeIds: string[], edgeIds: string[]) => void;
  /** Removes nodes as one undo step; a section's contents stay. */
  deleteNodes: (ids: string[]) => void;
  deleteSelected: () => void;
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

/**
 * Runs `fn`'s store writes as one undo step, separate from the edits before and after.
 * Synchronous by design: do async work first, then call this.
 */
export function asUndoStep<T>(fn: () => T): T {
  startNewUndoStep();
  try {
    return fn();
  } finally {
    startNewUndoStep();
  }
}

const deselect = (nodes: AppNode[]) => nodes.map((n) => (n.selected ? { ...n, selected: false } : n));
const deselectEdges = (edges: AppEdge[]) => edges.map((e) => (e.selected ? { ...e, selected: false } : e));

export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      viewport: DEFAULT_VIEWPORT,
      groups: [],

      onNodesChange: (changes) => {
        const nodes = applyNodeChanges(changes, get().nodes);
        // Removals normally come through deleteElements; this keeps links from dangling if one slips by.
        const gone = changes.flatMap((c) => (c.type === 'remove' ? [c.id] : []));
        const { edges } = get();
        const kept =
          gone.length > 0 ? edges.filter((e) => !gone.includes(e.source) && !gone.includes(e.target)) : edges;
        set(kept.length === edges.length ? { nodes } : { nodes, edges: kept });
      },

      onEdgesChange: (changes) => {
        const removed = changes.flatMap((c) => (c.type === 'remove' ? [c.id] : []));
        const rest = changes.filter((c) => c.type !== 'remove');
        if (rest.length > 0) set({ edges: applyEdgeChanges(rest, get().edges) });
        if (removed.length > 0) get().deleteElements([], removed);
      },

      setSelection: (pickNode, pickEdge) => {
        const { nodes, edges } = get();
        const nodesSame = nodes.every((n) => !!n.selected === pickNode(n));
        const picked = new Set(nodes.flatMap((n) => (pickNode(n) ? [n.id] : [])));
        const wantEdge = (e: AppEdge) => pickEdge?.(e, picked) ?? false;
        const edgesSame = edges.every((e) => !!e.selected === wantEdge(e));
        if (nodesSame && edgesSame) return;
        set({
          ...(nodesSame
            ? {}
            : {
                nodes: nodes.map(
                  (n) => (!!n.selected === pickNode(n) ? n : { ...n, selected: !n.selected }) as AppNode,
                ),
              }),
          ...(edgesSame
            ? {}
            : {
                edges: edges.map(
                  (e) => (!!e.selected === wantEdge(e) ? e : { ...e, selected: !e.selected }) as AppEdge,
                ),
              }),
        });
      },

      setViewport: (viewport) => set({ viewport }),

      // Sections go first so they render behind everything else.
      addNodes: (nodes, edges = []) => {
        const added = nodes.map((n) => ({ ...n, selected: true }));
        const isSection = (n: AppNode) => n.type === 'section';
        set({
          nodes: [
            ...added.filter(isSection),
            ...deselect(get().nodes),
            ...added.filter((n) => !isSection(n)),
          ],
          edges: [...deselectEdges(get().edges), ...edges.map((e) => ({ ...e, selected: true }))],
        });
      },

      updateNodeData: (id, patch) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? ({ ...n, data: { ...n.data, ...patch } } as AppNode) : n,
          ),
        }),

      duplicateSelected: () => {
        const { nodes, edges } = get();
        // Duplicating a section takes the nodes inside it along.
        const ids = expandWithContents(
          new Set(nodes.filter((n) => n.selected).map((n) => n.id)),
          new Set(nodes.filter((n) => n.type === 'section').map((n) => n.id)),
          nodes.map(nodeRect),
        );
        const selected = nodes.filter((n) => ids.has(n.id));
        if (selected.length === 0) return;
        const copy = cloneGraph(selected, edges, DUPLICATE_OFFSET);
        get().addNodes(copy.nodes, copy.edges);
      },

      linkNodes: (source, target, data) => {
        const { nodes, edges } = get();
        if (source === target) return null;
        if (!nodes.some((n) => n.id === source) || !nodes.some((n) => n.id === target)) return null;
        const existing = findLink(edges, source, target);
        if (existing) {
          get().setSelection(
            () => false,
            (e) => e.id === existing.id,
          );
          return null;
        }
        const id = newId();
        const look = normaliseLinkData(data);
        asUndoStep(() =>
          set({
            nodes: deselect(nodes),
            edges: [
              ...deselectEdges(edges),
              { id, source, target, selected: true, ...(look ? { data: look } : {}) },
            ],
          }),
        );
        return id;
      },

      updateEdgeData: (id, patch) =>
        set({
          edges: get().edges.map((e) => {
            if (e.id !== id) return e;
            const data = normaliseLinkData({ ...e.data, ...patch });
            const { data: _old, ...rest } = e;
            return data ? { ...rest, data } : rest;
          }),
        }),

      reverseEdge: (id) =>
        set({
          edges: get().edges.map((e) => (e.id === id ? { ...e, source: e.target, target: e.source } : e)),
        }),

      deleteElements: (nodeIds, edgeIds) => {
        const doomed = new Set(nodeIds);
        const doomedEdges = new Set(edgeIds);
        asUndoStep(() =>
          set({
            nodes: get().nodes.filter((n) => !doomed.has(n.id)),
            edges: get().edges.filter(
              (e) => !doomedEdges.has(e.id) && !doomed.has(e.source) && !doomed.has(e.target),
            ),
          }),
        );
      },

      deleteNodes: (ids) => get().deleteElements(ids, []),

      deleteSelected: () => {
        const { nodes, edges } = get();
        get().deleteElements(
          nodes.flatMap((n) => (n.selected ? [n.id] : [])),
          edges.flatMap((e) => (e.selected ? [e.id] : [])),
        );
      },

      clear: () => set({ nodes: [], edges: [] }),

      setGroups: (groups) => set({ groups }),

      moveNodes: (positions) =>
        set({
          nodes: get().nodes.map((n) => {
            const position = positions.get(n.id);
            return position ? { ...n, position } : n;
          }),
        }),

      load: ({ nodes, edges = [], viewport, groups = [] }) => {
        set({
          nodes,
          edges: sanitizeEdges(
            edges,
            nodes.map((n) => n.id),
          ),
          viewport,
          groups,
        });
        useCanvasStore.temporal.getState().clear();
        startNewUndoStep();
      },
    }),
    {
      // Only node and link content is undoable: selection, measurement and the viewport are not.
      partialize: (state) => ({ nodes: state.nodes.map(stripTransient), edges: state.edges.map(stripEdge) }),
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
  const { nodes, edges, viewport, groups } = useCanvasStore.getState();
  return {
    nodes: nodes.map(stripTransient),
    viewport,
    ...(groups.length > 0 ? { groups } : {}),
    ...(edges.length > 0 ? { edges: edges.map(stripEdge) } : {}),
  };
}
