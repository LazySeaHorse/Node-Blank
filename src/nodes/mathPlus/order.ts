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

/** Ids in a strongly connected component of more than one node, i.e. on a loop, with the component each is in. */
function loopMembers(remaining: string[], edges: { source: string; target: string }[]): Map<string, number> {
  const out = new Map<string, string[]>();
  for (const e of edges) out.set(e.source, [...(out.get(e.source) ?? []), e.target]);
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const members = new Map<string, number>();
  let counter = 0;
  let components = 0;
  const visit = (v: string) => {
    index.set(v, counter);
    low.set(v, counter);
    counter += 1;
    stack.push(v);
    onStack.add(v);
    for (const w of out.get(v) ?? []) {
      if (!index.has(w)) {
        visit(w);
        low.set(v, Math.min(low.get(v) as number, low.get(w) as number));
      } else if (onStack.has(w)) low.set(v, Math.min(low.get(v) as number, index.get(w) as number));
    }
    if (low.get(v) === index.get(v)) {
      const component: string[] = [];
      for (let w = stack.pop(); w !== undefined; w = stack.pop()) {
        onStack.delete(w);
        component.push(w);
        if (w === v) break;
      }
      if (component.length > 1) {
        components += 1;
        for (const w of component) members.set(w, components);
      }
    }
  };
  for (const v of remaining) if (!index.has(v)) visit(v);
  return members;
}

/**
 * The order to evaluate Math+ nodes in. `ids` arrive in reading order; that stays the order except that a node
 * with a link in waits for its source (Kahn's algorithm, always taking the earliest node in reading order that is
 * ready). Links can form loops: when nothing is ready, the loop is broken at its node earliest in reading order,
 * and only the links into that node from the rest of its loop are `broken` (ignored). Nodes merely waiting on a
 * loop keep their links and simply come after it.
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
      // Stalled: every remaining node waits on another, so a loop exists among them.
      const left = new Set(remaining);
      const waiting = remaining.flatMap((id) =>
        (incoming.get(id) ?? [])
          .filter((l) => left.has(l.source) && !broken.has(l.id))
          .map((l) => ({ source: l.source, target: id })),
      );
      const loop = loopMembers(remaining, waiting);
      const start = remaining.find((id) => loop.has(id)) ?? remaining[0];
      next = start;
      for (const l of incoming.get(start) ?? [])
        if (!done.has(l.source) && loop.get(l.source) === loop.get(start)) broken.add(l.id);
    }
    order.push(next);
    done.add(next);
    remaining = remaining.filter((id) => id !== next);
  }
  return { order, broken };
}
