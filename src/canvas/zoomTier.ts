import { useStore } from '@xyflow/react';

/** How much a node shows at a zoom level: everything, readable tabs, or just its title. */
export type ZoomTier = 'near' | 'mid' | 'far';

const MID_BELOW = 0.72;
const FAR_BELOW = 0.42;

export const zoomTier = (zoom: number): ZoomTier =>
  zoom < FAR_BELOW ? 'far' : zoom < MID_BELOW ? 'mid' : 'near';

/**
 * How much to scale a node's tab (and a far node's title) up so it keeps its on-screen size while the
 * canvas shrinks. Rounded to quarters, so the page restyles a few dozen times across a zoom, not on every tick.
 */
export const counterScale = (zoom: number) => (zoom >= 1 ? 1 : Math.round(4 / zoom) / 4);

/** The tier and counter-scale for the current zoom; only re-renders when either changes. */
export function useZoomTier() {
  const tier = useStore((s) => zoomTier(s.transform[2]));
  const scale = useStore((s) => counterScale(s.transform[2]));
  return { tier, scale };
}
