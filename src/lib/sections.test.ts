import { describe, expect, it } from 'vitest';
import type { Rect } from './clusters';
import {
  containsCentre,
  encloses,
  expandWithContents,
  SECTION_HEADER,
  SECTION_PADDING,
  sectionContents,
  snapshotSectionDrag,
  withSectionDrag,
  wrapBounds,
} from './sections';

const rect = (id: string, x: number, y: number, width = 100, height = 50): Rect => ({
  id,
  x,
  y,
  width,
  height,
});

describe('sections geometry', () => {
  const section = rect('s', 0, 0, 400, 300);
  const rects = [section, rect('in', 50, 50), rect('edge', 380, 100), rect('out', 500, 0)];

  it('holds nodes whose centre is inside', () => {
    expect(containsCentre(section, rects[1])).toBe(true);
    expect(containsCentre(section, rects[2])).toBe(false); // centre at x=430
    expect(sectionContents(section, rects)).toEqual(['in']);
  });

  it('includes nested sections and their contents', () => {
    const inner = rect('inner', 20, 20, 200, 150);
    const deep = rect('deep', 30, 30);
    expect(sectionContents(section, [section, inner, deep])).toEqual(['inner', 'deep']);
  });

  it('knows when a marquee fully encloses a box', () => {
    expect(encloses(rect('m', -10, -10, 500, 400), section)).toBe(true);
    expect(encloses(rect('m', 10, 10, 500, 400), section)).toBe(false);
  });

  it('expands selected sections with their contents only', () => {
    const result = expandWithContents(new Set(['s']), new Set(['s']), rects);
    expect([...result].sort()).toEqual(['in', 's']);
    expect([...expandWithContents(new Set(['in']), new Set(['s']), rects)]).toEqual(['in']);
  });

  it('wraps with padding and room for the title', () => {
    expect(wrapBounds([rect('a', 100, 100, 100, 50), rect('b', 300, 200, 100, 50)])).toEqual({
      x: 100 - SECTION_PADDING,
      y: 100 - SECTION_PADDING - SECTION_HEADER,
      width: 300 + SECTION_PADDING * 2,
      height: 150 + SECTION_PADDING * 2 + SECTION_HEADER,
    });
  });
});

describe('withSectionDrag', () => {
  const section = rect('s', 0, 0, 400, 300);
  const rects = [section, rect('a', 50, 50), rect('b', 200, 100)];
  const snapshots = new Map([['s', snapshotSectionDrag(section, rects)]]);

  it('moves contents by the same delta as the section', () => {
    const out = withSectionDrag(
      [{ type: 'position', id: 's', position: { x: 30, y: -10 }, dragging: true }],
      snapshots,
    );
    expect(out).toContainEqual({ type: 'position', id: 'a', position: { x: 80, y: 40 }, dragging: true });
    expect(out).toContainEqual({ type: 'position', id: 'b', position: { x: 230, y: 90 }, dragging: true });
  });

  it('does not move nodes that are already part of the same drag', () => {
    const out = withSectionDrag(
      [
        { type: 'position', id: 's', position: { x: 10, y: 0 }, dragging: true },
        { type: 'position', id: 'a', position: { x: 60, y: 50 }, dragging: true },
      ],
      snapshots,
    );
    expect(out.filter((c) => c.type === 'position' && c.id === 'a')).toHaveLength(1);
    expect(out.filter((c) => c.type === 'position' && c.id === 'b')).toHaveLength(1);
  });

  it('ignores resizes and sections that are not being dragged', () => {
    const changes = [{ type: 'dimensions' as const, id: 's', dimensions: { width: 500, height: 300 } }];
    expect(withSectionDrag(changes, snapshots)).toBe(changes);
    const other = [{ type: 'position' as const, id: 'x', position: { x: 1, y: 1 }, dragging: true }];
    expect(withSectionDrag(other, snapshots)).toBe(other);
  });
});
