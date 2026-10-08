import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * An animated ASCII field. A lattice of monospace glyphs whose density is driven
 * by layered sine waves; the pointer punches a bloom of ink through it (with a
 * trailing ripple) and page scroll shifts the phase, so the whole field drifts
 * as you move down the page.
 */

const RAMP = ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

type Props = {
  className?: string;
  /** Base visibility of the waves, 0..1 */
  intensity?: number;
  /** Radius of the pointer bloom in px */
  radius?: number;
  cellW?: number;
  cellH?: number;
  /** Warm cells at the hot core of the bloom (mascot tentacle tips) */
  warm?: boolean;
};

export function AsciiField({
  className,
  intensity = 0.5,
  radius = 190,
  cellW = 10,
  cellH = 17,
  warm = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -9999, y: -9999, tx: -9999, ty: -9999, active: false });
  const scroll = useRef(0);
  const visible = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    const start = performance.now();

    // Quantised palette so we touch fillStyle as rarely as possible.
    const STEPS = 26;
    const cool: string[] = [];
    const hot: string[] = [];
    for (let i = 0; i < STEPS; i++) {
      const t = i / (STEPS - 1);
      const a = (0.06 + t * 0.62).toFixed(3);
      cool.push(`rgba(100,116,139,${a})`);
      hot.push(`rgba(59,130,246,${a})`);
    }
    const core = warm ? `rgba(249,115,22,0.85)` : hot[STEPS - 1];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const io = new IntersectionObserver((entries) => {
      visible.current = entries[0]?.isIntersecting ?? true;
    });
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.tx = e.clientX - rect.left;
      pointer.current.ty = e.clientY - rect.top;
      pointer.current.active = true;
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    const onScroll = () => {
      scroll.current = window.scrollY;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible.current || w === 0) return;

      const t = (now - start) / 1000;
      const p = pointer.current;
      // Ease the bloom toward the cursor so it feels like ink in water.
      p.x += (p.tx - p.x) * 0.16;
      p.y += (p.ty - p.y) * 0.16;
      const drift = scroll.current * 0.35;

      ctx.clearRect(0, 0, w, h);
      ctx.font = `500 ${cellH - 3}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const cols = Math.ceil(w / cellW) + 1;
      const rows = Math.ceil(h / cellH) + 1;
      let lastFill = '';

      for (let r = 0; r < rows; r++) {
        const y = r * cellH + cellH / 2;
        // Vertical fade so the field dissolves into the section below.
        const fade = 1 - Math.min(1, Math.max(0, (y - h * 0.45) / (h * 0.6))) * 0.85;
        for (let c = 0; c < cols; c++) {
          const x = c * cellW + cellW / 2;

          // Layered waves — slow swell plus a finer cross-ripple.
          const s1 = Math.sin(x * 0.0105 + t * 0.55 + drift * 0.004);
          const s2 = Math.cos(y * 0.0145 - t * 0.38 - drift * 0.006);
          const s3 = Math.sin((x + y) * 0.0062 + t * 0.21);
          let v = (s1 * s2 * 0.62 + s3 * 0.38) * 0.5 + 0.5;

          let heat = 0;
          if (p.active) {
            const dx = x - p.x;
            const dy = (y - p.y) * 0.86; // glyphs are taller than wide
            const d = Math.hypot(dx, dy);
            if (d < radius) {
              const fall = 1 - d / radius;
              heat = fall * fall * (3 - 2 * fall); // smoothstep
              // Concentric wake radiating out of the cursor.
              heat += Math.max(0, Math.sin(d * 0.075 - t * 4.2)) * fall * 0.34;
              heat = Math.min(1, heat);
            }
          }

          v = v * intensity * fade + heat * 1.05;
          if (v < 0.055) continue;
          if (v > 1) v = 1;

          const glyph = RAMP[Math.min(RAMP.length - 1, (v * (RAMP.length - 1)) | 0)];
          if (glyph === ' ') continue;

          const bucket = Math.min(STEPS - 1, (v * STEPS) | 0);
          let fill: string;
          if (heat > 0.86) fill = core;
          else if (heat > 0.02) fill = hot[Math.max(bucket, (heat * STEPS) | 0) % STEPS];
          else fill = cool[bucket];

          if (fill !== lastFill) {
            ctx.fillStyle = fill;
            lastFill = fill;
          }
          ctx.fillText(glyph, x, y);
        }
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [intensity, radius, cellW, cellH, warm]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('ascii-canvas pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
}
