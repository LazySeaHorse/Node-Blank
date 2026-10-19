import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { NodeOf } from '@/model/types';

export interface PdfReaderProps {
  nodeId: string;
  data: NodeOf<'pdf'>['data'];
  doc: PDFDocumentProxy;
  handle: FileSystemFileHandle;
  /** Opens on the grid of all pages, or on one page. */
  initial: 'grid' | number;
  onClose: () => void;
}

export default function PdfReader(_props: PdfReaderProps) {
  return null;
}
