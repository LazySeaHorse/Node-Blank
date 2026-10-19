import { columnLabel } from '@/lib/gridOps';
import type { SectionColor } from '@/model/types';

export type Fills = Record<string, SectionColor>;
export type Cell = { row: number; column: number };

/** A1-style key of a zero-based cell. */
export const cellKey = ({ row, column }: Cell) => `${columnLabel(column)}${row + 1}`;

/** Reads `B3` back into a zero-based cell; null for anything else. */
export function parseCellKey(key: string): Cell | null {
  const match = /^([A-Z]+)(\d+)$/.exec(key);
  if (!match) return null;
  const column = [...match[1]].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
  return { row: Number(match[2]) - 1, column };
}

/** Sets (or, with null, clears) the fill of every cell given. Returns undefined when no fills are left. */
export function withFill(fills: Fills | undefined, cells: Iterable<Cell>, color: SectionColor | null) {
  const next = { ...fills };
  for (const cell of cells) {
    if (color) next[cellKey(cell)] = color;
    else delete next[cellKey(cell)];
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

/** Drops fills of cells that no longer exist after the grid shrank. */
export function pruneFills(fills: Fills | undefined, rows: number, columns: number) {
  if (!fills) return undefined;
  const kept = Object.entries(fills).filter(([key]) => {
    const cell = parseCellKey(key);
    return cell && cell.row < rows && cell.column < columns;
  });
  return kept.length > 0 ? (Object.fromEntries(kept) as Fills) : undefined;
}

/** Cell label such as `B3`, or `B3:C5` for a block. */
export function rangeLabel(start: Cell, end: Cell) {
  const [a, b] = [cellKey(start), cellKey(end)];
  return a === b ? a : `${a}:${b}`;
}
