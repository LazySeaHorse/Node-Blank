/** Ids of sections that were just created and should open their title for editing when they first render. */
const pending = new Set<string>();

export const markRenamePending = (id: string) => void pending.add(id);
export const consumeRenamePending = (id: string) => pending.delete(id);
