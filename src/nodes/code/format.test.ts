import { describe, expect, it } from 'vitest';
import { formatValue } from './format';

describe('formatValue', () => {
  it.each([
    ['hi', 'hi'],
    [42, '42'],
    [undefined, 'undefined'],
    [null, 'null'],
    [10n, '10n'],
    [{ a: 1 }, '{\n  "a": 1\n}'],
    [new TypeError('boom'), 'TypeError: boom'],
    [function named() {}, '[Function named]'],
  ])('formats %s', (input, expected) => {
    expect(formatValue(input)).toBe(expected);
  });

  it('survives circular structures', () => {
    const value: Record<string, unknown> = {};
    value.self = value;
    expect(formatValue(value)).toBe('[object Object]');
  });
});
