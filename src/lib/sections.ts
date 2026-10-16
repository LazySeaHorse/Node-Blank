/**
 * Geometry for sections: boxes the user draws around nodes. A node belongs to a section when its
 * centre lies inside the section; nothing is stored per node. Pure, no store or React.
 */
import type { Node, NodeChange, XYPosition } from '@xyflow/react';
import { boundsOf, type Rect } from './clusters';

/** Space between wrapped nodes and the section's edge. */
export const SECTION_PADDING = 24;
/** Extra room at the top for the section's title. */
export const SECTION_HEADER = 40;
/** Sections sit below every ordinary node (React Flow adds 1000 to a selected node). */
export const SECTION_Z = -2000;

type Box = Omit<Rect, 'id'>;

export const containsCentre = (outer: Box, inner: Box) => {
  const cx = inner.x + inner.width / 2;
  const cy = inner.y + inner.height / 2;
  return cx >= outer.x && cx <= outer.x + outer.width && cy >= outer.y && cy <= outer.y + outer.height;
};

/** True when `inner` lies entirely inside `outer`. */
export const encloses = (outer: Box, inner: Box) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

/** Ids of the rects whose centre is inside the section, not counting the section itself. */
export function sectionContents(section: Rect, rects: Rect[]): string[] {
  return rects.filter((r) => r.id !== section.id && containsCentre(section, r)).map((r) => r.id);
}

/** The selected ids plus everything inside any selected section, without duplicates. */
export function expandWithContents(
  selected: Set<string>,
  sectionIds: Set<string>,
  rects: Rect[],
): Set<string> {
  const result = new Set(selected);
  for (const rect of rects)
    if (selected.has(rect.id) && sectionIds.has(rect.id))
      for (const id of sectionContents(rect, rects)) result.add(id);
  return result;
}

/** The box a new section needs to wrap `rects` with padding and room for a title. */
export function wrapBounds(rects: Rect[]): Box {
  const b = boundsOf(rects);
  return {
    x: b.x - SECTION_PADDING,
    y: b.y - SECTION_PADDING - SECTION_HEADER,
    width: b.width + SECTION_PADDING * 2,
    height: b.height + SECTION_PADDING * 2 + SECTION_HEADER,
  };
}

/** Where a dragged section started and where each node inside it started. */
export interface SectionDragSnapshot {
  start: XYPosition;
  members: Map<string, XYPosition>;
}

export function snapshotSectionDrag(section: Rect, rects: Rect[]): SectionDragSnapshot {
  const byId = new Map(rects.map((r) => [r.id, r]));
  const members = new Map<string, XYPosition>();
  for (const id of sectionContents(section, rects)) {
    const r = byId.get(id);
    if (r) members.set(id, { x: r.x, y: r.y });
  }
  return { start: { x: section.x, y: section.y }, members };
}

/**
 * While a section is dragged, adds position changes that move its contents by the same amount.
 * Nodes already being moved by this batch (a multi-selection drag) are left alone.
 */
export function withSectionDrag<N extends Node>(
  changes: NodeChange<N>[],
  snapshots: Map<string, SectionDragSnapshot>,
): NodeChange<N>[] {
  if (snapshots.size === 0) return changes;
  const moved = new Set<string>();
  for (const c of changes) if (c.type === 'position' && c.position) moved.add(c.id);
  const extra: NodeChange<N>[] = [];
  for (const c of changes) {
    if (c.type !== 'position' || !c.position) continue;
    const snap = snapshots.get(c.id);
    if (!snap) continue;
    const dx = c.position.x - snap.start.x;
    const dy = c.position.y - snap.start.y;
    for (const [id, from] of snap.members) {
      if (moved.has(id)) continue;
      extra.push({
        type: 'position',
        id,
        position: { x: from.x + dx, y: from.y + dy },
        dragging: c.dragging,
      });
    }
  }
  return extra.length ? [...changes, ...extra] : changes;
}
