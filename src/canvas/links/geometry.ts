import type { AppEdge } from '@/model/types';
import { NODE_TAB_HEIGHT } from '@/nodes/spec';
import { GRID } from '../snap';

/** Pure geometry for links: orthogonal "pipes" that follow the canvas grid. Nothing here touches React. */

export type Pt = readonly [number, number];
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Corner radius of a pipe. */
export const CORNER = 12;
/** Links shorter than this (along the path) show no label. */
export const MIN_LABEL_PATH = 56;

const snap = (v: number) => Math.round(v / GRID) * GRID;
const ceilGrid = (v: number) => Math.ceil(v / GRID) * GRID;
const floorGrid = (v: number) => Math.floor(v / GRID) * GRID;

/** The part of a node's box links attach to: everything under the tab strip. */
export const tileRect = (x: number, y: number, width: number, height: number): Box => ({
  x,
  y: y + NODE_TAB_HEIGHT,
  w: width,
  h: Math.max(0, height - NODE_TAB_HEIGHT),
});

/**
 * A grid line across the side [lo, hi] to leave or enter by: the one nearest the middle, shifted by the lane
 * `off`, and kept a corner radius clear of the ends. Short sides have no such line and use their middle.
 */
function anchor(lo: number, hi: number, off: number): number {
  const min = ceilGrid(lo + CORNER);
  const max = floorGrid(hi - CORNER);
  if (min > max) return (lo + hi) / 2;
  return Math.max(min, Math.min(max, snap((lo + hi) / 2) + off));
}

/** The grid line between two parallel sides where a Z turns, kept a full cell clear of both. */
function turn(lo: number, hi: number, off: number): number {
  const min = ceilGrid(lo + GRID);
  const max = floorGrid(hi - GRID);
  if (min > max) return (lo + hi) / 2;
  return Math.max(min, Math.min(max, snap((lo + hi) / 2) + off));
}

/** Drops repeated points and the middle of three in a row heading the same way. A turn back on itself stays. */
export function simplify(points: Pt[]): Pt[] {
  const out: Pt[] = [points[0]];
  for (const q of points.slice(1)) {
    const l = out[out.length - 1];
    if (q[0] === l[0] && q[1] === l[1]) continue;
    if (out.length >= 2) {
      const a = out[out.length - 2];
      const same = (a[0] === l[0] && l[0] === q[0]) || (a[1] === l[1] && l[1] === q[1]);
      const forward = (l[0] - a[0]) * (q[0] - l[0]) + (l[1] - a[1]) * (q[1] - l[1]) > 0;
      if (same && forward) {
        out[out.length - 1] = q;
        continue;
      }
    }
    out.push(q);
  }
  return out;
}

const inside = (outer: Box, inner: Box) =>
  outer.x <= inner.x &&
  outer.y <= inner.y &&
  outer.x + outer.w >= inner.x + inner.w &&
  outer.y + outer.h >= inner.y + inner.h;

/** A box inside another (a node in its section): a short line from the inner box out to the nearest outer side. */
function routeContained(outer: Box, inner: Box, innerFirst: boolean): Pt[] | null {
  const gaps = [
    { side: 'left', gap: inner.x - outer.x },
    { side: 'right', gap: outer.x + outer.w - (inner.x + inner.w) },
    { side: 'top', gap: inner.y - outer.y },
    { side: 'bottom', gap: outer.y + outer.h - (inner.y + inner.h) },
  ]
    .filter((g) => g.gap >= CORNER)
    .sort((a, b) => a.gap - b.gap);
  const nearest = gaps[0];
  if (!nearest) return null;
  let line: Pt[];
  if (nearest.side === 'left' || nearest.side === 'right') {
    const y = anchor(inner.y, inner.y + inner.h, 0);
    const from = nearest.side === 'left' ? inner.x : inner.x + inner.w;
    const to = nearest.side === 'left' ? outer.x : outer.x + outer.w;
    line = [
      [from, y],
      [to, y],
    ];
  } else {
    const x = anchor(inner.x, inner.x + inner.w, 0);
    const from = nearest.side === 'top' ? inner.y : inner.y + inner.h;
    const to = nearest.side === 'top' ? outer.y : outer.y + outer.h;
    line = [
      [x, from],
      [x, to],
    ];
  }
  return innerFirst ? line : line.reverse();
}

/**
 * The corner points of the pipe from box `a` to box `b`, or null when they leave no room for one. `off` shifts
 * it sideways by a multiple of the grid so parallel links between the same pair do not overlap.
 * Side by side: out of the facing sides, one Z turn between them. Above/below: the same, turned. Touching or
 * overlapping: out of both right sides and round. One inside the other: a short line out to the nearest side.
 */
export function route(a: Box, b: Box, off = 0): Pt[] | null {
  if (inside(a, b)) return routeContained(a, b, false);
  if (inside(b, a)) return routeContained(b, a, true);

  const toRight = b.x - (a.x + a.w);
  const toLeft = a.x - (b.x + b.w);
  const below = b.y - (a.y + a.h);
  const above = a.y - (b.y + b.h);
  const hgap = Math.max(toRight, toLeft);
  const vgap = Math.max(below, above);

  if (hgap >= GRID && hgap >= vgap) {
    const right = toRight >= toLeft;
    const x0 = right ? a.x + a.w : a.x;
    const x3 = right ? b.x : b.x + b.w;
    const y0 = anchor(a.y, a.y + a.h, off);
    const y3 = anchor(b.y, b.y + b.h, off);
    const mid = turn(Math.min(x0, x3), Math.max(x0, x3), off);
    return simplify([
      [x0, y0],
      [mid, y0],
      [mid, y3],
      [x3, y3],
    ]);
  }
  if (vgap >= GRID) {
    const down = below >= above;
    const y0 = down ? a.y + a.h : a.y;
    const y3 = down ? b.y : b.y + b.h;
    const x0 = anchor(a.x, a.x + a.w, off);
    const x3 = anchor(b.x, b.x + b.w, off);
    const mid = turn(Math.min(y0, y3), Math.max(y0, y3), off);
    return simplify([
      [x0, y0],
      [x0, mid],
      [x3, mid],
      [x3, y3],
    ]);
  }

  // Overlapping or touching: out of both right sides and round. The two ends need different rows or the
  // pipe would fold onto itself.
  const x = Math.max(a.x + a.w, b.x + b.w) + GRID + Math.abs(off);
  const y0 = anchor(a.y, a.y + a.h, off);
  let y3 = anchor(b.y, b.y + b.h, off);
  if (y3 === y0) {
    const lower = y0 + GRID;
    const upper = y0 - GRID;
    if (lower <= b.y + b.h - CORNER) y3 = lower;
    else if (upper >= b.y + CORNER) y3 = upper;
    else return null;
  }
  return simplify([
    [a.x + a.w, y0],
    [x, y0],
    [x, y3],
    [b.x + b.w, y3],
  ]);
}

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** The radius actually used at corner `i`: the corner radius, or less where a segment is too short. */
const radiusAt = (pts: Pt[], i: number, r: number) =>
  Math.min(r, dist(pts[i - 1], pts[i]) / 2, dist(pts[i], pts[i + 1]) / 2);

/** Length of the quadratic curve p0 -> p2 bent towards c. */
function quadLength(p0: Pt, c: Pt, p2: Pt): number {
  let length = 0;
  let last = p0;
  const steps = 12;
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const u = 1 - t;
    const p: Pt = [
      u * u * p0[0] + 2 * u * t * c[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * c[1] + t * t * p2[1],
    ];
    length += dist(last, p);
    last = p;
  }
  return length;
}

/** The two points a rounded corner at `b` starts and ends at, and its radius. */
function cornerPoints(pts: Pt[], i: number, r: number): { start: Pt; end: Pt; radius: number } {
  const a = pts[i - 1];
  const b = pts[i];
  const c = pts[i + 1];
  const radius = radiusAt(pts, i, r);
  const l1 = dist(a, b);
  const l2 = dist(b, c);
  return {
    radius,
    start: [b[0] + ((a[0] - b[0]) / l1) * radius, b[1] + ((a[1] - b[1]) / l1) * radius],
    end: [b[0] + ((c[0] - b[0]) / l2) * radius, b[1] + ((c[1] - b[1]) / l2) * radius],
  };
}

/** SVG path through `pts` with each corner rounded by `r`. */
export function roundedPath(pts: Pt[], r = CORNER): string {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const { start, end } = cornerPoints(pts, i, r);
    d += ` L${start[0]} ${start[1]} Q${pts[i][0]} ${pts[i][1]} ${end[0]} ${end[1]}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
}

/** The same path walked the other way, for text that must read left to right or bottom to top. */
export const reversedPath = (pts: Pt[], r = CORNER): string => roundedPath([...pts].reverse(), r);

export interface Geom {
  /** Length of the rounded path. */
  total: number;
  /** Length of the longest straight segment, which carries the label. */
  longest: number;
  /** Middle of that segment. */
  mid: Pt;
  /** Direction of travel along it. */
  dir: Pt;
  /** Distance along the rounded path to `mid`. */
  pos: number;
}

/** Where the label goes: the middle of the longest straight segment, and how far along the rounded path that is. */
export function geom(pts: Pt[], r = CORNER): Geom {
  const n = pts.length - 1;
  let best = 0;
  for (let i = 1; i < n; i++) if (dist(pts[i], pts[i + 1]) > dist(pts[best], pts[best + 1])) best = i;

  // Walk the rounded path: a straight stretch, then a corner curve, and so on. `total` is the distance to
  // the start of the current stretch.
  let total = 0;
  let pos = 0;
  for (let i = 0; i < n; i++) {
    const before = i > 0 ? radiusAt(pts, i, r) : 0;
    const after = i < n - 1 ? radiusAt(pts, i + 1, r) : 0;
    const len = dist(pts[i], pts[i + 1]);
    if (i === best) pos = total + (len / 2 - before);
    total += len - before - after;
    if (i < n - 1) {
      const corner = cornerPoints(pts, i + 1, r);
      total += quadLength(corner.start, pts[i + 1], corner.end);
    }
  }
  const a = pts[best];
  const b = pts[best + 1];
  return {
    total,
    longest: dist(a, b),
    mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
    dir: [b[0] - a[0], b[1] - a[1]],
    pos,
  };
}

/** Text along a path must not run upside down: right-to-left and top-to-bottom segments read on the reversed path. */
export const readableReverse = (dir: Pt): boolean => dir[0] < 0 || (dir[0] === 0 && dir[1] > 0);

/** Where an end shape sits and which way it points: at `p`, along the last stretch from `from`. */
export function endPlacement(p: Pt, from: Pt): { x: number; y: number; angle: number } {
  return { x: p[0], y: p[1], angle: (Math.atan2(p[1] - from[1], p[0] - from[0]) * 180) / Math.PI };
}

/** Lane `i` of a bundle: 0, +1, -1, +2, -2 ... cells from the straight route. */
export const laneOffset = (i: number): number => (i === 0 ? 0 : i % 2 === 1 ? (i + 1) / 2 : -i / 2) * GRID;

const laneCache = new WeakMap<object, Map<string, number>>();

/**
 * Sideways offset of each link, so several links between the same two nodes (either direction) fan out
 * instead of lying on top of each other. Cached per edge array, which the store replaces on every change.
 */
export function lanesOf(edges: Pick<AppEdge, 'id' | 'source' | 'target'>[]): Map<string, number> {
  const cached = laneCache.get(edges);
  if (cached) return cached;
  const seen = new Map<string, number>();
  const lanes = new Map<string, number>();
  for (const e of edges) {
    const key = e.source < e.target ? `${e.source}|${e.target}` : `${e.target}|${e.source}`;
    const i = seen.get(key) ?? 0;
    seen.set(key, i + 1);
    lanes.set(e.id, laneOffset(i));
  }
  laneCache.set(edges, lanes);
  return lanes;
}
