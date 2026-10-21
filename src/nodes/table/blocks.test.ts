import { describe, expect, it } from 'vitest';
import {
  blockBetween,
  blockText,
  clampBlock,
  clearBlock,
  deleteBlockColumns,
  deleteBlockRows,
  inBlock,
  isWholeColumns,
  isWholeRows,
  parseBlockText,
  pasteBlock,
} from './blocks';

const grid = [
  ['a', 'b', 'c'],
  ['d', 'e', 'f'],
  ['g', 'h', 'i'],
];

describe('blocks', () => {
  it('orders corners and tests membership', () => {
    const b = blockBetween({ row: 2, col: 1 }, { row: 0, col: 0 });
    expect(b).toEqual({ r0: 0, c0: 0, r1: 2, c1: 1 });
    expect(inBlock(b, 1, 1)).toBe(true);
    expect(inBlock(b, 1, 2)).toBe(false);
  });

  it('knows whole rows and columns, and clamps', () => {
    expect(isWholeRows({ r0: 1, c0: 0, r1: 1, c1: 2 }, 3)).toBe(true);
    expect(isWholeColumns({ r0: 0, c0: 1, r1: 2, c1: 1 }, 3)).toBe(true);
    expect(isWholeRows({ r0: 1, c0: 0, r1: 1, c1: 1 }, 3)).toBe(false);
    expect(clampBlock({ r0: 1, c0: 1, r1: 9, c1: 9 }, 2, 2)).toEqual({ r0: 1, c0: 1, r1: 1, c1: 1 });
  });

  it('copies as tab and newline separated text', () => {
    expect(blockText(grid, { r0: 0, c0: 1, r1: 1, c1: 2 })).toBe('b\tc\ne\tf');
  });

  it('parses clipboard text', () => {
    expect(parseBlockText('1\t2\r\n3\t4\n')).toEqual([
      ['1', '2'],
      ['3', '4'],
    ]);
    expect(parseBlockText('')).toEqual([]);
  });

  it('clears a block only', () => {
    expect(clearBlock(grid, { r0: 1, c0: 1, r1: 1, c1: 2 })[1]).toEqual(['d', '', '']);
    expect(clearBlock(grid, { r0: 1, c0: 1, r1: 1, c1: 2 })[0]).toEqual(['a', 'b', 'c']);
  });

  it('pastes at the top-left, growing within the caps', () => {
    const r = pasteBlock(grid, { row: 2, col: 2 }, [['x', 'y'], ['z']], 4, 4);
    expect(r?.cells).toHaveLength(4);
    expect(r?.cells[2]).toEqual(['g', 'h', 'x', 'y']);
    expect(r?.cells[3]).toEqual(['', '', 'z', '']);
    expect(r?.block).toEqual({ r0: 2, c0: 2, r1: 3, c1: 3 });
    const capped = pasteBlock(grid, { row: 0, col: 0 }, [['1', '2', '3', '4', '5']], 3, 4);
    expect(capped?.cells[0]).toEqual(['1', '2', '3', '4']);
    expect(pasteBlock(grid, { row: 0, col: 0 }, [], 3, 3)).toBeNull();
  });

  it('deletes rows and columns but never all of them', () => {
    expect(deleteBlockRows(grid, { r0: 0, c0: 0, r1: 1, c1: 2 })).toEqual([['g', 'h', 'i']]);
    expect(deleteBlockRows(grid, { r0: 0, c0: 0, r1: 2, c1: 2 })).toBe(grid);
    expect(deleteBlockColumns(grid, { r0: 0, c0: 1, r1: 2, c1: 1 })[0]).toEqual(['a', 'c']);
    expect(deleteBlockColumns(grid, { r0: 0, c0: 0, r1: 2, c1: 2 })).toBe(grid);
  });
});
