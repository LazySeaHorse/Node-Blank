/**
 * Short handles for the agent (n1, n2, g1, ...) in place of 36-character UUIDs, which cost tokens on
 * every mention. Assigned on first sight and stable for the page session. Tools accept either form.
 */

type Kind = 'n' | 'g';

const toAlias = new Map<string, string>();
const toId = new Map<string, string>();
const counters: Record<Kind, number> = { n: 0, g: 0 };

export function alias(id: string, kind: Kind = 'n'): string {
  let a = toAlias.get(id);
  if (!a) {
    a = `${kind}${++counters[kind]}`;
    toAlias.set(id, a);
    toId.set(a, id);
  }
  return a;
}

/** The real id for an alias, or the input unchanged (so real ids work too). */
export const resolveAlias = (handle: string): string => toId.get(handle) ?? handle;

/** For tests. */
export function resetAliases(): void {
  toAlias.clear();
  toId.clear();
  counters.n = 0;
  counters.g = 0;
}
