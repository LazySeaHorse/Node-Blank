import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import './mascot.css';
import { type MascotMood, mascotViewBox } from './moods';

export type { MascotMood } from './moods';

export type MascotProps = {
  mood?: MascotMood;
  className?: string;
  /** Accessible name. */
  title?: string;
  /** Extra motion for the mood: waving, twinkling confetti, floating props. Off for reduced motion. */
  animated?: boolean;
  /** The pupils follow the pointer. */
  track?: boolean;
};

const INK = '#0f172a';
const BLUE = '#3b82f6';
const ORANGE = '#f97316';

type Arm = { d: string; tip: readonly [number, number]; part?: string };

const ARMS: readonly Arm[] = [
  { d: 'M33 72 C 22 84, 38 92, 26 108', tip: [26, 108] },
  { d: 'M46 76 C 38 90, 54 98, 44 116', tip: [44, 116] },
  { d: 'M58 77 C 55 92, 66 98, 60 117', tip: [60, 117] },
  { d: 'M70 77 C 73 92, 62 98, 68 117', tip: [68, 117] },
  { d: 'M82 76 C 90 90, 74 98, 84 116', tip: [84, 116] },
  { d: 'M95 72 C 106 84, 90 92, 102 108', tip: [102, 108] },
];

const LEFT_UP: Arm = { d: 'M33 70 C 14 66, 14 44, 20 28', tip: [20, 28] };
const RIGHT_UP: Arm = { d: 'M95 70 C 114 66, 114 44, 108 28', tip: [108, 28] };
/** Both outer tentacles curl in to hold something at the belly. */
const HOLD_LEFT: Arm = { d: 'M33 72 C 22 88, 30 100, 42 100', tip: [42, 100] };
const HOLD_RIGHT: Arm = { d: 'M95 72 C 106 88, 98 100, 86 100', tip: [86, 100] };

/** Tentacles that differ from the resting pose, by index. */
const POSES: Partial<Record<MascotMood, Record<number, Arm>>> = {
  wave: { 5: { d: 'M95 70 C 116 66, 118 46, 114 30', tip: [114, 30], part: 'wave' } },
  cheer: { 0: LEFT_UP, 5: RIGHT_UP },
  plug: { 5: { d: 'M95 70 C 116 70, 118 54, 112 42', tip: [112, 42] } },
  reading: { 0: HOLD_LEFT, 5: HOLD_RIGHT },
  map: { 0: HOLD_LEFT, 5: HOLD_RIGHT },
  peek: {
    0: { d: 'M33 72 C 24 76, 22 82, 22 88', tip: [22, 88] },
    5: { d: 'M95 72 C 104 76, 106 82, 106 88', tip: [106, 88] },
  },
  tangled: {
    1: { d: 'M46 76 C 70 90, 42 100, 70 114', tip: [70, 114] },
    2: { d: 'M58 77 C 40 92, 78 100, 50 112', tip: [50, 112] },
    3: { d: 'M70 77 C 88 92, 50 100, 78 112', tip: [78, 112] },
    4: { d: 'M82 76 C 58 90, 86 100, 58 114', tip: [58, 114] },
  },
};

const CONFETTI: { x: number; y: number; w: number; h: number; r: number; fill: string }[] = [
  { x: 4, y: -2, w: 5, h: 2.6, r: 30, fill: ORANGE },
  { x: 30, y: -10, w: 4, h: 4, r: 0, fill: '#60a5fa' },
  { x: 58, y: -12, w: 5, h: 2.6, r: -25, fill: BLUE },
  { x: 92, y: -8, w: 4, h: 4, r: 15, fill: ORANGE },
  { x: 120, y: 0, w: 5, h: 2.6, r: -35, fill: '#60a5fa' },
  { x: -4, y: 38, w: 4, h: 4, r: 20, fill: BLUE },
  { x: 126, y: 40, w: 4, h: 4, r: 40, fill: ORANGE },
  { x: 8, y: 14, w: 3, h: 3, r: 0, fill: INK },
  { x: 116, y: 18, w: 3, h: 3, r: 0, fill: INK },
];

/** Props drawn behind the body and arms, and in front of them. */
function propsFor({ mood }: { mood: MascotMood }): { behind?: ReactNode; front?: ReactNode } {
  switch (mood) {
    case 'cheer':
      return {
        front: (
          <g data-part="confetti">
            {CONFETTI.map((c) => (
              <rect
                key={`${c.x}-${c.y}`}
                x={c.x}
                y={c.y}
                width={c.w}
                height={c.h}
                rx="0.8"
                fill={c.fill}
                transform={`rotate(${c.r} ${c.x + c.w / 2} ${c.y + c.h / 2})`}
              />
            ))}
          </g>
        ),
      };
    case 'nervous':
      return {
        front: (
          <g data-part="sweat">
            <path
              d="M104 22 C 99 30, 98 35, 104 38 C 110 35, 109 30, 104 22 Z"
              fill="#93c5fd"
              stroke="#2563eb"
              strokeWidth="1.4"
            />
            <ellipse cx="102.5" cy="33" rx="1.2" ry="2" fill="#fff" opacity=".7" />
          </g>
        ),
      };
    case 'sleepy':
      return {
        front: (
          <g
            data-part="float"
            fill="none"
            stroke={BLUE}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M96 18 h9 l-9 10 h9" />
            <path d="M110 4 h6 l-6 7 h6" strokeWidth="2" />
          </g>
        ),
      };
    case 'thinking':
      return {
        front: (
          <g data-part="float">
            <circle cx="86" cy="-2" r="2" fill="#93c5fd" />
            <circle cx="76" cy="3" r="1.4" fill="#93c5fd" />
            <ellipse cx="64" cy="-16" rx="22" ry="14" fill="#eff6ff" stroke={BLUE} strokeWidth="2" />
            <text
              x="64"
              y="-8"
              textAnchor="middle"
              fontSize="22"
              fontWeight="700"
              fontFamily="serif"
              fill={BLUE}
            >
              ∑
            </text>
          </g>
        ),
      };
    case 'plug':
      return {
        front: (
          <g data-part="cable">
            <path
              d="M112 42 C 112 54, 128 54, 138 66 S 142 100, 130 110"
              stroke={INK}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path d="M107 22 v-7 M117 22 v-7" stroke={ORANGE} strokeWidth="2.6" strokeLinecap="round" />
            <rect x="103" y="22" width="18" height="14" rx="4" fill={INK} />
            <circle cx="112" cy="29" r="2" fill={ORANGE} />
          </g>
        ),
      };
    case 'reading':
      return {
        front: (
          <g data-part="page">
            <rect x="42" y="80" width="44" height="34" rx="3" fill="#fff" stroke={BLUE} strokeWidth="2" />
            <path d="M42 80 h44 v7 h-44z" fill={ORANGE} />
            <text
              x="64"
              y="86"
              textAnchor="middle"
              fontSize="6"
              fontWeight="700"
              fontFamily="monospace"
              fill="#fff"
            >
              PDF
            </text>
            <path
              d="M48 95 h32 M48 101 h32 M48 107 h20"
              stroke={INK}
              strokeWidth="2"
              strokeLinecap="round"
              opacity=".55"
            />
          </g>
        ),
      };
    case 'map':
      return {
        front: (
          <g data-part="grid">
            <rect x="42" y="80" width="44" height="34" rx="3" fill="#fff" stroke={BLUE} strokeWidth="2" />
            <path d="M42 91 h44 M42 103 h44 M57 80 v34 M72 80 v34" stroke="#bfdbfe" strokeWidth="1.2" />
            <rect x="46" y="84" width="10" height="6" rx="1.5" fill={BLUE} />
            <rect x="73" y="95" width="10" height="6" rx="1.5" fill={ORANGE} />
            <path d="M56 87 C 66 87, 66 98, 73 98" stroke={INK} strokeWidth="1.4" />
          </g>
        ),
      };
    case 'peek':
      return {
        front: (
          <g data-part="edge">
            <rect x="-4" y="88" width="136" height="44" rx="5" fill="#334155" />
            <circle cx="22" cy="88" r="4.6" fill={ORANGE} />
            <circle cx="106" cy="88" r="4.6" fill={ORANGE} />
          </g>
        ),
      };
    default:
      return {};
  }
}

const FACE_LOOK: Partial<Record<MascotMood, readonly [number, number]>> = {
  curious: [3, -2.5],
  reading: [0, 3.5],
  thinking: [-3, -3.5],
  peek: [0, -4],
  plug: [2, 0],
};

function Eyes({ mood, look }: { mood: MascotMood; look: readonly [number, number] }) {
  if (mood === 'sleepy') {
    return (
      <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none">
        <path d="M40 58 Q49 65 58 58" />
        <path d="M70 58 Q79 65 88 58" />
      </g>
    );
  }
  if (mood === 'cheer') {
    return (
      <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M40 60 Q49 48 58 60" />
        <path d="M70 60 Q79 48 88 60" />
      </g>
    );
  }
  if (mood === 'tangled') {
    const spiral = (cx: number) =>
      `M${cx} 57 m0 0 a1.5 1.5 0 1 1 3 0 a3.5 3.5 0 1 1 -7 0 a5.5 5.5 0 1 1 11 0 a7.5 7.5 0 1 1 -15 0`;
    return (
      <g>
        <ellipse cx="49" cy="57" rx="10" ry="11.5" fill="#fff" />
        <ellipse cx="79" cy="57" rx="10" ry="11.5" fill="#fff" />
        <g stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d={spiral(49)} />
          <path d={spiral(79)} />
        </g>
      </g>
    );
  }
  const small = mood === 'nervous';
  return (
    <g>
      <ellipse cx="49" cy="57" rx="10" ry="11.5" fill="#fff" />
      <ellipse cx="79" cy="57" rx="10" ry="11.5" fill="#fff" />
      <g transform={`translate(${look[0]} ${look[1]})`}>
        <circle cx={small ? 50 : 51} cy={small ? 60 : 59} r={small ? 4 : 6} fill={INK} />
        <circle cx={small ? 80 : 81} cy={small ? 60 : 59} r={small ? 4 : 6} fill={INK} />
        <circle cx="53" cy="56.5" r={small ? 1.5 : 2.1} fill="#fff" />
        <circle cx="83" cy="56.5" r={small ? 1.5 : 2.1} fill="#fff" />
      </g>
    </g>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  const stroke = { stroke: INK, strokeWidth: 2.4, strokeLinecap: 'round' as const, fill: 'none' };
  switch (mood) {
    case 'wave':
      return (
        <path d="M57 70 Q64 80 71 70 Z" fill={INK} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      );
    case 'cheer':
      return (
        <path d="M55 69 Q64 84 73 69 Z" fill={INK} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      );
    case 'curious':
    case 'peek':
      return <ellipse cx="64" cy="73" rx="3" ry="3.4" fill={INK} />;
    case 'nervous':
      return <path d="M57 74 q3.5 -4 7 0 t7 0" {...stroke} />;
    case 'tangled':
      return <path d="M57 74 q3.5 -5 7 0 t7 0" {...stroke} />;
    case 'sleepy':
      return <ellipse cx="64" cy="73" rx="2.4" ry="2" fill={INK} />;
    case 'thinking':
      return <path d="M59 73 h10" {...stroke} />;
    default:
      return <path d="M59 71 Q64 76 69 71" {...stroke} />;
  }
}

/**
 * The blue and orange jelly octopus. Sways gently when idle, wiggles faster while an agent works,
 * and wears a face and props per mood. Animations live in mascot.css and switch off for people who
 * prefer reduced motion.
 */
export function Mascot({ mood = 'idle', className, title, animated = false, track = false }: MascotProps) {
  const uid = useId().replace(/:/g, '');
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState<readonly [number, number] | null>(null);

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
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.45);
        const d = Math.hypot(dx, dy) || 1;
        // Saturate the glance at ~3.2 user units so it never looks cross-eyed.
        const k = Math.min(1, 260 / d) * 3.2;
        setLook([(dx / d) * k, (dy / d) * k]);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [track]);

  const pose = POSES[mood] ?? {};
  const { behind, front } = propsFor({ mood });
  const eyeLook = (track && look) || FACE_LOOK[mood] || [0, 0];

  return (
    <svg
      ref={ref}
      viewBox={mascotViewBox(mood)}
      fill="none"
      role="img"
      aria-label={title ?? 'Node-Blank octopus mascot'}
      data-mood={mood}
      className={cn(
        'mascot mascot-edge overflow-visible',
        mood === 'working' && 'mascot-working',
        animated && 'mascot-animated',
        className,
      )}
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="64" y1="8" x2="64" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7cb4ff" />
          <stop offset="0.55" stopColor={BLUE} />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={`${uid}-arm`} x1="0" y1="72" x2="0" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={BLUE} />
          <stop offset="1" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id={`${uid}-tip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset="1" stopColor={ORANGE} />
        </linearGradient>
      </defs>
      {behind && <g data-part="behind">{behind}</g>}
      {ARMS.map((rest, i) => {
        const arm = pose[i] ?? rest;
        return (
          <g
            key={rest.d}
            data-part={`arm-${i}`}
            className="mascot-arm"
            style={{ animationDelay: `${i * -0.35}s` }}
          >
            <g data-part={arm.part}>
              <path d={arm.d} stroke={`url(#${uid}-arm)`} strokeWidth="10" strokeLinecap="round" />
              <circle cx={arm.tip[0]} cy={arm.tip[1]} r="4.6" fill={`url(#${uid}-tip)`} />
            </g>
          </g>
        );
      })}
      <g className="mascot-head" data-part="head">
        <path
          d="M22 62 C 22 26, 42 8, 64 8 C 86 8, 106 26, 106 62 C 106 72 98 80 64 80 C 30 80 22 72 22 62 Z"
          fill={`url(#${uid}-body)`}
        />
        <path
          d="M22 62 C 22 72 30 80 64 80 C 98 80 106 72 106 62 C 104 70 92 74 64 74 C 36 74 24 70 22 62Z"
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
        <g className="mascot-eyes" data-part="eyes">
          <Eyes mood={mood} look={eyeLook} />
        </g>
        <ellipse cx="34" cy="70" rx="6" ry="3.4" fill="#fb923c" opacity=".75" />
        <ellipse cx="94" cy="70" rx="6" ry="3.4" fill="#fb923c" opacity=".75" />
        <Mouth mood={mood} />
      </g>
      {front && <g data-part="front">{front}</g>}
    </svg>
  );
}
