import { MAX_TABLE_COLUMNS, MAX_TABLE_ROWS } from '@/lib/grid';

/** Pure maths for table selections and the clipboard. Rows and columns are zero-based and inclusive. */
export interface Cell {
  row: number;
  col: number;
}

export interface Block {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
}

/** The block between two corner cells, in any order. */
export const blockBetween = (a: Cell, b: Cell): Block => ({
  r0: Math.min(a.row, b.row),
  c0: Math.min(a.col, b.col),
  r1: Math.max(a.row, b.row),
  c1: Math.max(a.col, b.col),
});

/** Keeps a block inside a grid of the given size, for when the table shrank under a selection. */
export const clampBlock = (b: Block, rows: number, cols: number): Block => {
  const r = (n: number) => Math.max(0, Math.min(n, rows - 1));
  const c = (n: number) => Math.max(0, Math.min(n, cols - 1));
  return { r0: r(b.r0), r1: r(b.r1), c0: c(b.c0), c1: c(b.c1) };
};

export const inBlock = (b: Block, row: number, col: number) =>
  row >= b.r0 && row <= b.r1 && col >= b.c0 && col <= b.c1;

export const isWholeRows = (b: Block, cols: number) => b.c0 === 0 && b.c1 === cols - 1;
export const isWholeColumns = (b: Block, rows: number) => b.r0 === 0 && b.r1 === rows - 1;

/** The block as tab-separated text: tabs between cells, newlines between rows. */
export const blockText = (grid: string[][], b: Block): string =>
  grid
    .slice(b.r0, b.r1 + 1)
    .map((row) => row.slice(b.c0, b.c1 + 1).join('\t'))
    .join('\n');

/** Tab/newline separated text as rows of cells; a single trailing newline (spreadsheets add one) is ignored. */
export const parseBlockText = (text: string): string[][] => {
  const body = text.replace(/\r\n?/g, '\n').replace(/\n$/, '');
  return body === '' ? [] : body.split('\n').map((line) => line.split('\t'));
};

export const clearBlock = (grid: string[][], b: Block): string[][] =>
  grid.map((row, r) => (r < b.r0 || r > b.r1 ? row : row.map((v, c) => (c < b.c0 || c > b.c1 ? v : ''))));

/** Writes `data` with its top-left at `at`, growing the grid within the caps; what does not fit is dropped. */
export const pasteBlock = (
  grid: string[][],
  at: Cell,
  data: string[][],
  maxRows = MAX_TABLE_ROWS,
  maxCols = MAX_TABLE_COLUMNS,
): { cells: string[][]; block: Block } | null => {
  const width = Math.max(0, ...data.map((row) => row.length));
  if (data.length === 0 || width === 0) return null;
  const rows = Math.min(maxRows, Math.max(grid.length, at.row + data.length));
  const cols = Math.min(maxCols, Math.max(grid[0]?.length ?? 0, at.col + width));
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const v = data[r - at.row]?.[c - at.col];
      return v !== undefined && r >= at.row && c >= at.col ? v : (grid[r]?.[c] ?? '');
    }),
  );
  return {
    cells,
    block: {
      r0: at.row,
      c0: at.col,
      r1: Math.min(rows, at.row + data.length) - 1,
      c1: Math.min(cols, at.col + width) - 1,
    },
  };
};

/** The grid without the block's rows; unchanged if that would remove every row. */
export const deleteBlockRows = (grid: string[][], b: Block): string[][] => {
  const kept = grid.filter((_, r) => r < b.r0 || r > b.r1);
  return kept.length > 0 ? kept : grid;
};

/** The grid without the block's columns; unchanged if that would remove every column. */
export const deleteBlockColumns = (grid: string[][], b: Block): string[][] => {
  const kept = grid.map((row) => row.filter((_, c) => c < b.c0 || c > b.c1));
  return (kept[0]?.length ?? 0) > 0 ? kept : grid;
};
