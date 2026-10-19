import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Mascot } from '@/ui/Mascot';
import { type MascotMood, mascotAspect, mascotViewBox } from '@/ui/mascot/moods';

export type OctoScene = 'canvas' | 'ai' | 'delete' | 'export' | 'error';

const SIZES = {
  tall: { height: 150, octoY: 118, octo: 92 },
  compact: { height: 110, octoY: 88, octo: 68 },
};

/** Scenes are drawn in a 560 x 150 frame, the octopus's feet landing at (280, 118). */
const FRAME_WIDTH = 560;
const FRAME_FEET_Y = 118;

const ACCENT = 'var(--accent)';
const LINE = 'var(--border)';

function Card({
  x,
  y,
  w = 92,
  h = 44,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  children?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="7" fill="var(--surface)" stroke={LINE} strokeWidth="1.5" />
      {children}
    </g>
  );
}

const Lines = ({ y = 14 }: { y?: number }) => (
  <g stroke={LINE} strokeWidth="3" strokeLinecap="round">
    <path d={`M12 ${y} h46`} />
    <path d={`M12 ${y + 11} h66`} />
  </g>
);

function SceneArt({ scene }: { scene: OctoScene }) {
  const wire = { stroke: LINE, strokeWidth: 2, fill: 'none' } as const;
  switch (scene) {
    case 'ai':
      return (
        <g>
          <path d="M142 56 C 190 56, 190 96, 238 96" {...wire} />
          <path d="M418 56 C 370 56, 370 96, 322 96" {...wire} />
          <Card x={50} y={34}>
            <Lines />
          </Card>
          <Card x={418} y={34}>
            <Lines />
            <circle cx="78" cy="12" r="4" fill={ACCENT} />
          </Card>
          <path d="M468 12 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill={ACCENT} />
        </g>
      );
    case 'delete':
      return (
        <g>
          <Card x={60} y={40}>
            <Lines />
          </Card>
          <g opacity=".75">
            <Card x={408} y={30}>
              <Lines />
            </Card>
            <path
              d="M408 30 l92 44 M500 30 l-92 44"
              stroke={ACCENT}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
          <path d="M142 62 C 200 62, 220 96, 250 96" {...wire} strokeDasharray="4 5" />
        </g>
      );
    case 'export':
      return (
        <g>
          <Card x={56} y={44}>
            <Lines />
          </Card>
          <Card x={150} y={22}>
            <Lines />
          </Card>
          <g transform="translate(414 30)">
            <path
              d="M0 0 h50 l22 22 v52 h-72z"
              fill="var(--surface)"
              stroke={LINE}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M50 0 v22 h22" fill="none" stroke={LINE} strokeWidth="1.5" />
            <path
              d="M36 62 v-24 m-9 15 l9 10 9 -10"
              stroke={ACCENT}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </g>
      );
    case 'error':
      return (
        <g>
          <Card x={60} y={36}>
            <Lines />
          </Card>
          <Card x={408} y={44}>
            <Lines />
          </Card>
          <path
            d="M152 58 C 200 58, 200 90, 236 90 M324 90 C 360 90, 360 66, 408 66"
            {...wire}
            strokeDasharray="3 6"
          />
          <g stroke={ACCENT} strokeWidth="3.5" strokeLinecap="round">
            <path d="M262 32 l16 16 M278 32 l-16 16" transform="translate(40 -12)" />
          </g>
        </g>
      );
    default:
      return (
        <g>
          <path d="M142 62 C 190 62, 190 40, 238 40" {...wire} />
          <path d="M418 92 C 370 92, 370 56, 322 56" {...wire} />
          <Card x={50} y={42}>
            <Lines />
          </Card>
          <Card x={418} y={70}>
            <Lines />
            <circle cx="78" cy="12" r="4" fill={ACCENT} />
          </Card>
          <Card x={226} y={8} w={72} h={34}>
            <Lines y={10} />
          </Card>
        </g>
      );
  }
}

interface OctoHeroProps {
  mood: MascotMood;
  /** The drawn canvas pieces behind the octopus, picked for what the popup is about. */
  scene: OctoScene;
  /** A short mono label in the corner. */
  tag?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/**
 * The top of a popup: a drawn dotted canvas with a few node cards, and the octopus dropping onto it,
 * squashing on landing. Put it first inside a dialog, above a `PopupBody`.
 */
export function OctoHero({ mood, scene, tag, size = 'tall', className }: OctoHeroProps) {
  const { height, octoY, octo } = SIZES[size];
  const width = octo * mascotAspect(mood);
  const [vx, vy, vw, vh] = mascotViewBox(mood).split(' ').map(Number);
  // Feet sit at y 117 of the base frame; place the box so they land on the hero's baseline.
  const top = octoY - ((117 - vy) / vh) * octo;
  const center = ((64 - vx) / vw) * width;

  return (
    <div
      data-slot="octo-hero"
      data-scene={scene}
      aria-hidden="true"
      className={cn('relative shrink-0 overflow-hidden bg-surface-2', className)}
      style={{ height }}
    >
      {/* At popup widths the frame draws at 1:1 and is cropped at the sides, so the middle always shows. */}
      <svg
        data-slot="octo-hero-scene"
        role="presentation"
        viewBox={`0 ${FRAME_FEET_Y - octoY} ${FRAME_WIDTH} ${height}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <pattern id={`octo-dots-${scene}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={LINE} />
          </pattern>
        </defs>
        <rect x="0" y="-100" width={FRAME_WIDTH} height="400" fill={`url(#octo-dots-${scene})`} />
        <SceneArt scene={scene} />
      </svg>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-[62%] to-surface" />

      <span
        className="octo-hero-shadow -ml-[19px] -mt-[4px] absolute h-[8px] w-[38px] rounded-full bg-black/20 blur-[2px]"
        style={{ left: '50%', top: octoY }}
      />
      <div
        data-slot="octo-hero-octo"
        className="absolute"
        style={{ left: '50%', marginLeft: `${-center}px`, top, width, height: octo }}
      >
        <div
          className="octo-hero-fall h-full w-full"
          style={{ transformOrigin: `${(center / width) * 100}% ${((117 - vy) / vh) * 100}%` }}
        >
          <Mascot mood={mood} animated className="h-full w-full" />
        </div>
      </div>

      {tag && (
        <span className="absolute top-3 left-3.5 rounded-full border border-border bg-surface px-2 py-[3px] font-mono text-2xs text-fg uppercase tracking-[0.06em]">
          {tag}
        </span>
      )}
    </div>
  );
}

/** The text and fields under an `OctoHero`. */
export function PopupBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="popup-body"
      className={cn('relative flex flex-col gap-2 px-[22px] pb-5', className)}
      {...props}
    />
  );
}

/** The buttons at the end of a popup: secondary first, the main action last. */
export function PopupActions({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="popup-actions"
      className={cn('mt-3 flex flex-wrap justify-end gap-2', className)}
      {...props}
    />
  );
}
