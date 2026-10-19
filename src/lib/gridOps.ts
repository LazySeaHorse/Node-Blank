import { Rational } from './rational';

/** Raised for a command that cannot be applied; the message is meant for the person who typed it. */
export class GridOpError extends Error {}

type Axis = 'R' | 'C';
type Scalar = { kind: 'scalar'; scalar: Rational };
type Line = { kind: 'line'; axis: Axis; cells: Rational[] };
type Value = Scalar | Line;
export type NumberFormat = 'fraction' | 'decimal';

type Token =
  | { type: 'number'; value: Rational }
  | { type: 'line'; axis: Axis; index: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '(' | ')' };

const columnLabel = (index: number) => {
  let label = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26))
    label = String.fromCharCode(65 + ((n - 1) % 26)) + label;
  return label;
};

const normalise = (text: string) =>
  text
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/←/g, '=')
    .replace(/↔/g, '<->')
    .trim();

function tokenise(text: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /\s*(?:(\d+(?:\.\d+)?)|([RrCc])(\d+)|([-+*/()]))/y;
  let at = 0;
  while (at < text.length) {
    pattern.lastIndex = at;
    const match = pattern.exec(text);
    if (!match) throw new GridOpError(`Unexpected "${text.slice(at).trim()[0]}" in "${text}".`);
    at = pattern.lastIndex;
    const [, number, axis, index, op] = match;
    if (number !== undefined) tokens.push({ type: 'number', value: Rational.parse(number) as Rational });
    else if (axis) tokens.push({ type: 'line', axis: axis.toUpperCase() as Axis, index: Number(index) });
    else tokens.push({ type: 'op', value: op as '+' });
  }
  return tokens;
}

/** Reads and writes whole rows or columns of a grid of strings as exact numbers. */
class Lines {
  constructor(private readonly grid: string[][]) {}

  private size(axis: Axis) {
    return axis === 'R' ? this.grid.length : (this.grid[0]?.length ?? 0);
  }

  private check(axis: Axis, index: number) {
    const size = this.size(axis);
    if (index < 1 || index > size)
      throw new GridOpError(`${axis === 'R' ? 'Row' : 'Column'} ${axis}${index} does not exist (1–${size}).`);
  }

  private at(axis: Axis, index: number, position: number): [number, number] {
    return axis === 'R' ? [index - 1, position] : [position, index - 1];
  }

  /** A line of the right length with nothing read from the grid, for writing over whatever is there. */
  blank(axis: Axis, index: number): Line {
    this.check(axis, index);
    return { kind: 'line', axis, cells: Array(this.size(axis === 'R' ? 'C' : 'R')).fill(Rational.ZERO) };
  }

  read(axis: Axis, index: number): Line {
    this.check(axis, index);
    const cells = Array.from({ length: this.size(axis === 'R' ? 'C' : 'R') }, (_, position) => {
      const [row, col] = this.at(axis, index, position);
      const text = this.grid[row][col];
      if (text.trim() === '') return Rational.ZERO;
      const value = Rational.parse(text);
      if (!value) throw new GridOpError(`Cell ${columnLabel(col)}${row + 1} ("${text}") is not a number.`);
      return value;
    });
    return { kind: 'line', axis, cells };
  }

  write(axis: Axis, index: number, cells: Rational[], format: NumberFormat): string[][] {
    this.check(axis, index);
    const out = this.grid.map((row) => [...row]);
    cells.forEach((value, position) => {
      const [row, col] = this.at(axis, index, position);
      out[row][col] = format === 'fraction' ? value.toFraction() : value.toDecimal();
    });
    return out;
  }
}

const name = (axis: Axis) => (axis === 'R' ? 'row' : 'column');

function combine(op: '+' | '-' | '*' | '/', left: Value, right: Value): Value {
  if (left.kind === 'scalar' && right.kind === 'scalar') {
    const [a, b] = [left.scalar, right.scalar];
    if (op === '/' && b.isZero) throw new GridOpError('Cannot divide by zero.');
    return {
      kind: 'scalar',
      scalar: op === '+' ? a.add(b) : op === '-' ? a.sub(b) : op === '*' ? a.mul(b) : a.div(b),
    };
  }
  if (left.kind === 'line' && right.kind === 'line') {
    if (op === '*' || op === '/')
      throw new GridOpError(
        `Cannot ${op === '*' ? 'multiply' : 'divide'} two ${name(left.axis)}s; scale one by a number.`,
      );
    if (left.axis !== right.axis)
      throw new GridOpError(`Cannot mix a ${name(left.axis)} and a ${name(right.axis)}.`);
    const cells = left.cells.map((a, i) => (op === '+' ? a.add(right.cells[i]) : a.sub(right.cells[i])));
    return { kind: 'line', axis: left.axis, cells };
  }
  if (op === '+' || op === '-')
    throw new GridOpError('Cannot add a number to a whole row or column; scale it or add another one.');
  if (left.kind === 'line' && right.kind === 'scalar') {
    if (op === '/' && right.scalar.isZero) throw new GridOpError('Cannot divide by zero.');
    const apply = (a: Rational) => (op === '*' ? a.mul(right.scalar) : a.div(right.scalar));
    return { kind: 'line', axis: left.axis, cells: left.cells.map(apply) };
  }
  if (op === '/') throw new GridOpError('Cannot divide a number by a whole row or column.');
  if (left.kind === 'scalar' && right.kind === 'line')
    return { kind: 'line', axis: right.axis, cells: right.cells.map((a) => a.mul(left.scalar)) };
  throw new GridOpError('That cannot be combined.');
}

/** Precedence climbing over `+ - * /`, unary minus and parentheses. */
function evaluate(tokens: Token[], lines: Lines): Value {
  let at = 0;
  const peek = () => tokens[at];
  const op = (...values: string[]) => {
    const token = peek();
    return token?.type === 'op' && values.includes(token.value) ? (token.value as '+') : null;
  };

  function primary(): Value {
    const token = tokens[at++];
    if (!token) throw new GridOpError('The expression ends too soon.');
    if (token.type === 'number') return { kind: 'scalar', scalar: token.value };
    if (token.type === 'line') return lines.read(token.axis, token.index);
    if (token.value === '(') {
      const inner = sum();
      if (!op(')')) throw new GridOpError('Missing a closing parenthesis.');
      at++;
      return inner;
    }
    if (token.value === '-') return combine('*', { kind: 'scalar', scalar: new Rational(-1n) }, primary());
    if (token.value === '+') return primary();
    throw new GridOpError(`Unexpected "${token.value}".`);
  }

  function product(): Value {
    let value = primary();
    for (let o = op('*', '/'); o; o = op('*', '/')) {
      at++;
      value = combine(o, value, primary());
    }
    return value;
  }

  function sum(): Value {
    let value = product();
    for (let o = op('+', '-'); o; o = op('+', '-')) {
      at++;
      value = combine(o, value, product());
    }
    return value;
  }

  const value = sum();
  if (at < tokens.length) throw new GridOpError('Something is left over after the expression.');
  return value;
}

const TARGET = /^([RrCc])(\d+)\s*(<->|\+=|-=|\*=|\/=|=)\s*(.+)$/;

/**
 * Applies one row or column command to a grid and returns the new grid, or throws a GridOpError.
 *
 *   R1 -= 3*R2     R2 = R2/2     R1 = R1 - R3 + 2*R2     C2 += C1/3     R1 <-> R3
 *
 * Rows are `R1`, `R2`… and columns `C1`, `C2`… counted from 1, whatever the column letters say.
 * Every cell involved must be a plain number or fraction (empty counts as 0); the arithmetic is exact.
 */
export function applyGridOp(grid: string[][], command: string, format: NumberFormat): string[][] {
  const match = TARGET.exec(normalise(command));
  if (!match) throw new GridOpError('Try something like R1 -= 3*R2, R2 *= 1/2 or R1 <-> R3.');
  const [, axisText, indexText, operator, rest] = match;
  const axis = axisText.toUpperCase() as Axis;
  const index = Number(indexText);
  const lines = new Lines(grid);

  if (operator === '<->') {
    const other = /^([RrCc])(\d+)$/.exec(rest.trim());
    if (!other)
      throw new GridOpError(
        `Swap ${axis}${index} with another ${name(axis)}, e.g. ${axis}${index} <-> ${axis}${index + 1}.`,
      );
    if (other[1].toUpperCase() !== axis)
      throw new GridOpError(`Cannot swap a ${name(axis)} with a ${name(axis === 'R' ? 'C' : 'R')}.`);
    const [a, b] = [lines.read(axis, index), lines.read(axis, Number(other[2]))];
    const swapped = lines.write(axis, index, b.cells, format);
    return new Lines(swapped).write(axis, Number(other[2]), a.cells, format);
  }

  // `R1 -= x` is `R1 = R1 - (x)`.
  const compound = operator === '=' ? '' : `${axis}${index}${operator[0]}`;
  const value = evaluate(tokenise(`${compound}(${rest})`), lines);
  if (value.kind === 'scalar') {
    if (operator !== '=') throw new GridOpError('That does not leave a whole row or column to write back.');
    const { cells } = lines.blank(axis, index);
    return lines.write(
      axis,
      index,
      cells.map(() => value.scalar),
      format,
    );
  }
  if (value.axis !== axis)
    throw new GridOpError(`A ${name(value.axis)} cannot be written into a ${name(axis)}.`);
  return lines.write(axis, index, value.cells, format);
}
