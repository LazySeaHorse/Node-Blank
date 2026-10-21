import { describe, expect, it } from 'vitest';
import { kindForNumberKey, nodeSpecs, numberKeyFor, toolbarKinds } from './catalog';

describe('number keys', () => {
  it('numbers the toolbar buttons 1-9 then 0', () => {
    const kinds = toolbarKinds();
    expect(kinds.every((k) => nodeSpecs[k].placement !== 'wrap')).toBe(true);
    expect(numberKeyFor(kinds[0])).toBe('1');
    expect(numberKeyFor(kinds[9])).toBe(kinds.length > 9 ? '0' : undefined);
  });

  it('picks the first toolbar kind with 1 and ignores non-digits', () => {
    expect(kindForNumberKey('1')).toBe(toolbarKinds()[0]);
    expect(kindForNumberKey('a')).toBeUndefined();
    expect(kindForNumberKey('10')).toBeUndefined();
  });
});
