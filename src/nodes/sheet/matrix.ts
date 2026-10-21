import { Rational } from '@/lib/rational';

/**
 * A computed number as an exact fraction: the small fraction it shows as (0.333…3 is 1/3), else the decimal
 * it prints as, so 0.1 is 1/10 and 1e-7 is 1/10000000.
 */
export function toRational(value: number): Rational {
  const simple = Rational.fromNumber(value);
  if (simple) return simple;
  const [mantissa, exponent = '0'] = String(value).split('e');
  const base = Rational.parse(mantissa) as Rational;
  const scale = new Rational(10n ** BigInt(Math.abs(Number(exponent))));
  return Number(exponent) < 0 ? base.div(scale) : base.mul(scale);
}

/**
 * Gaussian elimination on a square matrix of fractions, alongside `extra` columns that take the same row steps.
 * Returns the determinant and the reduced extra columns (which end up as A⁻¹·extra when the determinant is not 0).
 */
function eliminate(matrix: Rational[][], extra: Rational[][]) {
  const n = matrix.length;
  const rows = matrix.map((row, r) => [...row, ...(extra[r] ?? [])]);
  let determinant = new Rational(1n);
  for (let col = 0; col < n; col++) {
    const pivot = rows.findIndex((row, r) => r >= col && !row[col].isZero);
    if (pivot < 0) return { determinant: Rational.ZERO, rest: null };
    if (pivot !== col) {
      [rows[pivot], rows[col]] = [rows[col], rows[pivot]];
      determinant = determinant.neg();
    }
    const lead = rows[col][col];
    determinant = determinant.mul(lead);
    rows[col] = rows[col].map((x) => x.div(lead));
    for (let r = 0; r < n; r++) {
      const factor = rows[r][col];
      if (r !== col && !factor.isZero) rows[r] = rows[r].map((x, c) => x.sub(factor.mul(rows[col][c])));
    }
  }
  return { determinant, rest: rows.map((row) => row.slice(n)) };
}

/** The exact determinant of a square matrix. */
export const determinant = (matrix: Rational[][]) => eliminate(matrix, []).determinant;

/** The exact inverse of a square matrix, or null when it has none. */
export function inverse(matrix: Rational[][]): Rational[][] | null {
  const identity = matrix.map((_, r) => matrix.map((_, c) => new Rational(r === c ? 1n : 0n)));
  return eliminate(matrix, identity).rest;
}
