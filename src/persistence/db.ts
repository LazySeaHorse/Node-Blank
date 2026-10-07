import { Dexie, type EntityTable } from 'dexie';
import type { CanvasContent, CanvasMeta } from '@/model/types';

export type CanvasContentRow = CanvasContent & { id: string };

/** Metadata and content live in separate tables so listing canvases never loads their (possibly large) nodes. */
export const db = new Dexie('node-blank') as Dexie & {
  canvases: EntityTable<CanvasMeta, 'id'>;
  contents: EntityTable<CanvasContentRow, 'id'>;
};

db.version(1).stores({
  canvases: 'id, updatedAt',
  contents: 'id',
});
