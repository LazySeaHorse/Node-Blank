import { describe, expect, it } from 'vitest';
import { evaluateExact } from './exactEvaluate';

describe('evaluateExact', () => {
  it('treats typed fractions as numbers and shows results as fractions', () => {
    const shown = evaluateExact([['1/3'], ['1/6'], ['=A1+A2'], ['=A1*3'], ['=SUM(A1:A2)']]);
    expect(shown.map((row) => row[0])).toEqual([undefined, undefined, '1/2', '1', '1/2']);
  });

  it('follows chains of formulas in any order', () => {
    const shown = evaluateExact([['=A2+1'], ['=A3+1'], ['1/2']]);
    expect(shown.map((row) => row[0])).toEqual(['5/2', '3/2', undefined]);
  });

  it('keeps ordinary numbers, text and decimals working', () => {
    const shown = evaluateExact([['0.25', '=A1*2', '=B1&"x"', '=1/0', '=IF(A1>0,"yes","no")']]);
    expect(shown[0].slice(1)).toEqual(['1/2', '0.5x', '#DIV/0!', 'yes']);
  });

  it('marks circular formulas instead of looping', () => {
    const shown = evaluateExact([['=A2'], ['=A1'], ['=1/4']]);
    expect(shown.map((row) => row[0])).toEqual(['#REF!', '#REF!', '1/4']);
    const sums = evaluateExact([['=A2+1'], ['=A1+1'], ['=1/4']]);
    expect(sums[0][0]).toMatch(/^#/);
    expect(sums[2][0]).toBe('1/4');
  });

  it('shows numbers with no small fraction as plain numbers', () => {
    expect(evaluateExact([['=PI()']])[0][0]).toBe(String(Math.PI));
  });
});
