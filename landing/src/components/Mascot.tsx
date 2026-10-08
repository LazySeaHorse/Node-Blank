import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The Node-Blank octopus, rebuilt 1:1 from public/logo/mascot.svg and driven by
 * the app's own animation classes: .mascot-arm (sway), .mascot-head (bob),
 * .mascot-eyes (blink) and .mascot-working (both, faster).
 * The pupils additionally follow the pointer — an octopus on a canvas should
 * watch your cursor.
 */

type MascotProps = {
  className?: string;
  /** Faster sway/bob — the state the app puts the mascot in while an agent edits. */
  working?: boolean;
  track?: boolean;
  title?: string;
};

export function Mascot({ className, working = false, track = true, title }: MascotProps) {
  const uid = useId().replace(/:/g, '');
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!track) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.45;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy) || 1;
        // Saturate the glance at ~3.2 user units so it never looks cross-eyed.
        const k = Math.min(1, 260 / d) * 3.2;
        setLook({ x: (dx / d) * k, y: (dy / d) * k });
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [track]);

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      fill="none"
      role="img"
      aria-label={title ?? 'Node-Blank octopus mascot'}
      className={cn(working && 'mascot-working', className)}
    >
      <defs>
        <linearGradient id={`body-${uid}`} x1="64" y1="8" x2="64" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7cb4ff" />
          <stop offset="0.55" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={`arm-${uid}`} x1="0" y1="72" x2="0" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id={`tip-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>

      {/* Tentacles */}
      <g
        className="mascot-arm"
        stroke={`url(#arm-${uid})`}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M33 72 C 22 84, 38 92, 26 108" />
        <path d="M46 76 C 38 90, 54 98, 44 116" />
        <path d="M58 77 C 55 92, 66 98, 60 117" />
        <path d="M70 77 C 73 92, 62 98, 68 117" />
        <path d="M82 76 C 90 90, 74 98, 84 116" />
        <path d="M95 72 C 106 84, 90 92, 102 108" />
      </g>
      <g fill={`url(#tip-${uid})`}>
        <circle cx="26" cy="108" r="4.6" />
        <circle cx="44" cy="116" r="4.6" />
        <circle cx="60" cy="117" r="4.6" />
        <circle cx="68" cy="117" r="4.6" />
        <circle cx="84" cy="116" r="4.6" />
        <circle cx="102" cy="108" r="4.6" />
      </g>

      {/* Head */}
      <g className="mascot-head">
        <path
          d="M22 62 C 22 26, 42 8, 64 8 C 86 8, 106 26, 106 62 C 106 72, 98 80, 64 80 C 30 80, 22 72, 22 62 Z"
          fill={`url(#body-${uid})`}
        />
        <path
          d="M22 62 C 22 72, 30 80, 64 80 C 98 80, 106 72, 106 62 C 104 70, 92 74, 64 74 C 36 74, 24 70, 22 62 Z"
          fill="#1d4ed8"
          opacity=".25"
        />
        <g fill="#fb923c">
          <circle cx="47" cy="27" r="4.2" />
          <circle cx="72" cy="20" r="3" />
          <circle cx="86" cy="32" r="4.6" />
          <circle cx="62" cy="34" r="2.2" />
        </g>
        <ellipse cx="42" cy="32" rx="10" ry="5.2" transform="rotate(-32 42 32)" fill="#fff" opacity=".5" />
        <ellipse cx="33" cy="46" rx="2.6" ry="1.6" transform="rotate(-60 33 46)" fill="#fff" opacity=".45" />

        <g className="mascot-eyes">
          <ellipse cx="49" cy="57" rx="10" ry="11.5" fill="#fff" />
          <ellipse cx="79" cy="57" rx="10" ry="11.5" fill="#fff" />
          <g transform={`translate(${look.x} ${look.y})`}>
            <circle cx="51" cy="59" r="6" fill="#0f172a" />
            <circle cx="81" cy="59" r="6" fill="#0f172a" />
            <circle cx="53" cy="56.5" r="2.1" fill="#fff" />
            <circle cx="83" cy="56.5" r="2.1" fill="#fff" />
          </g>
        </g>

        <ellipse cx="34" cy="70" rx="6" ry="3.4" fill="#fb923c" opacity=".75" />
        <ellipse cx="94" cy="70" rx="6" ry="3.4" fill="#fb923c" opacity=".75" />
        <path d="M59 71 Q64 76 69 71" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
