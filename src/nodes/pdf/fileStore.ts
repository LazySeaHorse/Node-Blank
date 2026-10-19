import type { AppNode, CanvasContent } from '@/model/types';
import { db } from '@/persistence/db';
import { newId } from '../factory';

/** Where linked PDFs' file handles are kept (IndexedDB `pdfFiles`), keyed by the `fileId` in a pdf node's data. */

/** Stores a handle under `id`, or under a new id when none is given. Returns the id. */
export async function saveHandle(handle: FileSystemFileHandle, id = newId()): Promise<string> {
  await db.pdfFiles.put({ id, handle });
  return id;
}

export async function getHandle(id: string): Promise<FileSystemFileHandle | undefined> {
  return (await db.pdfFiles.get(id))?.handle;
}

/**
 * Whether the file can be read now. A `prompt` state is asked about only when `askUser` is set, which
 * must then be called from a user gesture (a click).
 */
export async function ensurePermission(handle: FileSystemFileHandle, askUser: boolean): Promise<boolean> {
  const options = { mode: 'read' } as const;
  let state = await handle.queryPermission(options);
  if (state === 'prompt' && askUser) state = await handle.requestPermission(options);
  return state === 'granted';
}

/** The file ids in `stored` that no pdf node in `canvases` points to. */
export function orphanFileIds(stored: readonly string[], canvases: readonly Pick<CanvasContent, 'nodes'>[]) {
  const used = new Set<string>();
  for (const { nodes } of canvases)
    for (const node of nodes as AppNode[]) if (node.type === 'pdf') used.add(node.data.fileId);
  return stored.filter((id) => !used.has(id));
}

/**
 * Forgets handles that no canvas uses any more. Deleting a node leaves its handle in place so undo works;
 * this runs once at startup.
 */
export async function cleanOrphanPdfFiles(): Promise<void> {
  const [stored, contents] = await Promise.all([
    db.pdfFiles.toCollection().primaryKeys(),
    db.contents.toArray(),
  ]);
  await db.pdfFiles.bulkDelete(orphanFileIds(stored, contents));
}
