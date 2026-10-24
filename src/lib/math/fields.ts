import type { MathfieldElement } from 'mathlive';

/** Each math node's field while it is mounted, for the node's context menu to act on. */
const fields = new Map<string, MathfieldElement>();

/** Makes `field` the one `nodeId`'s menu acts on; returns the unregister. */
export function registerMathField(nodeId: string, field: MathfieldElement) {
  fields.set(nodeId, field);
  return () => {
    if (fields.get(nodeId) === field) fields.delete(nodeId);
  };
}

export const mathFieldOf = (nodeId: string) => fields.get(nodeId);
