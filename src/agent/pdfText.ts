import type { NodeOf } from '@/model/types';
import { openPdf } from '@/nodes/pdf/pdfjs';
import { normalisePins, shownPages } from '@/nodes/pdf/pins';

export const PDF_NOT_CONNECTED = 'PDF file not connected; ask the user to click Reconnect on the node.';

/** A page's text runs as lines: pdf.js marks where each line ends. */
export function joinTextRuns(runs: readonly ({ str: string; hasEOL: boolean } | object)[]): string {
  let text = '';
  for (const run of runs) {
    if (!('str' in run)) continue;
    text += run.str + ('hasEOL' in run && run.hasEOL ? '\n' : '');
  }
  return text.trim();
}

/**
 * The text of the pages the user has on show: the cover and the pinned pages, never any other. Read from
 * the document a node has open in this tab, so it is only there once the user has connected the file.
 */
export async function shownPagesText(data: NodeOf<'pdf'>['data']): Promise<string> {
  const doc = openPdf(data.fileId);
  if (!doc) return PDF_NOT_CONNECTED;
  const pages = shownPages(normalisePins(data.pinned, doc.numPages)).filter((page) => page <= doc.numPages);
  const blocks: string[] = [];
  for (const number of pages) {
    const { items } = await (await doc.getPage(number)).getTextContent();
    blocks.push(
      `--- page ${number}${number === 1 ? ' (cover)' : ''} ---\n${joinTextRuns(items) || '(no text)'}`,
    );
  }
  return blocks.join('\n\n');
}
