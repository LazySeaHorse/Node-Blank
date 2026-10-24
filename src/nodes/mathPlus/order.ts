/** A link from one Math+ node into another, as evaluation sees it. */
export interface MathLink {
  id: string;
  source: string;
  target: string;
  /** The variable the source's result is known by in the target. */
  name: string;
}

/**
 * The variable a link passes: its label (without the `$` signs of a formula) when that is a single latin letter
 * other than `e` and `i`, which are numbers; otherwise `ans`.
 */
export function linkVarName(label: string | undefined): string {
  const text = (label ?? '')
    .trim()
    .replace(/^\$(.*)\$$/, '$1')
    .trim();
  return /^[a-zA-Z]$/.test(text) && text !== 'e' && text !== 'i' ? text : 'ans';
}

/**
 * The order to evaluate Math+ nodes in. `ids` arrive in reading order; that stays the order except that a node
 * with a link in waits for its source (Kahn's algorithm, always taking the earliest node in reading order that is
 * ready). Links can form loops: when nothing is ready, the earliest remaining node goes next and the links into it
 * from nodes not yet evaluated are `broken` (ignored, so the loop opens at a predictable place).
 */
export function orderDocuments(
  ids: string[],
  links: Pick<MathLink, 'id' | 'source' | 'target'>[],
): { order: string[]; broken: Set<string> } {
  const known = new Set(ids);
  const incoming = new Map<string, { id: string; source: string }[]>();
  for (const l of links)
    if (l.source !== l.target && known.has(l.source) && known.has(l.target))
      incoming.set(l.target, [...(incoming.get(l.target) ?? []), { id: l.id, source: l.source }]);

  const done = new Set<string>();
  const broken = new Set<string>();
  const order: string[] = [];
  let remaining = ids;
  while (remaining.length > 0) {
    const ready = (id: string) =>
      (incoming.get(id) ?? []).every((l) => done.has(l.source) || broken.has(l.id));
    let next = remaining.find(ready);
    if (next === undefined) {
      next = remaining[0];
      for (const l of incoming.get(next) ?? []) if (!done.has(l.source)) broken.add(l.id);
    }
    order.push(next);
    done.add(next);
    remaining = remaining.filter((id) => id !== next);
  }
  return { order, broken };
}
