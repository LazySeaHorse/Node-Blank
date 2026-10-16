import type { Node, Viewport } from '@xyflow/react';

/** Pastel fills for sections and node backgrounds; each theme maps the names to colours (see index.css). */
export const SECTION_COLORS = ['yellow', 'green', 'blue', 'purple', 'pink', 'orange', 'gray'] as const;
export type SectionColor = (typeof SECTION_COLORS)[number];

/** Per-kind payload stored in `node.data`. This is the single source of truth for node shapes. */
export type NodeDataMap = {
  text: { markdown: string };
  math: { latex: string; color?: SectionColor };
  mathPlus: { latex: string; color?: SectionColor };
  graph: { functions: string[] };
  table: { cells: string[][] };
  sheet: { cells: string[][] };
  code: { source: string };
  image: { src: string };
  video: { url: string };
  section: { title: string; color: SectionColor };
};

export type NodeKind = keyof NodeDataMap;
/** Distributes over unions, so `NodeOf<NodeKind>` is the union of every node type. */
export type NodeOf<K extends NodeKind> = K extends NodeKind ? Node<NodeDataMap[K], K> : never;
export type AppNode = NodeOf<NodeKind>;

export interface CanvasMeta {
  id: string;
  name: string;
  updatedAt: number;
}

/**
 * Nodes that sit close together. Groups are invisible: they are recomputed from node positions
 * (by Organise and by the AI tools) and saved so their ids stay stable between sessions.
 */
export interface CanvasGroup {
  id: string;
  nodeIds: string[];
}

export interface CanvasContent {
  nodes: AppNode[];
  viewport: Viewport;
  /** Omitted until the canvas has been organised or read by an AI agent. */
  groups?: CanvasGroup[];
}

export const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };
