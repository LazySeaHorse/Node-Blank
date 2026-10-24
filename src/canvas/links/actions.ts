import type { LinkData } from '@/model/types';
import { asUndoStep, useCanvasStore } from '@/store/canvasStore';

/** What the link toolbar and the link menu do. Each edit is its own undo step, however fast they come. */

export const editLink = (id: string, patch: Partial<LinkData>) =>
  asUndoStep(() => useCanvasStore.getState().updateEdgeData(id, patch));

export const swapLink = (id: string) => asUndoStep(() => useCanvasStore.getState().reverseEdge(id));

export const deleteLink = (id: string) => useCanvasStore.getState().deleteElements([], [id]);

/** The colour a link draws in; `undefined` is the automatic one. */
export const linkColor = (color?: string) => `var(--link-${color ?? 'auto'})`;
