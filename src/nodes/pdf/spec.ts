import { FileText } from 'lucide-react';
import { z } from 'zod';
import { type NodeSpec, titleField } from '../spec';
import { normalisePins } from './pins';

export const pdfSpec: NodeSpec<'pdf'> = {
  kind: 'pdf',
  label: 'PDF',
  description: 'Link a PDF from disk and pin the pages you want in view',
  icon: FileText,
  placement: 'insert',
  // Links files through the File System Access API, which only Chromium browsers have.
  available: () => typeof window !== 'undefined' && 'showOpenFilePicker' in window,
  schema: z.object({
    fileId: z.string(),
    fileName: z.string().max(500),
    pinned: z.array(z.number().int().positive()).transform((pins) => normalisePins(pins)),
    direction: z.enum(['row', 'column']).optional(),
    pageCount: z.number().int().nonnegative().optional(),
    lastModified: z.number().optional(),
    size: z.number().nonnegative().optional(),
    title: titleField,
  }),
  defaults: () => ({ fileId: '', fileName: '', pinned: [], direction: 'row' }),
  size: { width: 560, height: 360 },
  searchText: (d) => d.fileName,
};
