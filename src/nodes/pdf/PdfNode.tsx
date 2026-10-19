import { type NodeProps, useStore } from '@xyflow/react';
import { Columns3, FileText, Rows3 } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { lazy, Suspense, useRef, useState, type WheelEvent } from 'react';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';
import { useElementSize } from '@/lib/useElementSize';
import type { NodeOf } from '@/model/types';
import { Button, IconButton } from '@/ui/Button';
import { Mascot } from '@/ui/mascot/Mascot';
import { NodeShell } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';
import { PdfPage } from './PdfPage';
import { hiddenPageCount, shownPages } from './pins';
import { type PdfConnection, usePdfConnection } from './usePdfConnection';

const PdfReader = lazy(() => import('./PdfReader'));

const GAP = 8;
const PADDING = 8;

export default function PdfNode({ id, data, selected }: NodeProps<NodeOf<'pdf'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'pdf'>(id);
  const { connection, reconnect, relink } = usePdfConnection(id, data);
  const [reading, setReading] = useState<'grid' | number | null>(null);
  const direction = data.direction ?? 'row';

  return (
    <NodeShell
      selected={selected}
      title="PDF"
      customTitle={data.title}
      icon={FileText}
      resize={{ minWidth: 200, minHeight: 160 }}
      actions={
        <IconButton
          icon={direction === 'row' ? Rows3 : Columns3}
          label={direction === 'row' ? 'Stack pages vertically' : 'Lay pages out in a row'}
          size="sm"
          onClick={() => update({ direction: direction === 'row' ? 'column' : 'row' })}
        />
      }
    >
      {connection.status === 'connected' ? (
        <Filmstrip doc={connection.doc} data={data} direction={direction} onOpen={setReading} />
      ) : (
        <Disconnected
          data={data}
          connection={connection}
          readOnly={readOnly}
          onReconnect={() => void reconnect()}
          onRelink={() => void relink()}
        />
      )}
      {reading !== null && connection.status === 'connected' && (
        <Suspense fallback={null}>
          <PdfReader
            nodeId={id}
            data={data}
            doc={connection.doc}
            handle={connection.handle}
            initial={reading}
            onClose={() => setReading(null)}
          />
        </Suspense>
      )}
    </NodeShell>
  );
}

function Disconnected({
  data,
  connection,
  readOnly,
  onReconnect,
  onRelink,
}: {
  data: NodeOf<'pdf'>['data'];
  connection: Exclude<PdfConnection, { status: 'connected' }>;
  readOnly: boolean;
  onReconnect: () => void;
  onRelink: () => void;
}) {
  if (connection.status === 'unsupported')
    return <p className="p-4 text-sm text-muted">PDF nodes need Chrome or Edge.</p>;

  const busy = connection.status === 'checking' || connection.status === 'loading';
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      {connection.status === 'error' ? (
        <Mascot mood="tangled" className="size-14" />
      ) : busy ? (
        <Mascot mood="reading" animated className="size-14" />
      ) : (
        <FileText className="size-8 text-muted" />
      )}
      <div className="max-w-full truncate text-sm font-medium">{data.fileName}</div>
      <div className="text-xs text-muted">
        {connection.status === 'error'
          ? connection.message
          : data.pageCount
            ? `${data.pageCount} pages`
            : busy
              ? 'Opening…'
              : ''}
      </div>
      {connection.status === 'disconnected' && (
        <Button variant="primary" className="nodrag" onClick={onReconnect}>
          Reconnect
        </Button>
      )}
      {(connection.status === 'missing' || connection.status === 'error') && !readOnly && (
        <Button variant="primary" className="nodrag" onClick={onRelink}>
          Relink file…
        </Button>
      )}
    </div>
  );
}

/**
 * The pinned pages, or the cover while nothing is pinned, scaled to fill the node's height (a row) or width
 * (a column).
 */
function Filmstrip({
  doc,
  data,
  direction,
  onOpen,
}: {
  doc: PDFDocumentProxy;
  data: NodeOf<'pdf'>['data'];
  direction: 'row' | 'column';
  onOpen: (view: 'grid' | number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const area = useElementSize(ref);
  const zoom = useStore((s) => s.transform[2]);
  const hidden = hiddenPageCount(data.pinned, data.pageCount);
  const pages = shownPages(data.pinned);
  const pixelRatio = window.devicePixelRatio * zoom;
  const fit =
    direction === 'row'
      ? { height: Math.max(40, area.height - PADDING * 2) }
      : { width: Math.max(40, area.width - PADDING * 2) };

  // A click that ended a drag of the node is not a click on the page.
  const press = useRef({ x: 0, y: 0 });
  const open = (event: { clientX: number; clientY: number }, view: 'grid' | number) => {
    if (Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) < 4) onOpen(view);
  };

  // Scrolling over a row moves it sideways. Scroll and wheel stay local so the canvas does not zoom.
  const onWheel = (event: WheelEvent) => {
    if (direction === 'row' && ref.current) ref.current.scrollLeft += event.deltaY;
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={ref}
        onWheel={onWheel}
        className={cn(
          'nowheel absolute inset-0 flex overflow-auto bg-surface-2',
          direction === 'row' ? 'flex-row' : 'flex-col',
        )}
        style={{ gap: GAP, padding: PADDING }}
      >
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            aria-label={data.pinned.length === 0 ? 'Open the PDF' : `Open page ${page}`}
            className="nodrag shrink-0 cursor-pointer self-start shadow-sm ring-1 ring-border transition hover:ring-2 hover:ring-accent"
            onPointerDown={(e) => {
              press.current = { x: e.clientX, y: e.clientY };
            }}
            onClick={(e) => open(e, data.pinned.length === 0 ? 'grid' : page)}
          >
            <PdfPage doc={doc} page={page} fit={fit} pixelRatio={pixelRatio} />
          </button>
        ))}
      </div>
      {hidden !== undefined && hidden > 0 && (
        <button
          type="button"
          className="nodrag absolute right-3 bottom-3 cursor-pointer rounded-full bg-fg/80 px-2.5 py-1 text-xs font-medium text-canvas shadow-md hover:bg-fg"
          onClick={() => onOpen('grid')}
        >
          +{hidden} page{hidden === 1 ? '' : 's'}
        </button>
      )}
    </div>
  );
}
