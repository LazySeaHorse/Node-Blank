import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useReadOnly } from '@/canvas/readOnly';
import type { NodeOf } from '@/model/types';
import { useUpdateNodeData } from '../useNodeData';
import { pickPdfHandle } from './actions';
import { ensurePermission, getHandle, saveHandle } from './fileStore';
import { acquirePdf, releasePdf } from './pdfjs';
import { normalisePins } from './pins';
import { pdfSupported } from './spec';

export type PdfConnection =
  | { status: 'unsupported' }
  | { status: 'checking' }
  /** No handle stored here, e.g. the canvas was imported or comes from another device. */
  | { status: 'missing' }
  /** Handle known, but the browser wants a click before the file may be read. */
  | { status: 'disconnected' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'connected'; doc: PDFDocumentProxy; handle: FileSystemFileHandle };

/**
 * Links a pdf node to its file for this session: finds the stored handle, loads the document when the
 * browser already allows reading (Chrome's "Allow on every visit") and otherwise waits for `reconnect`.
 */
export function usePdfConnection(id: string, data: NodeOf<'pdf'>['data']) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'pdf'>(id);
  const { fileId } = data;
  const [connection, setConnection] = useState<PdfConnection>({
    status: pdfSupported() ? 'checking' : 'unsupported',
  });
  // Bumped after permission is granted so the loading effect runs again.
  const [attempt, setAttempt] = useState(0);
  const handle = useRef<FileSystemFileHandle>(undefined);

  /** Notes what the file is now; if it changed since last time, pins past its end are dropped. */
  const syncMetadata = useEffectEvent((file: File, pageCount: number) => {
    const known = { lastModified: file.lastModified, size: file.size, pageCount };
    if (
      readOnly ||
      (data.lastModified === known.lastModified && data.size === known.size && data.pageCount === pageCount)
    )
      return;
    const pinned = normalisePins(data.pinned, pageCount);
    update({ ...known, pinned });
    const dropped = data.pinned.length - pinned.length;
    if (dropped > 0)
      toast.warning(
        `${data.fileName} is now ${pageCount} pages; ${dropped} pinned page${dropped === 1 ? ' was' : 's were'} removed`,
      );
  });

  useEffect(() => {
    if (!pdfSupported()) return;
    // `attempt` only exists to re-run this effect.
    void attempt;
    let live = true;
    let held = false;
    setConnection({ status: 'checking' });

    (async () => {
      const stored = await getHandle(fileId);
      handle.current = stored;
      if (!live) return;
      if (!stored) return setConnection({ status: 'missing' });
      if (!(await ensurePermission(stored, false))) return live && setConnection({ status: 'disconnected' });

      setConnection({ status: 'loading' });
      const file = await stored.getFile();
      const doc = await acquirePdf(fileId, file);
      if (!live) return releasePdf(fileId);
      held = true;
      syncMetadata(file, doc.numPages);
      setConnection({ status: 'connected', doc, handle: stored });
    })().catch((error: unknown) => {
      if (!live) return;
      const gone = error instanceof DOMException && error.name === 'NotFoundError';
      setConnection({
        status: 'error',
        message: gone ? 'The file was moved or deleted.' : 'The file could not be opened as a PDF.',
      });
    });

    return () => {
      live = false;
      if (held) releasePdf(fileId);
    };
  }, [fileId, attempt]);

  /** From a click: asks the browser for permission to read the file, then loads it. */
  const reconnect = async () => {
    if (handle.current && (await ensurePermission(handle.current, true))) setAttempt((n) => n + 1);
  };

  /** From a click: picks the file again and keeps the pins. */
  const relink = async () => {
    const picked = await pickPdfHandle();
    if (picked) update({ fileId: await saveHandle(picked), fileName: picked.name });
  };

  return { connection, reconnect, relink };
}
