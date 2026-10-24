import { useStore } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { LINK_ENDS, type LinkEnd } from '@/model/types';
import { ColorSwatches } from '@/nodes/ColorSwatches';
import { useCanvasStore } from '@/store/canvasStore';
import { useUiStore } from '@/store/uiStore';
import { deleteLink, editLink, swapLink } from './actions';
import { geom } from './geometry';
import { useLinkRoute } from './useLinkRoute';

/** Space kept between the toolbar and the canvas edge. */
const MARGIN = 8;
/** The AI panel (22rem) and its gap, which sit over the right of the canvas while it is open. */
const AI_PANEL_WIDTH = 368;
/** How far above the link the toolbar sits: clear of a label, which hangs just over the line. */
const ABOVE = 36;
/** The same, when it opens under the link. */
const BELOW = 18;
/** Below this many screen pixels from the canvas top (the toolbar bar floats there) it opens under the link. */
const FLIP_BELOW = 96;

const END_SHAPE: Record<LinkEnd, ReactNode> = {
  arrow: <polygon points="22,7 15,3 15,11" fill="currentColor" />,
  dot: <circle cx="19" cy="7" r="3.5" fill="currentColor" />,
  bar: (
    <line x1="21" y1="2.5" x2="21" y2="11.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  ),
  none: null,
};

/** A short line ending in the given shape, for the choice of head and tail. Tails are drawn mirrored. */
function EndIcon({ kind, tail }: { kind: LinkEnd; tail?: boolean }) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 26 14"
      aria-hidden="true"
      style={tail ? { transform: 'scaleX(-1)' } : undefined}
    >
      <line
        x1="3"
        y1="7"
        x2={kind === 'arrow' ? 15 : 19}
        y2="7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {END_SHAPE[kind]}
    </svg>
  );
}

const button =
  'flex h-7 min-w-8 cursor-pointer items-center justify-center rounded-lg border border-transparent px-1 text-fg hover:bg-surface-2';
const on = 'border-accent bg-accent/15 text-accent';

function EndChoice({
  label,
  value,
  onChange,
  tail,
}: {
  label: string;
  value: LinkEnd;
  onChange: (end: LinkEnd) => void;
  tail?: boolean;
}) {
  return (
    <fieldset className="m-0 flex items-center gap-0.5 border-0 p-0">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden="true" className="mr-1 text-[10px] tracking-wider text-muted uppercase">
        {label}
      </span>
      {LINK_ENDS.map((kind) => (
        <button
          key={kind}
          type="button"
          aria-label={`${label}: ${kind}`}
          aria-pressed={value === kind}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange(kind)}
          className={cn(button, value === kind && on)}
        >
          <EndIcon kind={kind} tail={tail} />
        </button>
      ))}
    </fieldset>
  );
}

const divider = <span className="h-5 w-px bg-border" />;

/**
 * Options for the selected link, floating just clear of it. One instance serves the whole
 * canvas: it shows while exactly one link is selected and nothing else is.
 */
export function LinkToolbar() {
  const link = useCanvasStore((s) => {
    const selected = s.edges.filter((e) => e.selected);
    return selected.length === 1 && !s.nodes.some((n) => n.selected) ? selected[0] : null;
  });
  const editing = useUiStore((s) => s.renamingLink);
  const pts = useLinkRoute(link?.id ?? '', link?.source ?? '', link?.target ?? '');
  const [tx, ty, zoom] = useStore((s) => s.transform);
  const width = useStore((s) => s.width);
  const aiPanelOpen = useUiStore((s) => s.aiPanelOpen);
  const ref = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(0);
  // Its own width, so it can be kept on screen whatever it holds; re-read after every render.
  useLayoutEffect(() => {
    const w = ref.current?.offsetWidth ?? 0;
    if (w !== measured) setMeasured(w);
  });
  if (!link || !pts || editing === link.id) return null;

  const { mid } = geom(pts);
  // Clear of the AI panel when it is open, and wrapping onto a second row if the canvas is too narrow.
  const right = width - MARGIN - (aiPanelOpen ? AI_PANEL_WIDTH : 0);
  const available = Math.max(160, right - MARGIN);
  const left = Math.max(
    MARGIN,
    Math.min(right - Math.min(measured, available), mid[0] * zoom + tx - measured / 2),
  );
  // Over the topmost point of the link (under the lowest when there is no room), so it never covers the link
  // it edits: the second click of a double-click lands on the link, not on the toolbar that just appeared.
  const top = Math.min(...pts.map((p) => p[1])) * zoom + ty;
  const bottom = Math.max(...pts.map((p) => p[1])) * zoom + ty;
  const below = top < FLIP_BELOW;
  const y = below ? bottom : top;
  const data = link.data;

  return (
    <div
      role="toolbar"
      aria-label="Link options"
      ref={ref}
      className="link-toolbar nodrag nopan nowheel nokey absolute z-20 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-fg shadow-xl"
      style={{
        left,
        top: below ? y + BELOW : y - ABOVE,
        maxWidth: available,
        transform: below ? undefined : 'translateY(-100%)',
      }}
    >
      <EndChoice
        label="Tail"
        value={data?.tail ?? 'none'}
        onChange={(tail) => editLink(link.id, { tail })}
        tail
      />
      {divider}
      <EndChoice
        label="Head"
        value={data?.head ?? 'arrow'}
        onChange={(head) => editLink(link.id, { head })}
      />
      {divider}
      <ColorSwatches
        links
        value={data?.color}
        onChange={(color) => editLink(link.id, { color })}
        onClear={() => editLink(link.id, { color: undefined })}
      />
      {divider}
      <button
        type="button"
        aria-label="Dashed"
        aria-pressed={!!data?.dashed}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editLink(link.id, { dashed: !data?.dashed })}
        className={cn(button, data?.dashed && on)}
      >
        <svg width="22" height="6" aria-hidden="true">
          <line x1="1" y1="3" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Swap direction"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => swapLink(link.id)}
        className={button}
      >
        <svg
          width="18"
          height="14"
          viewBox="0 0 18 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 4h13M12 1l3 3-3 3M16 10H3M6 7l-3 3 3 3" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Delete link"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => deleteLink(link.id)}
        className={cn(button, 'text-danger hover:bg-danger/10')}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
