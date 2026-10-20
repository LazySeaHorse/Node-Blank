import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  ChartSpline,
  Check,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Play,
  Plus,
  RotateCw,
  Rows3,
  Sheet,
  Sigma,
  SquarePlay,
  SquareTerminal,
  Table,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/cn';

/* ────────────────────────────────────────────────────────────────
   Math bits. The app typesets LaTeX through KaTeX / MathLive;
   these draw the same shapes with markup so the mocks stay real.
   ──────────────────────────────────────────────────────────────── */

export const V = ({ children }: { children: React.ReactNode }) => <i className="tex-var">{children}</i>;

export const Frac = ({ up, down }: { up: React.ReactNode; down: React.ReactNode }) => (
  <span className="tex-frac">
    <span>{up}</span>
    <span>{down}</span>
  </span>
);

export const Sqrt = ({ children, width = 12 }: { children: React.ReactNode; width?: number }) => (
  <span className="tex-sqrt">
    <svg viewBox="0 0 12 24" width={width} preserveAspectRatio="none" aria-hidden>
      <path
        d="M0.8 13.5 L3.4 13.5 L6 22.6 L10.6 1.6 L12 1.6"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
    <span>{children}</span>
  </span>
);

export const BigOp = ({
  symbol,
  under,
  over,
}: {
  symbol: React.ReactNode;
  under?: React.ReactNode;
  over?: React.ReactNode;
}) => (
  <span className="tex-op">
    {over ? <small>{over}</small> : <small>&nbsp;</small>}
    <b>{symbol}</b>
    {under ? <small>{under}</small> : <small>&nbsp;</small>}
  </span>
);

export const Sup = ({ children }: { children: React.ReactNode }) => (
  <sup className="text-[0.62em] leading-none">{children}</sup>
);

/* ────────────────────────────────────────────────────────────────
   Node shell — Dossier tab + fused tile design (matching NodeShell):
   surface card or tinted tone, concave fillets, tab icon and title,
   and clean states.
   ──────────────────────────────────────────────────────────────── */

export type SectionColor = 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'gray';

export const swatch = (color: SectionColor) => `var(--section-${color})`;

export type NodeChromeProps = {
  title?: string;
  icon?: LucideIcon;
  selected?: boolean;
  touched?: boolean;
  tint?: SectionColor;
  live?: boolean;
  toolbar?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  tileClassName?: string;
  children: React.ReactNode;
};

export function NodeCard({
  title,
  icon: Icon,
  selected,
  touched,
  tint,
  live,
  toolbar,
  actions,
  className,
  tileClassName,
  children,
}: NodeChromeProps) {
  const tone = tint ? `color-mix(in srgb, ${swatch(tint)} 35%, var(--surface))` : 'var(--surface)';

  return (
    <div
      className={cn(
        'node node-card flex flex-col',
        selected && 'selected',
        touched && 'ai-touched',
        className,
      )}
      data-live={live || undefined}
      style={{ '--tone-base': tone } as React.CSSProperties}
    >
      <div className="flex shrink-0 items-end" style={{ height: '28px' }}>
        <div className="node-tab">
          {Icon && <Icon className="size-3.5 shrink-0 opacity-70" />}
          {title && <span className="truncate">{title}</span>}
          {live && <span className="shrink-0 text-2xs font-normal opacity-80">· Live</span>}
        </div>
        {actions && (
          <div className="node-actions ml-auto flex items-center gap-1 self-center pr-1">{actions}</div>
        )}
      </div>
      <div className={cn('node-tile flex min-h-0 flex-1 flex-col', tileClassName)}>
        {toolbar && (
          <header className="flex h-9 shrink-0 items-center gap-1 border-b border-border/60 px-2 text-xs">
            {toolbar}
          </header>
        )}
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

function Stepper({ label }: { label: string }) {
  return (
    <div className="flex items-center overflow-hidden rounded border border-border bg-surface text-xs font-medium text-muted">
      <span className="px-1.5 py-0.5">−</span>
      <span className="px-1">{label}</span>
      <span className="px-1.5 py-0.5">+</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   1. Text — Markdown + LaTeX
   ──────────────────────────────────────────────────────────────── */

export function TextNode({
  title = 'Text',
  tint,
  selected,
  touched,
  className,
}: {
  title?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={Type}
      tint={tint}
      selected={selected}
      touched={touched}
      className={cn('w-[268px]', className)}
    >
      <div className="p-4 text-[14px] leading-[1.6] text-fg">
        <p className="mb-2 text-[17px] leading-tight font-medium">Where the series converges</p>
        <p className="text-fg/85">
          Assume the terms stay bounded, then split the tail and compare against the geometric case before
          touching the remainder.
        </p>
        <p className="tex mt-2.5 text-[15px]">
          <V>e</V>
          <Sup>
            <V>ix</V>
          </Sup>{' '}
          = cos <V>x</V> + <V>i</V> sin <V>x</V>
        </p>
        <p className="mt-2 text-muted">Which is the same statement, just wearing a different hat.</p>
      </div>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   2. Math — LaTeX, typeset
   ──────────────────────────────────────────────────────────────── */

export function MathNode({
  title = 'Math',
  tint,
  selected,
  touched,
  className,
}: {
  title?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={Sigma}
      tint={tint}
      selected={selected}
      touched={touched}
      className={cn('w-[292px]', className)}
    >
      <div className="tex flex items-center px-4 py-3 text-[19px] text-fg">
        <V>x</V> ={' '}
        <Frac
          up={
            <>
              −<V>b</V> ±{' '}
              <Sqrt width={13}>
                <V>b</V>
                <Sup>2</Sup> − 4<V>ac</V>
              </Sqrt>
            </>
          }
          down={
            <>
              2<V>a</V>
            </>
          }
        />
      </div>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   3. Math+ — evaluates; `a := 2` variables shared top to bottom
   ──────────────────────────────────────────────────────────────── */

const MATH_PLUS_INPUT: { id: string; node: React.ReactNode }[] = [
  {
    id: 'a',
    node: (
      <>
        <V>a</V> := 2
      </>
    ),
  },
  {
    id: 'b',
    node: (
      <>
        <V>b</V> := 3
      </>
    ),
  },
  {
    id: 'sum',
    node: (
      <>
        <V>a</V>
        <Sup>2</Sup> + <V>b</V>
        <Sup>2</Sup>
      </>
    ),
  },
  {
    id: 'root',
    node: (
      <Sqrt width={11}>
        <V>a</V>
        <Sup>2</Sup> + <V>b</V>
        <Sup>2</Sup>
      </Sqrt>
    ),
  },
];
const MATH_PLUS_RESULTS: { value: string; approx?: string; assigned?: boolean }[] = [
  { value: '2', assigned: true },
  { value: '3', assigned: true },
  { value: '13' },
  { value: '√13', approx: '3.6056' },
];

export function MathPlusNode({
  title = 'Math+',
  tint,
  selected,
  touched,
  className,
}: {
  title?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={Calculator}
      tint={tint}
      selected={selected}
      touched={touched}
      className={cn('w-[262px]', className)}
    >
      <div className="tex flex flex-col gap-0.5 px-3 py-2 text-[17px] text-fg">
        {MATH_PLUS_INPUT.map((line) => (
          <div key={line.id}>{line.node}</div>
        ))}
      </div>
      <ol className="border-t border-border bg-surface-2/50 px-3 py-2 text-sm">
        {MATH_PLUS_RESULTS.map((r) => (
          <li key={r.value} className="flex min-h-7 items-center gap-2">
            <span className="text-muted">=</span>
            <span className="tex">{r.value}</span>
            {r.approx && <span className="text-xs text-muted">≈ {r.approx}</span>}
            {r.assigned && <Check className="size-3.5 text-green-600" aria-label="Defined" />}
          </li>
        ))}
      </ol>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   4. Graph — plot several functions of x (Mafs-shaped)
   ──────────────────────────────────────────────────────────────── */

type Fn = { expr: React.ReactNode; f: (x: number) => number; color: string };

const FUNCS: Fn[] = [
  {
    expr: (
      <>
        sin(<V>x</V>)
      </>
    ),
    f: (x) => Math.sin(x),
    color: 'var(--accent)',
  },
  {
    expr: (
      <>
        <Frac
          up={
            <>
              <V>x</V>
              <Sup>2</Sup>
            </>
          }
          down="4"
        />{' '}
        − 2
      </>
    ),
    f: (x) => (x * x) / 4 - 2,
    color: '#f97316',
  },
  {
    expr: (
      <>
        1.6 cos(2<V>x</V>)
      </>
    ),
    f: (x) => 1.6 * Math.cos(2 * x),
    color: '#8b5cf6',
  },
];

const W = 344;
const H = 196;
const X_MIN = -6.4;
const X_MAX = 6.4;
const Y_MIN = -3.4;
const Y_MAX = 3.4;

const px = (x: number) => ((x - X_MIN) / (X_MAX - X_MIN)) * W;
const py = (y: number) => H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * H;

function pathFor(f: (x: number) => number) {
  let d = '';
  let pen = false;
  for (let i = 0; i <= 240; i++) {
    const x = X_MIN + ((X_MAX - X_MIN) * i) / 240;
    const y = f(x);
    // Lift the pen outside the viewport so clipped curves never chord across the plot.
    if (y < Y_MIN - 0.4 || y > Y_MAX + 0.4) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${px(x).toFixed(1)} ${py(y).toFixed(1)} `;
    pen = true;
  }
  return d.trim();
}

export function GraphNode({
  title = 'Graph',
  tint,
  selected,
  touched,
  className,
}: {
  title?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={ChartSpline}
      tint={tint}
      selected={selected}
      touched={touched}
      className={cn('w-[344px]', className)}
      actions={<Plus className="m-1 size-3.5 text-muted hover:text-fg" />}
    >
      <ul className="divide-y divide-border border-b border-border">
        {FUNCS.map((fn, i) => (
          <li key={i} className="flex items-center gap-2 px-3 py-1">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: fn.color }} />
            <span className="text-xs text-muted">y =</span>
            <span className="tex flex min-h-7 items-center text-[15px]">{fn.expr}</span>
          </li>
        ))}
      </ul>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label="Plot of three functions of x"
      >
        {Array.from({ length: 13 }, (_, i) => i - 6).map((x) => (
          <line
            key={`gx${x}`}
            x1={px(x)}
            y1={0}
            x2={px(x)}
            y2={H}
            stroke="var(--border)"
            strokeWidth={x === 0 ? 0 : 1}
          />
        ))}
        {Array.from({ length: 7 }, (_, i) => i - 3).map((y) => (
          <line
            key={`gy${y}`}
            x1={0}
            y1={py(y)}
            x2={W}
            y2={py(y)}
            stroke="var(--border)"
            strokeWidth={y === 0 ? 0 : 1}
          />
        ))}
        <line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke="var(--muted)" strokeWidth={1.2} />
        <line x1={px(0)} y1={0} x2={px(0)} y2={H} stroke="var(--muted)" strokeWidth={1.2} />
        {FUNCS.map((fn, i) => (
          <path
            key={i}
            d={pathFor(fn.f)}
            fill="none"
            stroke={fn.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {[-6, -4, -2, 2, 4, 6].map((x) => (
          <text key={x} x={px(x)} y={py(0) + 11} textAnchor="middle" fontSize="8.5" fill="var(--muted)">
            {x}
          </text>
        ))}
      </svg>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   5. Table — math cells
   ──────────────────────────────────────────────────────────────── */

const Sub = ({ children }: { children: React.ReactNode }) => (
  <sub className="text-[0.58em] leading-none">{children}</sub>
);

export function TableNode({
  title = 'Table',
  tint,
  selected,
  touched,
  className,
}: {
  title?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  className?: string;
} = {}) {
  const cell = 'tex min-h-8 min-w-20 border border-border px-1.5 py-1 text-[15px]';
  return (
    <NodeCard
      title={title}
      icon={Table}
      tint={tint}
      selected={selected}
      touched={touched}
      className={cn('w-[290px]', className)}
      actions={
        <>
          <Stepper label="Row" />
          <Stepper label="Col" />
        </>
      }
    >
      <table className="m-3 border-collapse">
        <tbody>
          <tr>
            <td className={cell}>
              <BigOp symbol="∫" under="0" over="1" />
              <V>x</V>
              <Sup>2</Sup> d<V>x</V>
            </td>
            <td className={cell}>
              <Frac up="1" down="3" />
            </td>
          </tr>
          <tr>
            <td className={cell}>
              <BigOp
                symbol="∑"
                under={
                  <>
                    <V>k</V>=1
                  </>
                }
                over={<V>n</V>}
              />
              <V>k</V>
            </td>
            <td className={cell}>
              <Frac
                up={
                  <>
                    <V>n</V>(<V>n</V>+1)
                  </>
                }
                down="2"
              />
            </td>
          </tr>
          <tr>
            <td className={cell}>
              lim<Sub>x→0</Sub>{' '}
              <Frac
                up={
                  <>
                    sin <V>x</V>
                  </>
                }
                down={<V>x</V>}
              />
            </td>
            <td className={cell}>1</td>
          </tr>
        </tbody>
      </table>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   6. Sheet — spreadsheet with formulas (react-spreadsheet-shaped)
   ──────────────────────────────────────────────────────────────── */

const SHEET_COLS = ['A', 'B', 'C'];
const SHEET: (string | number)[][] = [
  ['n', 'x', 'x²'],
  [1, 2, 4],
  [2, 3, 9],
  [3, 5, 25],
  ['Σ', '10', '38'],
];

export function SheetNode({
  title = 'Sheet',
  tint,
  selected,
  touched,
  className,
}: {
  title?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={Sheet}
      tint={tint}
      selected={selected}
      touched={touched}
      className={cn('w-[300px]', className)}
      actions={
        <>
          <Stepper label="Row" />
          <Stepper label="Col" />
        </>
      }
    >
      <div className="m-2 overflow-hidden text-[12px]">
        <div className="flex">
          <span className="w-8 shrink-0 border border-border bg-surface-2" />
          {SHEET_COLS.map((c) => (
            <span
              key={c}
              className="-ml-px flex-1 border border-border bg-surface-2 py-1 text-center text-muted"
            >
              {c}
            </span>
          ))}
        </div>
        {SHEET.map((row, ri) => (
          <div key={ri} className="-mt-px flex">
            <span className="flex w-8 shrink-0 items-center justify-center border border-border bg-surface-2 py-1 text-muted">
              {ri + 1}
            </span>
            {row.map((cell, ci) => (
              <span
                key={ci}
                className={cn(
                  '-ml-px flex-1 border border-border px-1.5 py-1',
                  ri === 3 &&
                    ci === 2 &&
                    'relative bg-accent/12 outline outline-2 -outline-offset-1 outline-accent',
                )}
              >
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   7. Script — sandboxed JavaScript (CodeMirror, GitHub light theme)
   ──────────────────────────────────────────────────────────────── */

const k = 'text-[#cf222e]';
const n = 'text-[#0550ae]';
const CODE: { id: string; node: React.ReactNode }[] = [
  { id: '1', node: <span className="text-[#6e7781]">{'// sandboxed — no DOM, no network'}</span> },
  {
    id: '2',
    node: (
      <>
        <span className={k}>const</span> xs = [<span className={n}>1</span>, <span className={n}>2</span>,{' '}
        <span className={n}>3</span>, <span className={n}>4</span>, <span className={n}>5</span>];
      </>
    ),
  },
  {
    id: '3',
    node: (
      <>
        <span className={k}>const</span> sum = xs.<span className="text-[#8250df]">reduce</span>((a, b){' '}
        <span className={k}>=&gt;</span> a + b, <span className={n}>0</span>);
      </>
    ),
  },
  { id: '4', node: <span className="text-[#6e7781]">{'// → { mean: 3, sum: 15 }'}</span> },
  {
    id: '5',
    node: (
      <>
        <span className={k}>return</span> {'{'} mean: sum / xs.length, sum {'};'}
      </>
    ),
  },
];

export function CodeNode({
  title = 'Script',
  tint,
  selected,
  touched,
  className,
}: {
  title?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={SquareTerminal}
      tint={tint}
      selected={selected}
      touched={touched}
      className={cn('w-[316px]', className)}
      actions={
        <>
          <span className="inline-flex h-6 items-center rounded-lg px-2 text-xs font-medium text-muted">
            Clear
          </span>
          <span className="inline-flex h-6 items-center gap-1.5 rounded-lg bg-accent px-2 text-xs font-medium text-accent-fg">
            <Play className="size-3" /> Run
          </span>
        </>
      }
    >
      <div className="flex bg-surface font-mono text-[12px] leading-[1.6]">
        <div className="border-r border-border px-2 py-2 text-right text-muted tabular-nums">
          {CODE.map((line, i) => (
            <div key={line.id}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 overflow-hidden px-3 py-2 text-fg">
          {CODE.map((line) => (
            <div key={line.id}>{line.node}</div>
          ))}
        </pre>
      </div>
      <div className="border-t border-border bg-surface-2 font-mono text-xs">
        <pre className="border-b border-border px-3 py-1 text-accent">{'{ mean: 3, sum: 15 }'}</pre>
      </div>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   8. Image
   ──────────────────────────────────────────────────────────────── */

export function ImageNode({
  title = 'Image',
  tint,
  selected,
  touched,
  className,
}: {
  title?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={ImageIcon}
      tint={tint}
      selected={selected}
      touched={touched}
      className={cn('w-[240px]', className)}
    >
      <svg
        viewBox="0 0 220 140"
        className="block w-full"
        role="img"
        aria-label="A diagram dropped onto the canvas"
      >
        <rect width="220" height="140" fill="#f8fafc" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={i * 22} y1={0} x2={i * 22} y2={140} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 22} x2={220} y2={i * 22} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        <circle cx="86" cy="72" r="38" fill="none" stroke="#3b82f6" strokeWidth="2.4" />
        <line x1="86" y1="72" x2="113" y2="50" stroke="#f97316" strokeWidth="2.4" />
        <path d="M112 72 A26 26 0 0 0 105 55" fill="none" stroke="#3b82f6" strokeWidth="1.8" />
        <circle cx="86" cy="72" r="2.6" fill="#0f172a" />
        <text x="120" y="46" fontSize="12" fill="#0f172a" fontFamily="Georgia, serif" fontStyle="italic">
          r
        </text>
        <text x="104" y="68" fontSize="11" fill="#3b82f6" fontFamily="Georgia, serif" fontStyle="italic">
          θ
        </text>
        <rect x="140" y="92" width="66" height="34" rx="4" fill="#ffffff" stroke="#e2e8f0" />
        <text x="148" y="107" fontSize="9.5" fill="#64748b" fontFamily="JetBrains Mono, monospace">
          fig-04.png
        </text>
        <text x="148" y="119" fontSize="9.5" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">
          220 × 140
        </text>
      </svg>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   9. Video
   ──────────────────────────────────────────────────────────────── */

export function VideoNode({
  title = 'Video',
  tint,
  selected,
  touched,
  live,
  className,
}: {
  title?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  live?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={SquarePlay}
      tint={tint}
      selected={selected}
      touched={touched}
      live={live}
      className={cn('w-[262px]', className)}
    >
      <div className="relative aspect-video overflow-hidden bg-[#0f172a]">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(120% 90% at 20% 10%, #1e3a8a 0%, transparent 60%), radial-gradient(90% 80% at 85% 85%, #7c2d12 0%, transparent 55%)',
          }}
        />
        <svg viewBox="0 0 240 135" className="absolute inset-0 h-full w-full">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={0} y1={i * 17} x2={240} y2={i * 17} stroke="#ffffff" strokeOpacity="0.06" />
          ))}
          <path
            d="M0 100 C 40 96, 60 40, 100 44 S 170 96, 240 30"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid size-10 place-items-center rounded-full bg-white/95 text-[#0f172a]">
            <Play className="size-4 translate-x-[1px] fill-current" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-1.5">
          <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
            <span className="block h-full w-1/3 rounded-full bg-white" />
          </span>
          <span className="font-mono text-[9px] text-white/80 tabular-nums">00:47 / 06:12</span>
        </div>
      </div>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   10. Web — browser node with address bar and live page
   ──────────────────────────────────────────────────────────────── */

export function WebNode({
  title = 'Canvas API - MDN',
  url = 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API',
  tint,
  selected,
  touched,
  live = true,
  className,
}: {
  title?: string;
  url?: string;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  live?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={Globe}
      tint={tint}
      selected={selected}
      touched={touched}
      live={live}
      className={cn('w-[340px]', className)}
      toolbar={
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <button
            type="button"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted opacity-60"
            aria-label="Back"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <button
            type="button"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted opacity-40"
            aria-label="Forward"
          >
            <ArrowRight className="size-3.5" />
          </button>
          <button
            type="button"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted hover:text-fg"
            aria-label="Reload"
          >
            <RotateCw className="size-3" />
          </button>
          <div className="relative flex min-w-0 flex-1 items-center rounded-md border border-border/80 bg-surface px-2 py-0.5 text-xs text-muted shadow-2xs">
            <Globe className="mr-1.5 size-3 shrink-0 text-muted" />
            <span className="truncate font-mono text-[11px] text-fg/90">{url}</span>
          </div>
          <button
            type="button"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted hover:text-fg"
            aria-label="Open in new tab"
          >
            <ExternalLink className="size-3" />
          </button>
        </div>
      }
    >
      <div className="flex flex-col bg-surface text-xs">
        <div className="border-b border-border/60 bg-[#f8fafc] px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
              Web API
            </span>
            <span className="text-[11px] text-muted">HTML &amp; Canvas</span>
          </div>
          <h4 className="mt-1 text-sm font-semibold tracking-tight text-fg">CanvasRenderingContext2D</h4>
        </div>
        <div className="space-y-2.5 p-3.5 leading-relaxed text-fg/90">
          <p className="text-[12px] text-muted">
            Provides the 2D rendering context for the drawing surface of a &lt;canvas&gt; element, used for
            drawing shapes, text, and images.
          </p>
          <div className="rounded-lg border border-border/70 bg-surface-2/60 p-2.5 font-mono text-[11px] leading-tight text-fg">
            <div>
              <span className="text-purple-600">const</span> ctx = canvas.
              <span className="text-blue-600">getContext</span>(<span className="text-emerald-600">'2d'</span>
              {');'}
            </div>
            <div className="mt-1 text-muted">{'// Render graphic directly on canvas'}</div>
            <div>
              ctx.<span className="text-blue-600">fillStyle</span> ={' '}
              <span className="text-emerald-600">'#0b7f51'</span>
              {';'}
            </div>
            <div>
              ctx.<span className="text-blue-600">fillRect</span>(<span className="text-amber-600">10</span>,{' '}
              <span className="text-amber-600">10</span>, <span className="text-amber-600">150</span>,{' '}
              <span className="text-amber-600">80</span>
              {');'}
            </div>
          </div>
        </div>
      </div>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   11. PDF — document viewer with pinned pages filmstrip
   ──────────────────────────────────────────────────────────────── */

export function PdfNode({
  title = 'quantum-mechanics-notes.pdf',
  pageCount = 18,
  tint,
  selected,
  touched,
  className,
}: {
  title?: string;
  pageCount?: number;
  tint?: SectionColor;
  selected?: boolean;
  touched?: boolean;
  className?: string;
} = {}) {
  return (
    <NodeCard
      title={title}
      icon={FileText}
      tint={tint}
      selected={selected}
      touched={touched}
      className={cn('w-[340px]', className)}
      actions={<Rows3 className="m-1 size-3.5 text-muted" aria-label="Rows view" />}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-surface-2/40 px-3 py-1.5 text-xs text-muted">
        <span className="font-medium text-fg/80">
          3 pages pinned <span className="font-normal text-muted">· {pageCount} pages</span>
        </span>
        <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent">
          PDF.js
        </span>
      </div>
      <div className="flex gap-2.5 overflow-hidden bg-surface-2/30 p-3">
        {/* Page 1 */}
        <div className="relative flex h-36 w-24 shrink-0 flex-col rounded border border-border/80 bg-surface p-2 shadow-2xs select-none">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-fg/20" />
          <div className="mt-1.5 space-y-1">
            <div className="h-1 w-full rounded-full bg-muted/20" />
            <div className="h-1 w-4/5 rounded-full bg-muted/20" />
            <div className="h-1 w-full rounded-full bg-muted/20" />
            <div className="h-1 w-3/4 rounded-full bg-muted/20" />
          </div>
          <div className="my-auto rounded bg-surface-2/80 p-1">
            <div className="mx-auto h-6 w-12 rounded border border-dashed border-accent/40 bg-accent/5" />
          </div>
          <div className="mt-auto flex items-center justify-between text-[9px] text-muted">
            <span className="font-mono">p. 1</span>
            <span className="size-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Page 4 */}
        <div className="relative flex h-36 w-24 shrink-0 flex-col rounded border border-border/80 bg-surface p-2 shadow-2xs select-none">
          <div className="space-y-1">
            <div className="h-1 w-full rounded-full bg-muted/20" />
            <div className="h-1 w-5/6 rounded-full bg-muted/20" />
          </div>
          <div className="my-auto py-1 text-center font-serif text-[10px] italic text-fg">iℏ ∂ψ/∂t = Ĥψ</div>
          <div className="space-y-1">
            <div className="h-1 w-full rounded-full bg-muted/20" />
            <div className="h-1 w-3/4 rounded-full bg-muted/20" />
            <div className="h-1 w-4/5 rounded-full bg-muted/20" />
          </div>
          <div className="mt-auto flex items-center justify-between text-[9px] text-muted">
            <span className="font-mono">p. 4</span>
            <span className="size-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Page 7 */}
        <div className="relative flex h-36 w-24 shrink-0 flex-col rounded border border-border/80 bg-surface p-2 shadow-2xs select-none">
          <div className="space-y-1">
            <div className="h-1 w-full rounded-full bg-muted/20" />
            <div className="h-1 w-2/3 rounded-full bg-muted/20" />
          </div>
          <div className="my-auto flex flex-col items-center justify-center py-0.5">
            <svg viewBox="0 0 40 24" className="h-6 w-10 text-accent">
              <path d="M 2 20 Q 20 2 38 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
            </svg>
            <span className="mt-0.5 text-[8px] text-muted">Fig 2.1</span>
          </div>
          <div className="mt-auto flex items-center justify-between text-[9px] text-muted">
            <span className="font-mono">p. 7</span>
            <span className="size-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </NodeCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   12. Section — pastel background tone with dashed outline
   ──────────────────────────────────────────────────────────────── */

export function SectionNode({
  title = 'Section',
  color = 'yellow',
  selected,
  className,
  children,
}: {
  title?: string;
  color?: SectionColor;
  selected?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn('node flex flex-col', selected && 'selected', className)}
      style={
        {
          '--tone-base': `color-mix(in srgb, ${swatch(color)} 18%, transparent)`,
        } as React.CSSProperties
      }
    >
      <div className="flex shrink-0 items-end" style={{ height: '28px' }}>
        <div className="node-tab section-handle">
          <span className="truncate font-medium">{title}</span>
        </div>
      </div>
      <div className="node-tile node-section min-h-0 flex-1 p-3">{children}</div>
    </div>
  );
}
