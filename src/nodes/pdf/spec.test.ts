import { describe, expect, it } from 'vitest';
import { createNode } from '../factory';
import { pdfSpec } from './spec';

describe('pdfSpec', () => {
  it('starts with no file and no pins, filmstrip as a row', () => {
    expect(createNode('pdf', { x: 0, y: 0 }).data).toEqual({
      fileId: '',
      fileName: '',
      pinned: [],
      direction: 'row',
    });
  });

  it('accepts metadata and normalises pins on import', () => {
    const data = pdfSpec.schema.parse({
      fileId: 'f',
      fileName: 'a.pdf',
      pinned: [9, 1, 3, 3],
      pageCount: 12,
      lastModified: 1,
      size: 10,
    });
    expect(data.pinned).toEqual([3, 9]);
  });

  it('rejects page numbers that are not whole pages', () => {
    expect(pdfSpec.schema.safeParse({ fileId: 'f', fileName: 'a.pdf', pinned: [0] }).success).toBe(false);
    expect(pdfSpec.schema.safeParse({ fileId: 'f', fileName: 'a.pdf', pinned: ['2'] }).success).toBe(false);
  });

  it('searches by file name, and by title through searchTextOf', () => {
    expect(pdfSpec.searchText({ fileId: 'f', fileName: 'paper.pdf', pinned: [] })).toBe('paper.pdf');
  });

  it('is only available where the file picker exists', () => {
    expect(pdfSpec.available?.()).toBe('showOpenFilePicker' in window);
  });
});
