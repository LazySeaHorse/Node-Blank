import type { Node, Viewport } from '@xyflow/react';

/** Pastel fills for sections and node backgrounds; each theme maps the names to colours (see index.css). */
export const SECTION_COLORS = ['yellow', 'green', 'blue', 'purple', 'pink', 'orange', 'gray'] as const;
export type SectionColor = (typeof SECTION_COLORS)[number];

/** Optional name every node but a section can carry. Headed nodes show their kind until one is set. */
export type Titled = { title?: string };

/** Per-kind payload stored in `node.data`. This is the single source of truth for node shapes. */
export type NodeDataMap = {
  text: Titled & {
    markdown: string;
    /** Set once the "this is only a table / only math" offer has been waved away. */
    suggestionDismissed?: boolean;
  };
  math: Titled & { latex: string; color?: SectionColor };
  mathPlus: Titled & { latex: string; color?: SectionColor };
  graph: Titled & { functions: string[] };
  table: Titled & { cells: string[][] };
  sheet: Titled & {
    cells: string[][];
    /** Keeps numbers as exact fractions: `1/3` is a number and row operations write fractions. */
    fractions?: boolean;
    /** Cell fill by A1 reference, e.g. `{ B2: 'yellow' }`. */
    fills?: Record<string, SectionColor>;
  };
  code: Titled & { source: string };
  image: Titled & { src: string };
  video: Titled & { url: string };
  /** A live web page in an iframe. `url` follows the page as it navigates; `pageTitle` is its last reported title. */
  web: Titled & { url: string; pageTitle?: string };
  /** Links a PDF on the user's disk. Only metadata is stored here; the file handle lives in the `pdfFiles` table. */
  pdf: Titled & {
    /** Key into the `pdfFiles` table. */
    fileId: string;
    fileName: string;
    /** 1-based page numbers shown on the node, sorted and unique. The cover is shown instead while this is empty. */
    pinned: number[];
    /** Which way the filmstrip runs; `row` when omitted. */
    direction?: 'row' | 'column';
    /** Last seen in the file, to notice when it changed on disk. */
    pageCount?: number;
    lastModified?: number;
    size?: number;
  };
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
