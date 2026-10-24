import type { ConnectionLineComponentProps } from '@xyflow/react';
import { GRID } from '../snap';
import { endPlacement, type Pt, roundedPath, route, tileRect } from './geometry';
import { useEndScale } from './LinkEdge';

const snap = (v: number) => Math.round(v / GRID) * GRID;

/**
 * The pipe shown while dragging a new link: from the node being dragged from to the pointer (snapped to the
 * grid), or to the border of the node under it. Dashed, in the accent colour.
 */
export function LinkPreview({ fromNode, toNode, pointer }: ConnectionLineComponentProps) {
  const scale = useEndScale();
  const size = (n: typeof fromNode) => n.measured;
  if (!size(fromNode).width || !size(fromNode).height) return null;
  const tile = (n: typeof fromNode) =>
    tileRect(
      n.internals.positionAbsolute.x,
      n.internals.positionAbsolute.y,
      size(n).width ?? 0,
      size(n).height ?? 0,
    );
  const a = tile(fromNode);
  const over = toNode && toNode.id !== fromNode.id && size(toNode).width ? tile(toNode) : null;
  const target = over ?? { x: snap(pointer.x), y: snap(pointer.y), w: 0, h: 0 };
  // Still inside the node it started from: nothing to show yet.
  if (!over && pointer.x >= a.x && pointer.x <= a.x + a.w && pointer.y >= a.y && pointer.y <= a.y + a.h)
    return null;
  const pts = route(a, target, 0);
  if (!pts) return null;
  const end = pts[pts.length - 1];
  const tip = endPlacement(end, pts[pts.length - 2] as Pt);
  return (
    <g className="link-preview">
      <path d={roundedPath(pts)} fill="none" />
      {over ? (
        <polygon
          points="0,0 -11,-5.5 -11,5.5"
          style={{
            transform: `translate(${tip.x}px, ${tip.y}px) rotate(${tip.angle}deg) scale(${scale})`,
          }}
        />
      ) : (
        <circle cx={end[0]} cy={end[1]} r={4} />
      )}
    </g>
  );
}
