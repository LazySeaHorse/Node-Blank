import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Image,
  LayoutGrid,
  Pin,
  PinOff,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';
import { useElementSize } from '@/lib/useElementSize';
import type { NodeOf } from '@/model/types';
import { Button, IconButton } from '@/ui/Button';
import { Modal } from '@/ui/Modal';
import { useUpdateNodeData } from '../useNodeData';
import { openOriginal, popOutPage } from './actions';
import { PdfPage } from './PdfPage';
import { COVER_PAGE, togglePin } from './pins';

export interface PdfReaderProps {
  nodeId: string;
  data: NodeOf<'pdf'>['data'];
  doc: PDFDocumentProxy;
  handle: FileSystemFileHandle;
  /** Opens on the grid of all pages, or on one page. */
  initial: 'grid' | number;
  onClose: () => void;
}

const THUMBNAIL_WIDTH = 160;
const PAGE_WIDTH = 880;
const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

/** A large window over the canvas to browse every page of the PDF, pin pages and read one in full. */
export default function PdfReader({ nodeId, data, doc, handle, initial, onClose }: PdfReaderProps) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'pdf'>(nodeId);
  const [view, setView] = useState<'grid' | number>(initial);
  const [zoomStep, setZoomStep] = useState(ZOOM_STEPS.indexOf(1));
  const pageCount = doc.numPages;

  const pin = (page: number) => update({ pinned: togglePin(data.pinned, page, pageCount) });
  const popOut = (page: number) =>
    popOutPage(nodeId, doc, page).then(
      () => toast.success(`Page ${page} added as an image`),
      () => toast.error('Could not render that page'),
    );
  const original = () => openOriginal(handle).catch(() => toast.error('Could not open the file'));

  const goTo = (page: number) => setView(Math.min(pageCount, Math.max(1, page)));
  const onKeyDown = (event: KeyboardEvent) => {
    if (typeof view !== 'number' || event.target instanceof HTMLInputElement) return;
    if (event.key === 'ArrowLeft') goTo(view - 1);
    else if (event.key === 'ArrowRight') goTo(view + 1);
  };

  const pageActions = (page: number) => {
    const pinned = data.pinned.includes(page);
    return (
      <>
        {page === COVER_PAGE ? (
          <span className="px-2 text-xs text-muted">Cover, always shown</span>
        ) : (
          <Button disabled={readOnly} onClick={() => pin(page)}>
            {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            {pinned ? 'Unpin' : 'Pin'}
          </Button>
        )}
        <Button onClick={() => void popOut(page)}>
          <Image className="size-4" />
          Pop out as image
        </Button>
        <Button onClick={() => void original()}>
          <ExternalLink className="size-4" />
          Open original
        </Button>
      </>
    );
  };

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title={data.title || data.fileName}
      icon={<FileText />}
      size="large"
      // Keys here belong to the reader, not to the canvas behind it.
      className="nokey"
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: arrow keys page through the document. */}
      <div className="flex min-h-full flex-col" onKeyDown={onKeyDown}>
        <div className="sticky top-0 z-10 -mx-6 mb-3 flex flex-wrap items-center gap-1 border-b border-border bg-surface px-6 py-2">
          {typeof view === 'number' ? (
            <>
              <Button onClick={() => setView('grid')}>
                <LayoutGrid className="size-4" />
                All pages
              </Button>
              <IconButton
                icon={ChevronLeft}
                label="Previous page"
                size="sm"
                disabled={view <= 1}
                onClick={() => goTo(view - 1)}
              />
              <span className="min-w-20 text-center text-sm tabular-nums">
                {view} / {pageCount}
              </span>
              <IconButton
                icon={ChevronRight}
                label="Next page"
                size="sm"
                disabled={view >= pageCount}
                onClick={() => goTo(view + 1)}
              />
              <IconButton
                icon={ZoomOut}
                label="Zoom out"
                size="sm"
                disabled={zoomStep <= 0}
                onClick={() => setZoomStep(zoomStep - 1)}
              />
              <span className="w-12 text-center text-sm tabular-nums">
                {Math.round(ZOOM_STEPS[zoomStep] * 100)}%
              </span>
              <IconButton
                icon={ZoomIn}
                label="Zoom in"
                size="sm"
                disabled={zoomStep >= ZOOM_STEPS.length - 1}
                onClick={() => setZoomStep(zoomStep + 1)}
              />
              <div className="ml-auto flex flex-wrap items-center gap-1">{pageActions(view)}</div>
            </>
          ) : (
            <>
              <span className="text-sm text-muted">
                {pageCount} pages · {data.pinned.length} pinned
              </span>
              <Button className="ml-auto" onClick={() => void original()}>
                <ExternalLink className="size-4" />
                Open original
              </Button>
            </>
          )}
        </div>

        {typeof view === 'number' ? (
          <PageView doc={doc} page={view} zoom={ZOOM_STEPS[zoomStep]} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] justify-items-center gap-x-4 gap-y-6 pb-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <Thumbnail
                key={page}
                doc={doc}
                page={page}
                pinned={data.pinned.includes(page)}
                readOnly={readOnly}
                onOpen={() => setView(page)}
                onPin={() => pin(page)}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/** One page at full size with selectable text, as wide as the window allows before zoom. */
function PageView({ doc, page, zoom }: { doc: PDFDocumentProxy; page: number; zoom: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(ref);
  return (
    <div ref={ref} className="flex-1 overflow-auto pb-2">
      <PdfPage
        key={page}
        doc={doc}
        page={page}
        text
        fit={{ width: Math.min(PAGE_WIDTH, Math.max(200, width - 8)) * zoom }}
        className="mx-auto shadow-md ring-1 ring-border"
      />
    </div>
  );
}

/** True while the element is on screen (or just off it), so far-away thumbnails are not kept rendered. */
function useNearScreen(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: '600px',
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return near;
}

function Thumbnail({
  doc,
  page,
  pinned,
  readOnly,
  onOpen,
  onPin,
}: {
  doc: PDFDocumentProxy;
  page: number;
  pinned: boolean;
  readOnly: boolean;
  onOpen: () => void;
  onPin: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearScreen(ref);
  const alwaysShown = page === COVER_PAGE;
  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5" style={{ width: THUMBNAIL_WIDTH }}>
      <div className="group relative" style={{ minHeight: near ? undefined : THUMBNAIL_WIDTH * 1.3 }}>
        <button
          type="button"
          aria-label={`Open page ${page}`}
          onClick={onOpen}
          className={cn(
            'block cursor-pointer shadow-sm ring-1 transition hover:ring-2 hover:ring-accent',
            pinned || alwaysShown ? 'ring-accent' : 'ring-border',
          )}
        >
          {near ? (
            <PdfPage doc={doc} page={page} fit={{ width: THUMBNAIL_WIDTH }} />
          ) : (
            <div className="bg-surface-2" style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_WIDTH * 1.3 }} />
          )}
        </button>
        {!alwaysShown && (
          <button
            type="button"
            aria-label={pinned ? `Unpin page ${page}` : `Pin page ${page}`}
            aria-pressed={pinned}
            disabled={readOnly}
            onClick={onPin}
            className={cn(
              'absolute top-1.5 right-1.5 flex size-7 cursor-pointer items-center justify-center rounded-full shadow-md transition-opacity disabled:pointer-events-none',
              pinned
                ? 'bg-accent text-accent-fg'
                : 'bg-surface text-muted opacity-0 group-focus-within:opacity-100 group-hover:opacity-100',
            )}
          >
            <Pin className={cn('size-3.5', pinned && 'fill-current')} />
          </button>
        )}
      </div>
      <span className="text-xs text-muted tabular-nums">{alwaysShown ? '1 · cover' : page}</span>
    </div>
  );
}
