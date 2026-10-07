import type { LucideIcon } from 'lucide-react';
import type { z } from 'zod';
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
  /** `place`: becomes the active tool and is created by double-clicking the canvas. `insert`: needs input first. */
  placement: 'place' | 'insert';
  schema: z.ZodType<NodeDataMap[K]>;
  defaults: () => NodeDataMap[K];
  /** Fixed starting size for resizable nodes; omitted nodes size to their content. */
  size?: { width: number; height: number };
  searchText: (data: NodeDataMap[K]) => string;
}
