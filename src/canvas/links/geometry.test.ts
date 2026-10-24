import { describe, expect, it } from 'vitest';
import { GRID } from '../snap';
import {
  type Box,
  endPlacement,
  endScale,
  geom,
  laneOffset,
  lanesOf,
  type Pt,
  readableReverse,
  reversedPath,
  roundedPath,
  route,
  simplify,
  tileRect,
} from './geometry';

const box = (x: number, y: number, w = 240, h = 96): Box => ({ x, y, w, h });
const onGrid = (v: number) => v % GRID === 0;
const orthogonal = (pts: Pt[]) => pts.slice(1).every((p, i) => p[0] === pts[i][0] || p[1] === pts[i][1]);

describe('tileRect', () => {
  it('drops the tab strip', () => {
    expect(tileRect(10, 20, 100, 90)).toEqual({ x: 10, y: 48, w: 100, h: 62 });
  });
});

describe('route', () => {
  const a = box(96, 96);

  it('leaves the facing sides on grid lines, in a Z', () => {
    const b = box(480, 240);
    const pts = route(a, b) as Pt[];
    expect(pts[0][0]).toBe(a.x + a.w);
    expect(pts[pts.length - 1][0]).toBe(b.x);
    expect(orthogonal(pts)).toBe(true);
    expect(pts).toHaveLength(4);
    for (const p of pts.slice(1, -1)) expect(onGrid(p[0]) || onGrid(p[1])).toBe(true);
    expect(onGrid(pts[0][1]) && onGrid(pts[3][1]) && onGrid(pts[1][0])).toBe(true);
  });

  it('is a straight line when both anchors share a row', () => {
    expect(route(a, box(480, 96))).toEqual([
      [336, 144],
      [480, 144],
    ]);
  });

  it('works from every side', () => {
    const c = box(600, 400);
    const up = route(c, box(600, 100)) as Pt[];
    expect(up[0][1]).toBe(c.y);
    expect(up[up.length - 1][1]).toBe(100 + 96);
    const down = route(c, box(600, 800)) as Pt[];
    expect(down[0][1]).toBe(c.y + c.h);
    expect(down[down.length - 1][1]).toBe(800);
    const left = route(c, box(100, 400)) as Pt[];
    expect(left[0][0]).toBe(c.x);
    expect(left[left.length - 1][0]).toBe(100 + 240);
  });

  it('goes the long way when the gap is wider across than down', () => {
    const pts = route(box(0, 0), box(400, 150)) as Pt[];
    expect(pts[0][0]).toBe(240);
  });

  it('turns half way, a cell clear of both sides', () => {
    const pts = route(a, box(96 + 240 + 72, 120)) as Pt[];
    expect(pts[1][0]).toBeGreaterThanOrEqual(336 + GRID);
    expect(pts[1][0]).toBeLessThanOrEqual(408 - GRID);
  });

  it('loops out of the right sides when the boxes overlap', () => {
    const pts = route(a, box(200, 120)) as Pt[];
    expect(orthogonal(pts)).toBe(true);
    expect(pts[0][0]).toBe(a.x + a.w);
    expect(pts[pts.length - 1][0]).toBe(200 + 240);
    expect(Math.max(...pts.map((p) => p[0]))).toBeGreaterThan(440);
  });

  it('copes with coincident centres by using two different rows, or none', () => {
    const pts = route(box(0, 150, 400, 100), box(150, 0, 100, 400)) as Pt[];
    expect(pts).toHaveLength(4);
    expect(pts[0][1]).not.toBe(pts[3][1]);
    // Too short for two rows.
    expect(route(box(0, 0, 100, 30), box(50, 0, 100, 30))).toBeNull();
  });

  it('runs a short line from a box out to the nearest side of the box around it', () => {
    const section = box(0, 0, 600, 400);
    const inner = box(48, 96, 240, 96);
    const out = route(inner, section) as Pt[];
    expect(out[0]).toEqual([48, out[0][1]]);
    expect(out[1]).toEqual([0, out[0][1]]);
    const into = route(section, inner) as Pt[];
    expect(into[0]).toEqual([0, into[0][1]]);
    expect(into[1][0]).toBe(48);
  });

  it('has no line for a box flush inside another', () => {
    expect(route(box(0, 0, 100, 100), box(0, 0, 100, 100))).toBeNull();
  });

  it('shifts parallel links by whole cells', () => {
    const b = box(480, 96);
    const base = route(a, b, 0) as Pt[];
    const next = route(a, b, GRID) as Pt[];
    expect(next[0][1] - base[0][1]).toBe(GRID);
    expect(next.every((p) => onGrid(p[1]) || onGrid(p[0]))).toBe(true);
  });

  it('simplifies collinear points but keeps a fold', () => {
    expect(
      simplify([
        [0, 0],
        [10, 0],
        [20, 0],
      ]),
    ).toEqual([
      [0, 0],
      [20, 0],
    ]);
    expect(
      simplify([
        [0, 0],
        [10, 0],
        [5, 0],
      ]),
    ).toHaveLength(3);
  });
});

describe('rounded path', () => {
  const z: Pt[] = [
    [0, 0],
    [100, 0],
    [100, 100],
    [200, 100],
  ];

  it('rounds each inner corner and keeps the ends', () => {
    expect(roundedPath(z)).toBe('M0 0 L88 0 Q100 0 100 12 L100 88 Q100 100 112 100 L200 100');
  });

  it('shrinks the radius on short segments', () => {
    expect(
      roundedPath([
        [0, 0],
        [10, 0],
        [10, 100],
      ]),
    ).toContain('Q10 0 10 5');
  });

  it('reverses', () => {
    expect(reversedPath(z)).toBe(roundedPath([...z].reverse()));
  });
});

describe('geom', () => {
  it('measures a straight line', () => {
    const g = geom([
      [0, 0],
      [200, 0],
    ]);
    expect(g).toMatchObject({ total: 200, longest: 200, mid: [100, 0], dir: [200, 0], pos: 100 });
  });

  it('picks the longest segment and its distance along the rounded path', () => {
    const g = geom([
      [0, 0],
      [100, 0],
      [100, 400],
      [200, 400],
    ]);
    expect(g.longest).toBe(400);
    expect(g.mid).toEqual([100, 200]);
    expect(g.dir).toEqual([0, 400]);
    // 88 straight, one corner curve, then half of the straight part of the long segment.
    expect(g.pos).toBeGreaterThan(88 + 200 - 12);
    expect(g.pos).toBeLessThan(88 + 200 + 12 + 5);
    expect(g.total).toBeLessThan(600);
    expect(g.total).toBeGreaterThan(560);
  });
});

describe('reading direction', () => {
  it('reverses right-to-left and top-to-bottom, never left-to-right or bottom-to-top', () => {
    expect(readableReverse([10, 0])).toBe(false);
    expect(readableReverse([-10, 0])).toBe(true);
    expect(readableReverse([0, 10])).toBe(true);
    expect(readableReverse([0, -10])).toBe(false);
  });
});

describe('end placement', () => {
  it('points along the last stretch', () => {
    expect(endPlacement([10, 0], [0, 0]).angle).toBe(0);
    expect(endPlacement([0, 10], [0, 0]).angle).toBe(90);
    expect(endPlacement([-10, 0], [0, 0]).angle).toBe(180);
    expect(endPlacement([0, -10], [0, 0]).angle).toBe(-90);
  });
});

describe('lanes', () => {
  it('fans out links between the same pair, either direction', () => {
    const edges = [
      { id: '1', source: 'a', target: 'b' },
      { id: '2', source: 'b', target: 'a' },
      { id: '3', source: 'a', target: 'b' },
      { id: '4', source: 'a', target: 'c' },
    ];
    const lanes = lanesOf(edges);
    expect([...lanes.values()]).toEqual([0, GRID, -GRID, 0]);
    expect(lanesOf(edges)).toBe(lanes);
    expect(laneOffset(3)).toBe(2 * GRID);
    expect(laneOffset(4)).toBe(-2 * GRID);
  });
});

describe('endScale', () => {
  it('keeps a constant screen size, within limits', () => {
    expect(endScale(1)).toBe(1);
    expect(endScale(2)).toBe(0.5);
    expect(endScale(4)).toBe(0.25);
    expect(endScale(0.5)).toBe(2);
    expect(endScale(0.1)).toBe(6);
    expect(endScale(10)).toBe(0.25);
  });
});
