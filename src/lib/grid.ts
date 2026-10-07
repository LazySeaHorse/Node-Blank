/** Helpers for rectangular string grids (tables, spreadsheets). */
export const emptyGrid = (rows: number, cols: number): string[][] =>
  Array.from({ length: rows }, () => Array<string>(cols).fill(''));

export const addRow = (grid: string[][]): string[][] => [
  ...grid,
  Array<string>(grid[0]?.length ?? 1).fill(''),
];

export const removeRow = (grid: string[][]): string[][] => (grid.length > 1 ? grid.slice(0, -1) : grid);

export const addColumn = (grid: string[][]): string[][] => grid.map((row) => [...row, '']);

export const removeColumn = (grid: string[][]): string[][] =>
  (grid[0]?.length ?? 0) > 1 ? grid.map((row) => row.slice(0, -1)) : grid;

export const setCell = (grid: string[][], row: number, col: number, value: string): string[][] =>
  grid.map((r, i) => (i === row ? r.map((c, j) => (j === col ? value : c)) : r));
