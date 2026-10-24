import { BaseEdge, type EdgeProps, type EdgeTypes, useInternalNode } from '@xyflow/react';
import { memo, useMemo } from 'react';
import { cn } from '@/lib/cn';
import type { AppEdge, LinkEnd } from '@/model/types';
import { useCanvasStore } from '@/store/canvasStore';
import { type Box, endPlacement, lanesOf, type Pt, roundedPath, route, tileRect } from './geometry';

/** Width of the invisible strip around a link that takes clicks, in screen pixels. */
const HIT_WIDTH = 14;

/** The shape at one end of a link, in the link's colour. Plain SVG (no markers) so it exports with the rest. */
function EndShape({ kind, to, from }: { kind: LinkEnd; to: Pt; from: Pt }) {
  if (kind === 'none') return null;
  const { x, y, angle } = endPlacement(to, from);
  // Counter-scaled with the zoom (--tz) so the shape stays readable when the canvas is small.
  const transform = `translate(${x}px, ${y}px) rotate(${angle}deg) scale(var(--tz, 1))`;
  return (
    <g className="link-end" style={{ transform }}>
      {kind === 'arrow' && <polygon points="0,0 -11,-5.5 -11,5.5" fill="currentColor" />}
      {kind === 'dot' && <circle cx={-4} cy={0} r={4.5} fill="currentColor" />}
      {kind === 'bar' && (
        <line x1={-1} y1={-7} x2={-1} y2={7} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      )}
    </g>
  );
}

function useTile(id: string): Box | null {
  const node = useInternalNode(id);
  const width = node?.measured.width;
  const height = node?.measured.height;
  const x = node?.internals.positionAbsolute.x;
  const y = node?.internals.positionAbsolute.y;
  return useMemo(
    () => (width && height && x !== undefined && y !== undefined ? tileRect(x, y, width, height) : null),
    [width, height, x, y],
  );
}

/**
 * A link between two nodes. React Flow only supplies the ids and selection: the pipe is routed here from the
 * two nodes' boxes, so it ignores the handle positions React Flow computed.
 */
export const LinkEdge = memo(function LinkEdge({ id, source, target, data, selected }: EdgeProps<AppEdge>) {
  const from = useTile(source);
  const to = useTile(target);
  const lane = useCanvasStore((s) => lanesOf(s.edges).get(id) ?? 0);
  const pts = useMemo(() => (from && to ? route(from, to, lane) : null), [from, to, lane]);
  if (!pts) return null;

  const head = data?.head ?? 'arrow';
  const tail = data?.tail ?? 'none';
  const d = roundedPath(pts);
  return (
    <g
      className={cn('link', data?.dashed && 'dashed')}
      data-link-id={id}
      style={{ '--link-color': `var(--link-${data?.color ?? 'auto'})` } as React.CSSProperties}
    >
      {selected && <path className="link-halo" d={d} fill="none" />}
      <BaseEdge id={id} path={d} className="link-line" interactionWidth={HIT_WIDTH} />
      <EndShape kind={head} to={pts[pts.length - 1]} from={pts[pts.length - 2]} />
      <EndShape kind={tail} to={pts[0]} from={pts[1]} />
    </g>
  );
});

export const edgeTypes = { default: LinkEdge } satisfies EdgeTypes;
