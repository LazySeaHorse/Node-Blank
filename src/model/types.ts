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
export type NodeOf<K extends NodeKind> = Node<NodeDataMap[K], K>;
export type AppNode = { [K in NodeKind]: NodeOf<K> }[NodeKind];

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
