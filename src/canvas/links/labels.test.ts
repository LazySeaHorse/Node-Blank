import { describe, expect, it } from 'vitest';
import { fitText, hasMath, measureLabel, splitLabel } from './labels';

describe('splitLabel', () => {
  it('splits plain text and formulas', () => {
    expect(splitLabel('rate $\\frac{dx}{dt}$ now')).toEqual([
      { text: 'rate ', math: false },
      { text: '\\frac{dx}{dt}', math: true },
      { text: ' now', math: false },
    ]);
  });

  it('keeps unmatched and empty dollar signs as text', () => {
    expect(splitLabel('costs $5')).toEqual([{ text: 'costs $5', math: false }]);
    expect(splitLabel('$$')).toEqual([{ text: '$$', math: false }]);
    expect(splitLabel('')).toEqual([]);
  });

  it('says whether a label has a formula', () => {
    expect(hasMath('$x$')).toBe(true);
    expect(hasMath('plain')).toBe(false);
    expect(hasMath('$5')).toBe(false);
  });
});

describe('fitText', () => {
  const ten: (t: string) => number = (t) => t.length * 10;

  it('leaves text that fits', () => {
    expect(fitText('abc', 30, ten)).toBe('abc');
  });

  it('cuts with an ellipsis to fit', () => {
    expect(fitText('abcdefghij', 55, ten)).toBe('abcd…');
    expect(fitText('abcd efgh', 50, ten)).toBe('abcd…');
  });

  it('gives nothing when even the ellipsis does not fit', () => {
    expect(fitText('abc', 5, ten)).toBe('');
  });
});

describe('measureLabel', () => {
  it('measures and remembers', () => {
    const a = measureLabel('hello');
    expect(a).toBeGreaterThan(0);
    expect(measureLabel('hello')).toBe(a);
    expect(measureLabel('hello world')).toBeGreaterThan(a);
  });
});
