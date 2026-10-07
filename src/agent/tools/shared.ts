import { z } from 'zod';
import type { AppNode, CanvasGroup } from '@/model/types';
import { startNewUndoStep, useCanvasStore } from '@/store/canvasStore';
import { refreshGroups } from '@/store/groups';
import { alias, resolveAlias } from '../aliases';
import { ToolError } from '../errors';

export const handleSchema = z
  .string()
  .min(1)
  .max(64)
  .describe('Node handle such as "n3" (or a full node id).');
export const groupHandleSchema = z.string().min(1).max(64).describe('Group handle such as "g2".');

export const canvasNodes = (): AppNode[] => useCanvasStore.getState().nodes;

export function requireNode(handle: string): AppNode {
  const id = resolveAlias(handle);
  const node = canvasNodes().find((n) => n.id === id);
  if (!node)
    throw new ToolError(
      'node_not_found',
      `No node "${handle}" on this canvas. Use list_nodes or search_nodes to find handles.`,
    );
  return node;
}

/** Fresh groups (recomputed from positions, ids kept) plus a node -> group lookup. */
export function currentGroups(): { groups: CanvasGroup[]; groupOf: Map<string, string> } {
  const groups = refreshGroups();
  const groupOf = new Map<string, string>();
  for (const g of groups) for (const id of g.nodeIds) groupOf.set(id, g.id);
  for (const g of groups) alias(g.id, 'g');
  return { groups, groupOf };
}

export function requireGroup(handle: string, groups: CanvasGroup[]): CanvasGroup {
  const id = resolveAlias(handle);
  const group = groups.find((g) => g.id === id);
  if (!group)
    throw new ToolError(
      'group_not_found',
      `No group "${handle}". Groups change as nodes move; call get_overview for current handles.`,
    );
  return group;
}

/**
 * Runs all of a tool's store writes as one undo step, separate from the user's edits before and
 * after. Synchronous by design: do async work first, then call this.
 */
export function commitAiWrite<T>(fn: () => T): T {
  startNewUndoStep();
  try {
    return fn();
  } finally {
    startNewUndoStep();
  }
}

/** The visible part of the canvas in canvas coordinates. */
export function viewportRect() {
  const { x, y, zoom } = useCanvasStore.getState().viewport;
  const width = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const height = typeof window === 'undefined' ? 800 : window.innerHeight;
  return { x: -x / zoom, y: -y / zoom, width: width / zoom, height: height / zoom };
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
