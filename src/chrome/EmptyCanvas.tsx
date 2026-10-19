import { useCanvasStore } from '@/store/canvasStore';
import { Mascot } from '@/ui/Mascot';

/** Centered hint over a canvas with no nodes. Never intercepts pointer events, so double-click still places a node. */
export function EmptyCanvas() {
  const empty = useCanvasStore((s) => s.nodes.length === 0);
  if (!empty) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      data-testid="empty-canvas"
    >
      <div className="flex max-w-xs select-none flex-col items-center text-center">
        <Mascot mood="wave" animated className="mb-2 size-28" title="Waving octopus" />
        <p className="font-medium text-base text-fg tracking-tight">A blank canvas</p>
        <p className="mt-1 text-muted text-sm leading-relaxed">
          Double-click anywhere to place a node, or drop in an image or PDF.
        </p>
      </div>
    </div>
  );
}
