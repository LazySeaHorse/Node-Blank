import { FileText } from 'lucide-react';
import { z } from 'zod';
import { colorField, type NodeSpec, titleField } from '../spec';
import { normalisePins } from './pins';

/** Linking files needs the File System Access API, which only Chromium browsers have. */
export const pdfSupported = () => typeof window !== 'undefined' && 'showOpenFilePicker' in window;

export const pdfSpec: NodeSpec<'pdf'> = {
  kind: 'pdf',
  label: 'PDF',
  description: 'Link a PDF from disk and pin the pages you want in view',
  icon: FileText,
  placement: 'insert',
  available: pdfSupported,
  schema: z.object({
    fileId: z.string(),
    fileName: z.string().max(500),
    pinned: z.array(z.number().int().positive()).transform((pins) => normalisePins(pins)),
    direction: z.enum(['row', 'column']).optional(),
    pageCount: z.number().int().nonnegative().optional(),
    lastModified: z.number().optional(),
    size: z.number().nonnegative().optional(),
    title: titleField,
    color: colorField,
  }),
  defaults: () => ({ fileId: '', fileName: '', pinned: [], direction: 'row' }),
  size: { width: 560, height: 360 },
  searchText: (d) => d.fileName,
};
