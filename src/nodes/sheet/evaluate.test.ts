import { describe, expect, it } from 'vitest';
import { evaluateSheet } from './evaluate';

const column = (shown: (string | undefined)[][]) => shown.map((row) => row[0]);

describe('evaluateSheet', () => {
  it('treats typed fractions as numbers and shows results as fractions', () => {
    const shown = evaluateSheet([['1/3'], ['1/6'], ['=A1+A2'], ['=A1*3'], ['=SUM(A1:A2)']], true);
    expect(column(shown)).toEqual([undefined, undefined, '1/2', '1', '1/2']);
  });

  it('follows chains of formulas in any order', () => {
    expect(column(evaluateSheet([['=A2+1'], ['=A3+1'], ['1/2']], true))).toEqual(['5/2', '3/2', undefined]);
    const long = Array.from({ length: 200 }, (_, r) => [r === 199 ? '1' : `=A${r + 2}+1`]);
    expect(evaluateSheet(long, false)[0][0]).toBe('200');
  });

  it('keeps ordinary numbers, text and decimals working', () => {
    const shown = evaluateSheet([['0.25', '=A1*2', '=B1&"x"', '=1/0', '=IF(A1>0,"yes","no")']], true);
    expect(shown[0].slice(1)).toEqual(['1/2', '0.5x', '#DIV/0!', 'yes']);
  });

  it('marks circular formulas instead of looping', () => {
    expect(column(evaluateSheet([['=A2'], ['=A1'], ['=1/4']], true))).toEqual(['#REF!', '#REF!', '1/4']);
    expect(column(evaluateSheet([['=A2+1'], ['=A1+1'], ['=1/4']], true))).toEqual(['#REF!', '#REF!', '1/4']);
    expect(evaluateSheet([['=A1+1']], false)[0][0]).toBe('#REF!');
  });

  it('passes errors on to the formulas that read them', () => {
    const shown = evaluateSheet(
      [['=A2'], ['=A1'], ['=A1+1'], ['=1/0'], ['=A4*2'], ['=IFERROR(A4,7)']],
      false,
    );
    expect(column(shown)).toEqual(['#REF!', '#REF!', '#REF!', '#DIV/0!', '#DIV/0!', '7']);
  });

  it('shows formulas that do not parse or name no function as errors, as before', () => {
    expect(evaluateSheet([['=)(', '=NOPE(1)']], false)[0]).toEqual(['#REF!', '#ERROR!']);
  });

  it('shows numbers with no small fraction as plain numbers', () => {
    expect(evaluateSheet([['=PI()']], true)[0][0]).toBe(String(Math.PI));
  });

  it('counts typed fractions as numbers in decimal mode too, and shows decimals there', () => {
    const shown = evaluateSheet([['1/3', '1/6', '=A1+B1', '=A1*3', '0.1', '=E1+0.2', '1e3', '=G1/4']], false);
    expect(shown[0]).toEqual([
      undefined,
      undefined,
      '0.5',
      '1',
      undefined,
      '0.30000000000000004',
      undefined,
      '250',
    ]);
  });

  it('shows booleans, empty references and the first value of an array result, as the grid did', () => {
    const shown = evaluateSheet(
      [['1', '2', '=A1<B1', '=Z9', '=MMULT(A1:B1,TRANSPOSE(A1:B1))', '=A1:B1*2']],
      false,
    );
    expect(shown[0].slice(2)).toEqual(['TRUE', '', '5', '#VALUE!']);
  });

  it('reads whole-column ranges within the grid', () => {
    expect(
      evaluateSheet(
        [
          ['1', '=SUM(A:A)'],
          ['2', ''],
        ],
        false,
      )[0][1],
    ).toBe('3');
  });
});
