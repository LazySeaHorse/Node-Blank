import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { TopBar, ZoomControls } from './Chrome';

/** The app at a desktop width, scaled to fit its column. Nothing in it responds to the pointer. */
const W = 1080;
const H = 650;

export type Placed = { x: number; y: number; node: ReactNode };

export function AppMock({
  nodes,
  overlay,
  aiOn,
  zoom,
  className,
}: {
  nodes: Placed[];
  /** Absolutely positioned chrome in world coordinates (AI panel, banner). */
  overlay?: ReactNode;
  aiOn?: boolean;
  zoom?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'canvas-grid pointer-events-none relative w-full overflow-hidden rounded-2xl border border-border/80 bg-canvas shadow-2xl shadow-slate-900/10 ring-1 ring-border/60 select-none',
        className,
      )}
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: W,
          height: H,
          transform: `scale(${scale})`,
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        {nodes.map((n, i) => (
          <div key={i} className="absolute" style={{ left: n.x, top: n.y }}>
            {n.node}
          </div>
        ))}
        <div className="absolute inset-x-3 top-3">
          <TopBar aiOn={aiOn} />
        </div>
        {overlay}
        <div className="absolute right-3.5 bottom-3.5">
          <ZoomControls zoom={zoom} />
        </div>
      </div>
    </div>
  );
}
