import { useStore } from '@xyflow/react';

/** How much a node shows at a zoom level: everything, or hidden controls. */
export type ZoomTier = 'near' | 'mid';

const MID_BELOW = 0.72;

export const zoomTier = (zoom: number): ZoomTier => (zoom < MID_BELOW ? 'mid' : 'near');

/** The tier for the current zoom; only re-renders when it changes. */
export const useZoomTier = () => useStore((s) => zoomTier(s.transform[2]));
