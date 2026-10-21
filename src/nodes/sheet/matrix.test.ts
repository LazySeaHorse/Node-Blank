import { describe, expect, it } from 'vitest';
import { Rational } from '@/lib/rational';
import { determinant, inverse, toRational } from './matrix';

const m = (rows: string[][]) => rows.map((row) => row.map((x) => Rational.parse(x) as Rational));
const text = (rows: Rational[][] | null) => rows?.map((row) => row.map((x) => x.toFraction()));

describe('sheet matrix maths', () => {
  it('reads computed numbers as exact fractions', () => {
    expect(toRational(1 / 3).toFraction()).toBe('1/3');
    expect(toRational(0.1).toFraction()).toBe('1/10');
    expect(toRational(1e-7).toFraction()).toBe('1/10000000');
    expect(toRational(1.5e21).toFraction()).toBe('1500000000000000000000');
    expect(toRational(Math.PI).toNumber()).toBe(Math.PI);
  });

  it('takes determinants with row swaps and zero pivots', () => {
    expect(
      determinant(
        m([
          ['0', '1'],
          ['1', '0'],
        ]),
      ).toFraction(),
    ).toBe('-1');
    expect(
      determinant(
        m([
          ['2', '0', '0', '0'],
          ['0', '3', '0', '0'],
          ['0', '0', '4', '0'],
          ['0', '0', '0', '5'],
        ]),
      ).toFraction(),
    ).toBe('120');
    expect(
      determinant(
        m([
          ['1', '2'],
          ['2', '4'],
        ]),
      ).isZero,
    ).toBe(true);
  });

  it('inverts exactly, or gives null for a singular matrix', () => {
    expect(
      text(
        inverse(
          m([
            ['2', '1'],
            ['1', '1'],
          ]),
        ),
      ),
    ).toEqual([
      ['1', '-1'],
      ['-1', '2'],
    ]);
    expect(
      text(
        inverse(
          m([
            ['0', '2'],
            ['3', '0'],
          ]),
        ),
      ),
    ).toEqual([
      ['0', '1/3'],
      ['1/2', '0'],
    ]);
    expect(
      inverse(
        m([
          ['1', '2'],
          ['2', '4'],
        ]),
      ),
    ).toBeNull();
  });
});
