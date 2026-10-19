import { describe, expect, it } from 'vitest';
import { hiddenPageCount, normalisePins, shownPages, togglePin } from './pins';

describe('normalisePins', () => {
  it('sorts and de-duplicates', () => {
    expect(normalisePins([5, 3, 5, 9])).toEqual([3, 5, 9]);
  });

  it('never keeps the cover', () => {
    expect(normalisePins([1, 2])).toEqual([2]);
  });

  it('drops anything that is not a page number', () => {
    expect(normalisePins([0, -2, 2.5, Number.NaN, 4])).toEqual([4]);
  });

  it('clamps to the page count when known', () => {
    expect(normalisePins([2, 8, 12], 8)).toEqual([2, 8]);
    expect(normalisePins([2, 8, 12], 1)).toEqual([]);
  });
});

describe('togglePin', () => {
  it('adds in order and removes again', () => {
    const pinned = togglePin(togglePin([], 7), 3);
    expect(pinned).toEqual([3, 7]);
    expect(togglePin(pinned, 7)).toEqual([3]);
  });

  it('ignores the cover', () => {
    expect(togglePin([], 1)).toEqual([]);
  });
});

describe('shownPages', () => {
  it('leads with the cover', () => {
    expect(shownPages([4, 2])).toEqual([1, 2, 4]);
    expect(shownPages([])).toEqual([1]);
  });
});

describe('hiddenPageCount', () => {
  it('counts the pages not shown', () => {
    expect(hiddenPageCount([3], 40)).toBe(38);
    expect(hiddenPageCount([], 1)).toBe(0);
  });

  it('is unknown without a page count', () => {
    expect(hiddenPageCount([3])).toBeUndefined();
  });
});
