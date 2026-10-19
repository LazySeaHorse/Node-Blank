import { describe, expect, it } from 'vitest';
import { cellKey, parseCellKey, pruneFills, rangeLabel, withFill } from './fills';

describe('sheet fills', () => {
  it('converts between cells and A1 keys, past column Z', () => {
    expect(cellKey({ row: 2, column: 1 })).toBe('B3');
    expect(cellKey({ row: 0, column: 26 })).toBe('AA1');
    expect(parseCellKey('AA1')).toEqual({ row: 0, column: 26 });
    expect(parseCellKey('b3')).toBeNull();
  });

  it('sets, overwrites and clears fills, dropping the record when empty', () => {
    const cells = [
      { row: 0, column: 0 },
      { row: 0, column: 1 },
    ];
    const filled = withFill(undefined, cells, 'yellow');
    expect(filled).toEqual({ A1: 'yellow', B1: 'yellow' });
    expect(withFill(filled, [cells[0]], 'blue')).toEqual({ A1: 'blue', B1: 'yellow' });
    expect(withFill(filled, cells, null)).toBeUndefined();
  });

  it('prunes fills outside a shrunken grid', () => {
    expect(pruneFills({ A1: 'blue', C1: 'blue', A4: 'blue' }, 3, 2)).toEqual({ A1: 'blue' });
    expect(pruneFills({ C1: 'blue' }, 3, 2)).toBeUndefined();
  });

  it('labels a block', () => {
    expect(rangeLabel({ row: 0, column: 0 }, { row: 0, column: 0 })).toBe('A1');
    expect(rangeLabel({ row: 0, column: 0 }, { row: 2, column: 1 })).toBe('A1:B3');
  });
});
