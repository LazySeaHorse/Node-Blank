import { describe, expect, it } from 'vitest';
import { geom } from './geometry';
import { fitText, hasMath, measureLabel, placeLabel, splitLabel } from './labels';

describe('splitLabel', () => {
  it('splits plain text and formulas', () => {
    expect(splitLabel('rate $\\frac{dx}{dt}$ now')).toEqual([
      { text: 'rate ', math: false },
      { text: '\\frac{dx}{dt}', math: true },
      { text: ' now', math: false },
    ]);
  });

  it('does not turn two prices into a formula', () => {
    expect(hasMath('$5 and $6')).toBe(false);
    expect(hasMath('$5$')).toBe(false);
    expect(hasMath('$ x $')).toBe(false);
    expect(splitLabel('$5 and $6')).toEqual([{ text: '$5 and $6', math: false }]);
    expect(hasMath('cost $5, rate $r$')).toBe(true);
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

describe('placeLabel', () => {
  const ten = (t: string) => t.length * 10;
  // A horizontal Z whose segments are 208, 48 and 192 long.
  const g = geom([
    [0, 0],
    [208, 0],
    [208, 48],
    [400, 48],
  ]);

  it('keeps a long label on the path by moving its middle away from the longest stretch', () => {
    const label = 'x'.repeat(30);
    const { text, center } = placeLabel(label, g.total, g.pos, ten);
    expect(text).toBe(label);
    expect(g.pos - 150).toBeLessThan(14); // centred on the longest stretch it would run off the start
    expect(center - 150).toBeGreaterThanOrEqual(14);
    expect(center + 150).toBeLessThanOrEqual(g.total - 14);
  });

  it('leaves a short label where the longest stretch puts it', () => {
    expect(placeLabel('abc', g.total, g.pos, ten).center).toBe(g.pos);
  });

  it('cuts text that cannot fit to the room the path has', () => {
    const { text, center } = placeLabel('y'.repeat(80), g.total, g.pos, ten);
    expect(ten(text)).toBeLessThanOrEqual(g.total - 28);
    expect(text.endsWith('…')).toBe(true);
    expect(center - ten(text) / 2).toBeGreaterThanOrEqual(14);
    expect(center + ten(text) / 2).toBeLessThanOrEqual(g.total - 14);
  });
});
