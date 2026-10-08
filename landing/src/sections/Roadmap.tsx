import { Reveal } from '@landing/components/Reveal';
import { Check, Circle, GitBranch } from 'lucide-react';

const SHIPPED = [
  'Nine node types',
  'Multiple canvases',
  'Math+ with shared variables',
  'Undo and redo',
  'Search that flies to matches',
  'Import and export as JSON',
  'Dark mode',
  'Works offline',
  'Node groups and Organise',
  'Resizable nodes',
  'Mobile viewer',
  'AI control for coding agents',
  'AI activity feed',
];

const NEXT = [
  'Themes',
  'PDF node',
  'Link nodes together',
  'Share by QR code',
  'Encrypted saves',
  'Your own cloud saves',
  'Draw on the canvas',
  'Export to PDF',
];

export function Roadmap() {
  return (
    <section className="relative border-t border-line bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Reveal>
              <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1] font-extrabold tracking-[-0.03em] text-fg">
                What works today.
                <br />
                <span className="text-muted">What comes next.</span>
              </h2>
              <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.6] text-muted">
                We build in the open. Here is what you can use today, and what we plan to build.
              </p>
              <a
                href="https://github.com/LazySeaHorse/Node-Blank#roadmap"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 font-mono text-[12px] text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
              >
                <GitBranch className="size-3.5" />
                See the full roadmap
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.06}>
              <p className="mb-3 flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">
                <Check className="size-3.5 text-tip" strokeWidth={3} /> Done
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
                <Circle className="size-3.5 text-accent" /> Next
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
