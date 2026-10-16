import { describe, expect, it } from 'vitest';
import { flattenDisplaylines } from './normalize';

describe('flattenDisplaylines', () => {
  it('leaves ordinary and single-level multi-line LaTeX alone', () => {
    for (const latex of [
      '',
      'x^2',
      '\\frac{1}{2}',
      '\\displaylines{a\\\\ b}',
      '\\displaylines{a\\\\ b\\\\ c}',
    ])
      expect(flattenDisplaylines(latex)).toBe(latex);
  });

  it('merges a displaylines nested as a row into its parent', () => {
    expect(flattenDisplaylines('\\displaylines{a\\\\ \\displaylines{b\\\\ c}}')).toBe(
      '\\displaylines{a\\\\ b\\\\ c}',
    );
  });

  it('flattens any depth and keeps braces inside rows balanced', () => {
    expect(
      flattenDisplaylines(
        '\\displaylines{\\frac{a}{b}\\\\ \\displaylines{c\\\\ \\displaylines{\\left\\{d\\right\\}}}}',
      ),
    ).toBe('\\displaylines{\\frac{a}{b}\\\\ c\\\\ \\left\\{d\\right\\}}');
  });

  it('repairs the value that crashed MathLive', () => {
    const bad =
      '\\displaylines{K_2=hf\\left(t_{i-1}+\\frac{h}{2},w_{i-1}+\\frac12K_1\\right)\\\\ \\displaylines{K_2=f\\left(t_{i-1}+\\frac12,w_{i-1}+\\frac12K_1\\right)\\\\ K_2=f\\left(\\frac12,300+\\frac{K_1}{2}\\right)}}';
    const fixed = flattenDisplaylines(bad);
    expect(fixed.match(/\\displaylines/g)).toHaveLength(1);
    expect(fixed.split('\\\\')).toHaveLength(3);
  });
});
