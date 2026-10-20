import { Dexie, type EntityTable } from 'dexie';
import type { CanvasContent, CanvasMeta } from '@/model/types';
import type { SyncRecord } from '@/sync/status';

export type CanvasContentRow = CanvasContent & { id: string };

/** A linked PDF. Handles are structured-cloneable but not JSON, so they live here rather than in node data. */
export interface PdfFileRow {
  id: string;
  handle: FileSystemFileHandle;
}

/** Metadata and content live in separate tables so listing canvases never loads their (possibly large) nodes. */
export const db = new Dexie('node-blank') as Dexie & {
  canvases: EntityTable<CanvasMeta, 'id'>;
  contents: EntityTable<CanvasContentRow, 'id'>;
  pdfFiles: EntityTable<PdfFileRow, 'id'>;
  syncRecords: EntityTable<SyncRecord, 'id'>;
};

db.version(1).stores({
  canvases: 'id, updatedAt',
  contents: 'id',
});

db.version(2).stores({
  canvases: 'id, updatedAt',
  contents: 'id',
  pdfFiles: 'id',
});

db.version(3).stores({
  canvases: 'id, updatedAt',
  contents: 'id',
  pdfFiles: 'id',
  syncRecords: 'id',
});
