import { describe, expect, it } from 'vitest';
import { dragHasPdf, pdfHandlesFromDrop } from './drop';

const item = (kind: string, type: string, handle?: unknown) =>
  ({
    kind,
    type,
    getAsFileSystemHandle: handle === undefined ? undefined : async () => handle,
  }) as unknown as DataTransferItem;
const drop = (...items: DataTransferItem[]) => ({ items }) as unknown as Pick<DataTransfer, 'items'>;
const file = (name: string) => ({ kind: 'file', name }) as FileSystemHandle;

describe('dragHasPdf', () => {
  it('sees a PDF among dragged files by its type', () => {
    expect(dragHasPdf(drop(item('file', 'image/png'), item('file', 'application/pdf')))).toBe(true);
  });

  it('ignores other files and non-file items', () => {
    expect(dragHasPdf(drop(item('file', 'image/png'), item('string', 'application/pdf')))).toBe(false);
  });
});

describe('pdfHandlesFromDrop', () => {
  it('keeps the PDF files', async () => {
    const pdf = file('paper.PDF');
    const handles = await pdfHandlesFromDrop(
      drop(item('file', 'application/pdf', pdf), item('file', 'image/png', file('a.png'))),
    );
    expect(handles).toEqual([pdf]);
  });

  it('skips folders and items without a handle', async () => {
    const folder = { kind: 'directory', name: 'x.pdf' };
    expect(
      await pdfHandlesFromDrop(
        drop(item('file', 'application/pdf', folder), item('file', 'application/pdf')),
      ),
    ).toEqual([]);
  });
});
