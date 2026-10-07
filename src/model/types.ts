import type { Node, Viewport } from '@xyflow/react';

/** Per-kind payload stored in `node.data`. This is the single source of truth for node shapes. */
export type NodeDataMap = {
  text: { markdown: string };
  math: { latex: string };
  mathPlus: { latex: string };
  graph: { functions: string[] };
  table: { cells: string[][] };
  sheet: { cells: string[][] };
  code: { source: string };
  image: { src: string };
  video: { url: string };
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

export interface CanvasContent {
  nodes: AppNode[];
  viewport: Viewport;
}

export const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };
