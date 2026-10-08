import { Reveal } from '@landing/components/Reveal';
import { Check, Circle, GitBranch } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

const ROW_A = [
  'React 19',
  'TypeScript',
  'Vite',
  'Tailwind CSS 4',
  'React Flow',
  'Zustand',
  'zundo',
  'Dexie',
  'Zod',
  'MathLive',
  'KaTeX',
  'Cortex Compute Engine',
];
const ROW_B = [
  'react-markdown',
  'Mafs',
  'react-spreadsheet',
  'CodeMirror 6',
  'Radix UI',
  'lucide',
  'sonner',
  'Vitest',
  'Playwright',
  'Biome',
  'MCP over HTTP',
  'WebMCP',
  'Go bridge',
];

const LIGHT = [
  { token: 'canvas', hex: '#f8fafc' },
  { token: 'surface', hex: '#ffffff' },
  { token: 'surface-2', hex: '#f1f5f9' },
  { token: 'border', hex: '#e2e8f0' },
  { token: 'fg', hex: '#0f172a' },
  { token: 'muted', hex: '#64748b' },
  { token: 'accent', hex: '#3b82f6' },
  { token: 'danger', hex: '#ef4444' },
];
const DARK = [
  { token: 'canvas', hex: '#0a0a0a' },
  { token: 'surface', hex: '#171717' },
  { token: 'surface-2', hex: '#212121' },
  { token: 'border', hex: '#2e2e2e' },
  { token: 'fg', hex: '#e5e5e5' },
  { token: 'muted', hex: '#a3a3a3' },
  { token: 'accent', hex: '#f97316' },
  { token: 'danger', hex: '#f87171' },
];

const SHIPPED = [
  'Rewrite on React + React Flow',
  'Migrate to TypeScript',
  'Migrate to Tailwind',
  'Spreadsheet node',
  'Code node',
  'Table node',
  'Image node',
  'Video node',
  'Multiple canvases',
  'Global search',
  'Import / export nodes, canvases, everything',
  'Dark mode',
  'Make it a PWA',
  'Add / remove nodes from the toolbar',
  'AI control',
];

const NEXT = [
  'Migrate to Preact',
  'Smoother navigation using D3',
  'Fix touchpad navigation',
  'Themes!',
  'PDF node',
  'Link 2+ nodes',
  'Node groups',
  'Import / export via QR',
  'Encrypted saves',
  'Bring-your-own Firebase cloud saves',
  'Drawings on canvas',
  'Export PDF',
];

function Marquee({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="group relative flex overflow-hidden py-2">
      <div
        className="marquee-track flex shrink-0 items-center"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {doubled.map((_, hi) => (
          <div key={hi} className="flex shrink-0 items-center gap-3 pr-3">
            {items.map((s) => (
              <span
                key={`${hi}-${s}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-[12px] whitespace-nowrap text-muted transition-colors duration-200 hover:border-accent/45 hover:text-fg"
              >
                <span className="size-1 rounded-full bg-accent/55" />
                {s}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-canvas to-transparent" />
    </div>
  );
}

function Swatches({ label, tokens, dark }: { label: string; tokens: typeof LIGHT; dark?: boolean }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">{label}</span>
        <span className="font-mono text-[10.5px] text-accent">
          {hover ? tokens.find((t) => t.token === hover)?.hex : '—'}
        </span>
      </div>
      <div className="flex gap-1.5">
        {tokens.map((t) => (
          <button
            key={t.token}
            type="button"
            onMouseEnter={() => setHover(t.token)}
            onMouseLeave={() => setHover((h) => (h === t.token ? null : h))}
            onFocus={() => setHover(t.token)}
            onBlur={() => setHover(null)}
            aria-label={`${label} ${t.token} ${t.hex}`}
            className={cn(
              'h-11 flex-1 rounded-md border transition-all duration-200 hover:-translate-y-1',
              dark ? 'border-white/10' : 'border-line',
              hover === t.token && 'ring-2 ring-accent/45 ring-offset-2 ring-offset-canvas',
            )}
            style={{ background: t.hex }}
          />
        ))}
      </div>
    </div>
  );
}

export function Stack() {
  return (
    <section className="relative border-t border-line bg-canvas py-16 sm:py-20">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-[clamp(1.6rem,2.7vw,2.2rem)] leading-tight font-extrabold tracking-[-0.025em] text-fg">
                Boring dependencies, chosen on purpose.
              </h2>
            </div>
            <p className="max-w-[36ch] text-[13.5px] leading-[1.55] text-muted">
              Everything below is a well-trodden library. The interesting part is what they are asked to do
              together on one canvas.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="mt-9 flex flex-col gap-1">
        <Marquee items={ROW_A} />
        <Marquee items={ROW_B} reverse />
      </div>

      <div className="mx-auto mt-14 max-w-[1240px] px-4 sm:px-6">
        <Reveal delay={0.06}>
          <div className="grid grid-cols-1 gap-8 rounded-xl border border-line bg-surface p-6 sm:p-8 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-[17px] font-bold tracking-tight text-fg">
                Two themes, one set of tokens
              </h3>
              <p className="mt-1.5 mb-5 max-w-[46ch] text-[13.5px] leading-[1.55] text-muted">
                Components only ever read semantic variables — never a raw hex. Dark mode drops the blue tint
                from the greys, kills every shadow, and hands the accent to orange.
              </p>
              <Swatches label=":root — light" tokens={LIGHT} />
            </div>
            <div className="rounded-lg bg-[#0a0a0a] p-5">
              <Swatches label=".dark" tokens={DARK} dark />
              <p className="mt-5 font-mono text-[10.5px] leading-[1.7] text-[#525252]">
                <span className="text-[#a3a3a3]">html.dark *</span> {'{ box-shadow: none !important }'}
                <br />
                <span className="text-[#525252]">{'/* flat, including toasts and editors */'}</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Roadmap() {
  return (
    <section className="relative border-t border-line bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Reveal>
              <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1] font-extrabold tracking-[-0.03em] text-fg">
                A public list,
                <br />
                <span className="text-muted">mostly crossed off.</span>
              </h2>
              <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.6] text-muted">
                The roadmap lives in the README and is written in the order things were thought of. Most of it
                already shipped; the rest is honest about what is still open.
              </p>
              <a
                href="https://github.com/LazySeaHorse/Node-Blank#roadmap"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 font-mono text-[12px] text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
              >
                <GitBranch className="size-3.5" />
                README#roadmap
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.06}>
              <p className="mb-3 flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">
                <Check className="size-3.5 text-tip" strokeWidth={3} /> shipped · {SHIPPED.length}
              </p>
              <ul className="flex flex-col gap-[3px]">
                {SHIPPED.map((s) => (
                  <li
                    key={s}
                    className="group flex items-start gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] leading-[1.4] text-muted transition-colors hover:bg-canvas hover:text-fg"
                  >
                    <Check
                      className="mt-[3px] size-3 shrink-0 text-tip/70 transition-colors group-hover:text-tip"
                      strokeWidth={3}
                    />
                    <span className="line-through decoration-line decoration-1 group-hover:decoration-transparent">
                      {s}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.12}>
              <p className="mb-3 flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">
                <Circle className="size-3.5 text-accent" /> next · {NEXT.length}
              </p>
              <ul className="flex flex-col gap-[3px]">
                {NEXT.map((s) => (
                  <li
                    key={s}
                    className="group flex items-start gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] leading-[1.4] text-fg transition-colors hover:bg-accent/[0.06]"
                  >
                    <Circle
                      className="mt-[3px] size-3 shrink-0 text-line transition-colors group-hover:text-accent"
                      strokeWidth={2.4}
                    />
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
