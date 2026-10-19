import type { PDFDocumentProxy } from 'pdfjs-dist';

/**
 * pdf.js and its worker are big, so they load on first use. Nothing from a PDF is stored: documents are
 * opened from the linked file each session and shared, by file id, between a node, its reader and the agent.
 */

let library: Promise<typeof import('pdfjs-dist')> | undefined;

export function loadPdfjs(): Promise<typeof import('pdfjs-dist')> {
  library ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
    ([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    },
  );
  return library;
}

interface Entry {
  loading: Promise<PDFDocumentProxy>;
  document?: PDFDocumentProxy;
  /** Nodes currently showing the file. The document is destroyed when the last one lets go. */
  users: number;
}

const open = new Map<string, Entry>();

async function parse(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  return pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
}

/** The document for `fileId`, opening `file` unless another node already has it open. Pair with `releasePdf`. */
export async function acquirePdf(fileId: string, file: File): Promise<PDFDocumentProxy> {
  let entry = open.get(fileId);
  if (!entry) {
    entry = { loading: parse(file), users: 0 };
    open.set(fileId, entry);
  }
  entry.users++;
  try {
    const document = await entry.loading;
    entry.document = document;
    return document;
  } catch (error) {
    releasePdf(fileId);
    throw error;
  }
}

export function releasePdf(fileId: string): void {
  const entry = open.get(fileId);
  if (!entry || --entry.users > 0) return;
  open.delete(fileId);
  void entry.loading.then((document) => document.loadingTask.destroy()).catch(() => {});
}

/** The document if some node has it open right now. */
export const openPdf = (fileId: string): PDFDocumentProxy | undefined => open.get(fileId)?.document;
