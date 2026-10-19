import { useEffect, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { EmptyState } from '@/ui/EmptyState';
import { Mascot } from '@/ui/Mascot';

export const SLEEPY_AFTER_MS = 45_000;
const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const;

/** True once there has been no pointer or key activity for `ms`; flips back on activity. */
function useIdle(ms: number) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), ms);
    };
    const onActivity = () => {
      setIdle(false);
      arm();
    };
    arm();
    for (const e of ACTIVITY_EVENTS) window.addEventListener(e, onActivity, { passive: true });
    return () => {
      clearTimeout(timer);
      for (const e of ACTIVITY_EVENTS) window.removeEventListener(e, onActivity);
    };
  }, [ms]);
  return idle;
}

/** Centered hint over a canvas with no nodes. Never intercepts pointer events, so double-click still places a node. */
export function EmptyCanvas() {
  const empty = useCanvasStore((s) => s.nodes.length === 0);
  if (!empty) return null;
  return <EmptyHint />;
}

function EmptyHint() {
  const idle = useIdle(SLEEPY_AFTER_MS);
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      data-testid="empty-canvas"
    >
      <EmptyState
        className="max-w-xs"
        mascot={
          <Mascot
            mood={idle ? 'sleepy' : 'wave'}
            animated
            className="size-28"
            title={idle ? 'Sleepy octopus' : 'Waving octopus'}
          />
        }
        title="A blank canvas"
        description="Double-click anywhere to place a node, or drop in an image or PDF."
      />
    </div>
  );
}
