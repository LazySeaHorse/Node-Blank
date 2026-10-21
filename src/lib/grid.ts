/** Helpers for rectangular string grids (tables, spreadsheets). */
export const emptyGrid = (rows: number, cols: number): string[][] =>
  Array.from({ length: rows }, () => Array<string>(cols).fill(''));

export const addRow = (grid: string[][]): string[][] => [
  ...grid,
  Array<string>(grid[0]?.length ?? 1).fill(''),
];

/** Inserts an empty row so it ends up at `index` (0 = above the first row, length = after the last). */
export const insertRow = (grid: string[][], index: number): string[][] => {
  const at = Math.max(0, Math.min(index, grid.length));
  return [...grid.slice(0, at), Array<string>(grid[0]?.length ?? 1).fill(''), ...grid.slice(at)];
};

/** Inserts an empty column so it ends up at `index` (0 = left of the first column, width = after the last). */
export const insertColumn = (grid: string[][], index: number): string[][] =>
  grid.map((row) => {
    const at = Math.max(0, Math.min(index, row.length));
    return [...row.slice(0, at), '', ...row.slice(at)];
  });

export const removeRow = (grid: string[][]): string[][] => (grid.length > 1 ? grid.slice(0, -1) : grid);

export const addColumn = (grid: string[][]): string[][] => grid.map((row) => [...row, '']);

export const removeColumn = (grid: string[][]): string[][] =>
  (grid[0]?.length ?? 0) > 1 ? grid.map((row) => row.slice(0, -1)) : grid;

export const setCell = (grid: string[][], row: number, col: number, value: string): string[][] =>
  grid.map((r, i) => (i === row ? r.map((c, j) => (j === col ? value : c)) : r));

/** Removes the row at `index`; a one-row grid is left alone. */
export const removeRowAt = (grid: string[][], index: number): string[][] =>
  grid.length > 1 ? grid.filter((_, i) => i !== index) : grid;

/** Removes the column at `index`; a one-column grid is left alone. */
export const removeColumnAt = (grid: string[][], index: number): string[][] =>
  (grid[0]?.length ?? 0) > 1 ? grid.map((row) => row.filter((_, j) => j !== index)) : grid;
