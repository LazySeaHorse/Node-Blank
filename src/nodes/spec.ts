import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';
import type { NodeDataMap, NodeKind } from '@/model/types';

/**
 * Everything the app needs to know about a node kind, minus its React component.
 * Kept component-free so stores and persistence can use it without importing UI.
 */
export interface NodeSpec<K extends NodeKind> {
  kind: K;
  label: string;
  description: string;
  icon: LucideIcon;
  /**
   * `place`: becomes the active tool and is created by double-clicking the canvas. `insert`: needs input first.
   * `wrap`: made around the selected nodes (Ctrl+G), never from the toolbar.
   */
  placement: 'place' | 'insert' | 'wrap';
  /** Whether this browser can use the kind. Unavailable kinds are left out of the insert menus. Omitted: always. */
  available?: () => boolean;
  schema: z.ZodType<NodeDataMap[K]>;
  defaults: () => NodeDataMap[K];
  /** Fixed starting size for resizable nodes; omitted nodes size to their content. */
  size?: { width: number; height: number };
  searchText: (data: NodeDataMap[K]) => string;
}

/** Height of the tab at the top of every node's box. The node's content sits below it. */
export const NODE_TAB_HEIGHT = 28;

/** The optional `title` every node but a section has in its data. */
export const titleField = z.string().max(200).optional();
