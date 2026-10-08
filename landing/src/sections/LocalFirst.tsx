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
  { icon: CloudOff, title: 'No account, no cloud', text: 'Nothing to sign in to. Nothing to sync.' },
  {
    icon: HardDrive,
    title: 'Saves as you work',
    text: 'Close the tab at any time. Your canvas is there when you return.',
  },
  {
    icon: RotateCcw,
    title: 'Undo everything',
    text: 'Undo works on every change, including changes an agent makes.',
  },
  {
    icon: Download,
    title: 'Export any time',
    text: 'Export selected nodes, one canvas, or all canvases as JSON.',
  },
  {
    icon: ScanSearch,
    title: 'Fast search',
    text: 'Press Ctrl+F. Other nodes fade and the view moves to the match.',
  },
  {
    icon: LayoutGrid,
    title: 'Organise',
    text: 'Group nearby nodes and space them evenly in one step.',
  },
  {
    icon: Moon,
    title: 'Dark mode and offline',
    text: 'Install it as an app. It works without internet.',
  },
  {
    icon: Smartphone,
    title: 'Mobile viewer',
    text: 'View and pan on your phone. Edit on your desktop.',
  },
];

const CANVASES = [
  { name: 'untitled-1', when: '2 minutes ago', active: true, nodes: 9 },
  { name: 'thesis-derivations', when: 'yesterday', active: false, nodes: 34 },
  { name: 'pset-04', when: '3 days ago', active: false, nodes: 18 },
  { name: 'lecture-12', when: 'last week', active: false, nodes: 51 },
  { name: 'scratch', when: 'last month', active: false, nodes: 6 },
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
                Your canvases stay on your device. No server ever sees them.
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
                          {(['rename', 'export', 'delete'] as const).map((a) => (
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
                    <span className="font-mono text-[10.5px] text-muted">Import and export</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
