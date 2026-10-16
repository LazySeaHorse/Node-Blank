/** Ids of sections that were just created and should open their title for editing when they first render. */
const pending = new Set<string>();

export const markRenamePending = (id: string) => void pending.add(id);
export const consumeRenamePending = (id: string) => pending.delete(id);

const requests = new Set<(id: string) => void>();

/** Asks the section with this id to open its title for editing (e.g. from its context menu). */
export function requestRename(id: string): void {
  for (const listener of requests) listener(id);
}
/** Calls `listener` with the id of each section asked to rename; returns the unsubscribe function. */
export function onRenameRequest(listener: (id: string) => void): () => void {
  requests.add(listener);
  return () => void requests.delete(listener);
}
