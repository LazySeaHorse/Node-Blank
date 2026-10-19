import { createFormulaParser } from 'react-spreadsheet';
import { Rational } from '@/lib/rational';

const isFormula = (text: string) => text.startsWith('=') && text.length > 1;

/** What a formula sees in a plain cell: a number (fractions included), text, or nothing. */
function literal(text: string): number | string | undefined {
  if (text.trim() === '') return undefined;
  return Rational.parse(text)?.toNumber() ?? text;
}

/** Computed numbers read as fractions where a small one fits (0.5 is 1/2), else as plain numbers. */
function display(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') return Rational.fromNumber(value)?.toFraction() ?? String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return String(value);
}

/**
 * The text each formula cell shows in fraction mode (`undefined` for every other cell). Typed fractions
 * such as `1/3` count as numbers, and results are shown as fractions.
 *
 * The grid evaluates formulas itself but takes `1/3` for text, and it drops a custom parser as soon as a cell
 * is cleared or pasted over, so fraction mode evaluates here and the grid only draws the answers.
 */
export function evaluateExact(cells: string[][]): (string | undefined)[][] {
  // Until a formula has its answer, others see an error: a circle of references never gets one.
  const grid = cells.map((row) => row.map((text) => ({ value: isFormula(text) ? '#REF!' : literal(text) })));
  const formulas = cells.flatMap((row, r) =>
    row.flatMap((text, c) => (isFormula(text) ? [{ r, c, formula: text.slice(1) }] : [])),
  );
  const parser = createFormulaParser(grid);

  // A formula may use another formula's answer, so settle in passes: a chain of n needs n.
  let changed = new Set<(typeof formulas)[number]>();
  for (let pass = 0; pass <= formulas.length; pass++) {
    changed = new Set();
    for (const entry of formulas) {
      const { r, c, formula } = entry;
      let result: unknown;
      try {
        const returned: unknown = parser.parse(formula, { row: r + 1, col: c + 1, sheet: 'Sheet1' });
        result = Array.isArray(returned) ? returned[0]?.[0] : returned;
      } catch (error) {
        result = String(error instanceof Error ? error.message : error);
      }
      if (typeof result === 'object' && result !== null) result = String(result);
      if (!Object.is(grid[r][c].value, result)) {
        grid[r][c].value = result as number | string | undefined;
        changed.add(entry);
      }
    }
    if (changed.size === 0) break;
  }
  // Still changing after every pass: something keeps feeding itself.
  for (const { r, c } of changed) grid[r][c].value = '#REF!';

  const out = cells.map((row) => row.map((): string | undefined => undefined));
  for (const { r, c } of formulas) out[r][c] = display(grid[r][c].value);
  return out;
}
