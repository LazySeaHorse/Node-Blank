import { describe, expect, it, vi } from 'vitest';
import { createNode } from '@/nodes/factory';
import { openPdf } from '@/nodes/pdf/pdfjs';
import { joinTextRuns, PDF_NOT_CONNECTED, shownPagesText } from './pdfText';

vi.mock('@/nodes/pdf/pdfjs', () => ({ openPdf: vi.fn() }));

const fakeDoc = (numPages: number) => ({
  numPages,
  getPage: async (n: number) => ({
    getTextContent: async () => ({ items: [{ str: `text of page ${n}`, hasEOL: true }] }),
  }),
});
const pdfData = (pinned: number[]) =>
  createNode('pdf', { x: 0, y: 0 }, { fileId: 'f', fileName: 'a.pdf', pinned }).data;

describe('joinTextRuns', () => {
  it('breaks lines where pdf.js marks them and skips runs without text', () => {
    const runs = [
      { str: 'Hello ', hasEOL: false },
      { str: 'world', hasEOL: true },
      { type: 'beginMarkedContent' },
      { str: 'Next', hasEOL: false },
    ];
    expect(joinTextRuns(runs)).toBe('Hello world\nNext');
  });
});

describe('shownPagesText', () => {
  it('says so when the file is not connected', async () => {
    vi.mocked(openPdf).mockReturnValue(undefined);
    expect(await shownPagesText(pdfData([3]))).toBe(PDF_NOT_CONNECTED);
  });

  it('reads the cover and pinned pages and nothing else', async () => {
    vi.mocked(openPdf).mockReturnValue(fakeDoc(5) as unknown as ReturnType<typeof openPdf>);
    const text = await shownPagesText(pdfData([3, 9]));
    expect(text).toContain('text of page 1');
    expect(text).toContain('text of page 3');
    for (const hidden of [2, 4, 5, 9]) expect(text).not.toContain(`page ${hidden}`);
  });
});
