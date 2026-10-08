import { Reveal } from '@landing/components/Reveal';
import {
  Check,
  CloudOff,
  Download,
  FolderOpen,
  HardDrive,
  LayoutGrid,
  Moon,
  RotateCcw,
  ScanSearch,
  Smartphone,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const FEATURES = [
  {
    icon: CloudOff,
    title: 'No accounts, no cloud',
    text: 'There is nothing to sign into and nothing to sync. Your canvases live in the browser that made them.',
  },
  {
    icon: HardDrive,
    title: 'Autosaved to IndexedDB',
    text: 'Dexie writes as you go. Close the tab mid-thought, come back, it is where you left it.',
  },
  {
    icon: RotateCcw,
    title: 'Undo for everything',
    text: 'Zustand + zundo snapshots the canvas — including what an agent did. Organising is one undo step too.',
  },
  {
    icon: Download,
    title: 'Export as JSON',
    text: 'Selected nodes, one canvas, or the lot. Import validates with Zod before it touches your data.',
  },
  {
    icon: ScanSearch,
    title: 'Search dims and flies',
    text: 'Ctrl+F greys out everything that does not match and moves the viewport to the things that do.',
  },
  {
    icon: LayoutGrid,
    title: 'Organise',
    text: 'Groups nearby nodes and spaces them evenly, in a single reversible step.',
  },
  {
    icon: Moon,
    title: 'Dark mode + offline PWA',
    text: 'A flat dark theme with no shadows, and an installable app that works on a plane.',
  },
  {
    icon: Smartphone,
    title: 'Mobile is a viewer',
    text: 'Pan, zoom and switch canvases on a phone. Editing stays desktop-only, on purpose.',
  },
];

const CANVASES = [
  { name: 'untitled-1', when: '2 minutes ago', active: true, nodes: 9 },
  { name: 'thesis-derivations', when: 'yesterday', active: false, nodes: 34 },
  { name: 'pset-04', when: '3 days ago', active: false, nodes: 18 },
  { name: 'lecture-12', when: 'last week', active: false, nodes: 51 },
  { name: 'scratch', when: 'last month', active: false, nodes: 6 },
];

const SAVE_FORMAT = [
  { t: 'interface', n: 'CanvasMeta', b: '{ id: string; name: string; updatedAt: number }' },
  { t: 'interface', n: 'CanvasGroup', b: '{ id: string; nodeIds: string[] }' },
  {
    t: 'interface',
    n: 'CanvasContent',
    b: '{ nodes: AppNode[]; viewport: Viewport; groups?: CanvasGroup[] }',
  },
];

export function LocalFirst() {
  return (
    <section id="local" className="relative border-t border-line bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,3.9vw,3.1rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-fg">
                Nothing leaves
                <br />
                <span className="text-muted">the browser.</span>
              </h2>
              <p className="mt-4 max-w-[42ch] text-[15.5px] leading-[1.62] text-muted">
                It started as a way to jot down maths and markdown side by side without a heavy app or a
                tablet. It stayed that way: a scratchpad that is yours, on your disk, in a format you can
                carry out as JSON.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <ul className="mt-9 flex flex-col">
                {FEATURES.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="group flex gap-3.5 border-b border-line py-3.5 first:border-t first:border-line"
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border border-line bg-surface text-muted transition-all duration-200 group-hover:border-accent/35 group-hover:bg-accent/[0.07] group-hover:text-accent">
                      <Icon className="size-4" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[15.5px] font-bold tracking-[-0.01em] text-fg">
                        {title}
                      </span>
                      <span className="mt-0.5 block text-[13.5px] leading-[1.55] text-muted">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              {/* canvas manager */}
              <Reveal delay={0.06}>
                <div className="panel overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
                    <FolderOpen className="size-4 text-muted" strokeWidth={1.9} />
                    <span className="font-display text-[13px] font-bold tracking-tight text-fg">
                      Canvases
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[10.5px] text-muted transition-colors hover:border-accent/40 hover:text-accent">
                      + new
                    </span>
                  </div>
                  <ul>
                    {CANVASES.map((c) => (
                      <li
                        key={c.name}
                        className={cn(
                          'group relative flex cursor-pointer items-center gap-3 border-b border-line/70 px-3.5 py-2.5 transition-colors last:border-b-0',
                          c.active ? 'bg-accent/[0.055]' : 'hover:bg-surface-2/70',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-1/2 left-0 h-0 w-[3px] -translate-y-1/2 rounded-r-full bg-accent transition-all duration-300',
                            c.active ? 'h-7' : 'group-hover:h-4',
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'block truncate font-mono text-[12.5px]',
                              c.active ? 'font-medium text-fg' : 'text-fg/85',
                            )}
                          >
                            {c.name}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-muted">
                            {c.nodes} nodes · {c.when}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {(['rename', 'duplicate', 'export'] as const).map((a) => (
                            <span
                              key={a}
                              className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9.5px] text-muted"
                            >
                              {a}
                            </span>
                          ))}
                        </span>
                        {c.active && (
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            <Check className="size-2.5" strokeWidth={3.4} /> open
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 border-t border-line bg-surface-2/50 px-3.5 py-2">
                    <Upload className="size-3 text-muted" />
                    <span className="font-mono text-[10.5px] text-muted">
                      import · export nodes / canvas / everything
                    </span>
                  </div>
                </div>
              </Reveal>

              {/* the real save format */}
              <Reveal delay={0.12}>
                <div className="mt-5 overflow-hidden rounded-xl border border-line bg-[#0f172a]">
                  <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2">
                    <span className="size-1.5 rounded-full bg-accent" />
                    <span className="font-mono text-[10.5px] tracking-[0.14em] text-[#94a3b8] uppercase">
                      src/model/types.ts
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-[#475569]">
                      the whole save format
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-3.5 py-3.5 font-mono text-[11.5px] leading-[1.85]">
                    {SAVE_FORMAT.map((l) => (
                      <div key={l.n}>
                        <span className="text-accent">{l.t}</span>{' '}
                        <span className="text-[#fdba74]">{l.n}</span>{' '}
                        <span className="text-[#e2e8f0]">{l.b}</span>
                      </div>
                    ))}
                  </pre>
                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <p className="mt-4 pl-1 text-[13px] leading-[1.55] text-muted">
                  Nodes are React Flow nodes; the viewport is saved with them, so a canvas reopens exactly
                  where you were looking. Groups are recomputed from positions rather than stored as boxes —
                  which is why Organise and the AI overview agree on what is near what.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
