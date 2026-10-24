import { useInternalNode } from '@xyflow/react';
import { useMemo } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { type Box, lanesOf, type Pt, route, tileRect } from './geometry';

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
 * The corner points of a link's pipe, from its two nodes' boxes and its lane among parallel links.
 * Null while either node is missing or not yet measured, or when they leave no room for a pipe.
 */
export function useLinkRoute(id: string, source: string, target: string): Pt[] | null {
  const from = useTile(source);
  const to = useTile(target);
  const lane = useCanvasStore((s) => lanesOf(s.edges).get(id) ?? 0);
  return useMemo(() => (from && to ? route(from, to, lane) : null), [from, to, lane]);
}
