import type { XYPosition } from '@xyflow/react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { nodeRect } from '@/lib/nodeRect';
import { useCanvasStore } from '@/store/canvasStore';
import { createNode } from '../factory';
import { imageBox } from '../image/spec';
import { saveHandle } from './fileStore';

/** Opens the system picker for one PDF. Resolves null if the user cancels. */
export async function pickPdfHandle(): Promise<FileSystemFileHandle | null> {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
    });
    return handle ?? null;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null;
    throw error;
  }
}

/** Links `handle` as a new pdf node at `position`. */
export async function addPdfNode(handle: FileSystemFileHandle, position: XYPosition): Promise<void> {
  const fileId = await saveHandle(handle);
  useCanvasStore
    .getState()
    .addNodes([createNode('pdf', position, { fileId, fileName: handle.name, pinned: [], direction: 'row' })]);
}

/** The longest side of a page rendered for an image node; the node itself is shown smaller. */
const POP_OUT_SIDE = 1600;
/** Space between a pdf node and an image popped out beside it. */
const POP_OUT_GAP = 40;

/** Renders one page (1-based) to a PNG data URL, with its pixel size. */
async function renderPagePng(doc: PDFDocumentProxy, pageNumber: number) {
  const page = await doc.getPage(pageNumber);
  const natural = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: POP_OUT_SIDE / Math.max(natural.width, natural.height) });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvas, viewport }).promise;
  return { src: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
}

/** Adds a page as an ordinary image node beside the pdf node `nodeId`. */
export async function popOutPage(nodeId: string, doc: PDFDocumentProxy, pageNumber: number): Promise<void> {
  const { src, width, height } = await renderPagePng(doc, pageNumber);
  const store = useCanvasStore.getState();
  const origin = store.nodes.find((n) => n.id === nodeId);
  const at = origin ? nodeRect(origin) : { x: 0, y: 0, width: 0, height: 0 };
  store.addNodes([
    createNode('image', { x: at.x + at.width + POP_OUT_GAP, y: at.y }, { src }, imageBox({ width, height })),
  ]);
}

/** Opens the linked file itself in a new tab. */
export async function openOriginal(handle: FileSystemFileHandle): Promise<void> {
  const file = await handle.getFile();
  const url = URL.createObjectURL(new Blob([file], { type: 'application/pdf' }));
  window.open(url, '_blank');
  // The new tab has fetched the blob long before this.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
