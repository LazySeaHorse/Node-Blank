import { describe, expect, it } from 'vitest';
import { applyGridOp, GridOpError } from './gridOps';

// A simplex tableau: three constraint rows and the objective row.
const tableau = () => [
  ['3', '2', '1', '2', '1', '0', '0', '225'],
  ['1', '1', '1', '1', '0', '1', '0', '117'],
  ['4', '3', '3', '4', '0', '0', '1', '420'],
  ['-19', '-13', '-12', '-17', '0', '0', '0', '0'],
];

describe('applyGridOp', () => {
  it('subtracts a multiple of another row', () => {
    const next = applyGridOp(tableau(), 'R1 -= 3*R2', 'fraction');
    expect(next[0]).toEqual(['0', '-1', '-2', '-1', '1', '-3', '0', '-126']);
    expect(next[1]).toEqual(tableau()[1]);
  });

  it('scales a row exactly and keeps fractions', () => {
    const next = applyGridOp(tableau(), 'R1 /= 3', 'fraction');
    expect(next[0]).toEqual(['1', '2/3', '1/3', '2/3', '1/3', '0', '0', '75']);
    expect(applyGridOp(next, 'R1 *= 3', 'fraction')[0]).toEqual(tableau()[0]);
  });

  it('accepts fractions, decimals, `=` forms, unicode and any case', () => {
    expect(applyGridOp(tableau(), 'r2 *= 1/2', 'fraction')[1][7]).toBe('117/2');
    expect(applyGridOp(tableau(), 'R2 = R2 × 0.5', 'fraction')[1][7]).toBe('117/2');
    expect(applyGridOp(tableau(), 'R1 ← R1 − 3·R2', 'fraction')[0][7]).toBe('-126');
    expect(applyGridOp(tableau(), 'R1 = R1 - R3 + 2*R2', 'fraction')[0][0]).toBe('1');
    expect(applyGridOp(tableau(), 'R1 = -R2', 'fraction')[0][7]).toBe('-117');
  });

  it('writes decimals when asked', () => {
    expect(applyGridOp(tableau(), 'R2 /= 3', 'decimal')[1].slice(0, 2)).toEqual([
      '0.3333333333',
      '0.3333333333',
    ]);
  });

  it('works on columns', () => {
    const grid = [
      ['1', '2'],
      ['3', '4'],
    ];
    expect(applyGridOp(grid, 'C2 -= 2*C1', 'fraction')).toEqual([
      ['1', '0'],
      ['3', '-2'],
    ]);
  });

  it('swaps rows and columns', () => {
    const grid = [
      ['1', '2'],
      ['3', '4'],
    ];
    expect(applyGridOp(grid, 'R1 <-> R2', 'fraction')).toEqual([
      ['3', '4'],
      ['1', '2'],
    ]);
    expect(applyGridOp(grid, 'C1 ↔ C2', 'fraction')).toEqual([
      ['2', '1'],
      ['4', '3'],
    ]);
  });

  it('treats empty cells as zero and sets a whole row to a number', () => {
    expect(
      applyGridOp(
        [
          ['1', ''],
          ['', '2'],
        ],
        'R1 += R2',
        'fraction',
      )[0],
    ).toEqual(['1', '2']);
    expect(
      applyGridOp(
        [
          ['x', 'y'],
          ['1', '2'],
        ],
        'R1 = 0',
        'fraction',
      )[0],
    ).toEqual(['0', '0']);
  });

  it('does not mutate its input', () => {
    const grid = tableau();
    applyGridOp(grid, 'R1 -= R2', 'fraction');
    expect(grid).toEqual(tableau());
  });

  it.each([
    ['nonsense', /Try something like/],
    ['R9 -= R1', /Row R9 does not exist \(1–4\)/],
    ['C9 = C1', /Column C9 does not exist/],
    ['R1 /= 0', /divide by zero/],
    ['R1 += 5', /Cannot add a number/],
    ['R1 += R2*R3', /two rows/],
    ['R1 += C1', /Cannot mix|cannot be written|different length/i],
    ['R1 <-> C1', /Cannot swap/],
    ['R1 -= (R2', /closing parenthesis/],
  ])('rejects %s with a readable message', (command, message) => {
    expect(() => applyGridOp(tableau(), command, 'fraction')).toThrow(message);
  });

  describe('with formulas', () => {
    const grid = () => [
      ['=SUM(B1:B2)', '2'],
      ['4', '=A1*2'],
    ];

    it('builds formulas from the originals, so results stay live', () => {
      const next = applyGridOp(grid(), 'R2 -= R1', 'fraction');
      expect(next[1]).toEqual(['=4-(SUM(B1:B2))', '=(A1*2)-2']);
      expect(next[0]).toEqual(grid()[0]);
    });

    it('scales formulas and leaves exact numbers exact', () => {
      expect(applyGridOp(grid(), 'R1 /= 2', 'fraction')[0]).toEqual(['=(SUM(B1:B2))/2', '1']);
      expect(applyGridOp(grid(), 'R1 *= 1/3', 'fraction')[0]).toEqual(['=(SUM(B1:B2))*(1/3)', '2/3']);
    });

    it('keeps bare cell references bare and drops pointless terms', () => {
      const refs = [
        ['=B2', '1'],
        ['0', '=B1'],
      ];
      expect(applyGridOp(refs, 'R1 += R2', 'fraction')[0]).toEqual(['=B2', '=1+B1']);
      expect(applyGridOp(refs, 'R2 -= R1', 'fraction')[1]).toEqual(['=-B2', '=B1-1']);
      expect(applyGridOp(refs, 'R1 *= 1', 'fraction')[0]).toEqual(['=B2', '1']);
      expect(applyGridOp(refs, 'R1 *= 0', 'fraction')[0]).toEqual(['0', '0']);
    });

    it('swaps formula cells too', () => {
      expect(applyGridOp(grid(), 'R1 <-> R2', 'fraction')).toEqual([grid()[1], grid()[0]]);
    });
  });

  it('names the cell that is not a number or formula', () => {
    const grid = [
      ['1', 'abc'],
      ['2', '3'],
    ];
    expect(() => applyGridOp(grid, 'R1 += R2', 'fraction')).toThrow(/Cell B1 \("abc"\)/);
    expect(() => applyGridOp(grid, 'R1 += R2', 'fraction')).toThrow(GridOpError);
  });
});
