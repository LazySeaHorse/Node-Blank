import { describe, expect, it } from 'vitest';
import { insertColumn, insertRow, removeColumnAt, removeRowAt } from './grid';

const grid = [
  ['a', 'b'],
  ['c', 'd'],
];

describe('insertRow', () => {
  it('inserts an empty row at the index', () => {
    expect(insertRow(grid, 0)).toEqual([['', ''], ...grid]);
    expect(insertRow(grid, 1)).toEqual([
      ['a', 'b'],
      ['', ''],
      ['c', 'd'],
    ]);
    expect(insertRow(grid, 2)).toEqual([...grid, ['', '']]);
  });
  it('clamps the index and does not mutate', () => {
    expect(insertRow(grid, 9)).toHaveLength(3);
    expect(grid).toHaveLength(2);
  });
});

describe('insertColumn', () => {
  it('inserts an empty column at the index', () => {
    expect(insertColumn(grid, 0)).toEqual([
      ['', 'a', 'b'],
      ['', 'c', 'd'],
    ]);
    expect(insertColumn(grid, 1)).toEqual([
      ['a', '', 'b'],
      ['c', '', 'd'],
    ]);
    expect(insertColumn(grid, 2)).toEqual([
      ['a', 'b', ''],
      ['c', 'd', ''],
    ]);
  });
  it('clamps the index', () => {
    expect(insertColumn(grid, -3)[0]).toEqual(['', 'a', 'b']);
  });
});

describe('removeRowAt / removeColumnAt', () => {
  it('removes the given row or column', () => {
    expect(removeRowAt(grid, 0)).toEqual([['c', 'd']]);
    expect(removeColumnAt(grid, 1)).toEqual([['a'], ['c']]);
  });
  it('never goes below 1x1', () => {
    expect(removeRowAt([['a']], 0)).toEqual([['a']]);
    expect(removeColumnAt([['a'], ['b']], 0)).toEqual([['a'], ['b']]);
  });
});
