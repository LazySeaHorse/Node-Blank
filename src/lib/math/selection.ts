import type { MathfieldElement } from 'mathlive';

/** The slice of MathLive's internal atom and model this patch relies on. */
interface Atom {
  parent?: Atom;
  parentBranch?: unknown;
  leftSibling?: Atom;
}
interface Model {
  at(offset: number): Atom;
  offsetOf(atom: Atom): number;
  extendSelectionTo(anchor: number, position: number): boolean;
  deferNotifications(options: { selection: boolean }, fn: () => void): boolean;
  selection: { ranges: [number, number][] };
  _selection: { ranges: [number, number][]; direction: string };
  __balanced?: true;
}

/** The atom and the structures around it, innermost first, up to (not including) the root. */
function ancestry(atom: Atom): Atom[] {
  const chain: Atom[] = [];
  for (let a: Atom | undefined = atom; a?.parent; a = a.parent) chain.push(a);
  return chain;
}

const sameBranch = (a: Atom, b: Atom) =>
  a.parent === b.parent && JSON.stringify(a.parentBranch) === JSON.stringify(b.parentBranch);

/**
 * Widens `[start, end]` until both ends sit in the same branch: a structure (fraction, root, parentheses...)
 * with one end inside it is taken whole. Ends on different lines of a multi-line field stay on their lines,
 * lifted out of any structure there, so the selection still runs across lines like text.
 */
function balance(model: Model, [start, end]: [number, number]): [number, number] {
  const from = ancestry(model.at(start));
  const to = ancestry(model.at(end));
  const lift = (i: number, j: number): [number, number] => {
    const left = from[i]?.leftSibling;
    return [i === 0 || !left ? start : model.offsetOf(left), j === 0 ? end : model.offsetOf(to[j])];
  };
  for (const [i, a] of from.entries()) {
    const j = to.findIndex((b) => sameBranch(a, b));
    if (j >= 0) return lift(i, j);
  }
  return lift(from.length - 1, to.length - 1);
}

/**
 * MathLive grows a dragged selection to take in a whole fraction, script or accent, but not a square root,
 * parentheses, integral limits or a line break: a drag across one ends with a range that starts at one depth
 * and ends at another, which highlights and copies only part of what the pointer covered. This patches the
 * model, once for every field, so a drag always selects whole structures.
 */
export function balanceDragSelection(field: MathfieldElement) {
  const model = (field as unknown as { _mathfield?: { model?: Model } })._mathfield?.model;
  const proto = model && (Object.getPrototypeOf(model) as Model);
  if (!proto || proto.__balanced || typeof proto.extendSelectionTo !== 'function') return;
  const extend = proto.extendSelectionTo;
  proto.__balanced = true;
  proto.extendSelectionTo = function (this: Model, anchor, position) {
    const changed = extend.call(this, anchor, position);
    const [range] = this.selection.ranges;
    if (!range) return changed;
    const [start, end] = balance(this, range);
    if (start === range[0] && end === range[1]) return changed;
    this.deferNotifications({ selection: true }, () => {
      this._selection = { ranges: [[start, end]], direction: 'none' };
    });
    return true;
  };
}
