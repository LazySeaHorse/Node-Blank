import { useStore } from '@xyflow/react';

/** Below this zoom a page is a thumbnail nobody can use, so it is not kept running. */
export const MIN_ZOOM = 0.2;
/** How far outside the screen, as a share of its size, a node still counts as close. */
const MARGIN = 0.5;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Whether a node (in canvas coordinates) is on screen or within `MARGIN` of it, at a zoom that is readable. */
export function isNearScreen(
  node: Box,
  view: { x: number; y: number; zoom: number },
  screen: { width: number; height: number },
): boolean {
  if (view.zoom < MIN_ZOOM) return false;
  const left = node.x * view.zoom + view.x;
  const top = node.y * view.zoom + view.y;
  const right = left + node.width * view.zoom;
  const bottom = top + node.height * view.zoom;
  return (
    right > -screen.width * MARGIN &&
    left < screen.width * (1 + MARGIN) &&
    bottom > -screen.height * MARGIN &&
    top < screen.height * (1 + MARGIN)
  );
}

/**
 * Whether the node `id` is close enough to the screen to keep its page running. Pages are heavy, so the
 * others are unloaded. The selector returns a boolean, so the node renders only when this flips.
 */
export function useNearScreen(id: string): boolean {
  return useStore((s) => {
    const node = s.nodeLookup.get(id);
    if (!node) return true;
    const [x, y, zoom] = s.transform;
    const { positionAbsolute } = node.internals;
    return isNearScreen(
      {
        ...positionAbsolute,
        width: node.measured.width ?? node.width ?? 0,
        height: node.measured.height ?? node.height ?? 0,
      },
      { x, y, zoom },
      { width: s.width, height: s.height },
    );
  });
}
