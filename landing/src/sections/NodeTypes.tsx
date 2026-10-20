import { ALL_KINDS, KIND_META, type Kind } from '@landing/components/mock/Chrome';
import {
  CodeNode,
  GraphNode,
  ImageNode,
  MathNode,
  MathPlusNode,
  PdfNode,
  SectionNode,
  SheetNode,
  Sup,
  TableNode,
  TextNode,
  V,
  VideoNode,
  WebNode,
} from '@landing/components/mock/nodes';
import { Reveal } from '@landing/components/Reveal';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

const BLURB: Record<Kind, string> = {
  text: 'Write in Markdown. Add LaTeX math anywhere in the text.',
  math: 'Type LaTeX and see typeset math. Press Shift+Enter for a new line.',
  mathPlus: 'Write a := 2 and every Math+ node can use it. Change it once, and all results update.',
  graph: 'Plot many functions of x on one graph. Add a line to add a curve.',
  table: 'A grid where each cell holds math. Integrals, sums and limits look right.',
  sheet: 'A spreadsheet with formulas and cell references.',
  code: 'Run JavaScript on the canvas. It runs in a sandbox, so it cannot reach the page or the network.',
  image: 'Drop in a picture. It moves and zooms with the rest of your canvas.',
  video: 'Embed a video. It keeps playing while you work around it.',
  web: 'Browse live websites and docs right beside your notes on the canvas.',
  pdf: 'Link a local PDF and pin pages into view. Extract text directly for AI workflows.',
  section: 'Wrap nodes into a titled, coloured section with Ctrl+G. Moving the section moves what is inside.',
};

function NodeStage({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'text':
      return <TextNode />;
    case 'math':
      return <MathNode />;
    case 'mathPlus':
      return <MathPlusNode />;
    case 'graph':
      return <GraphNode />;
    case 'table':
      return <TableNode />;
    case 'sheet':
      return <SheetNode />;
    case 'code':
      return <CodeNode />;
    case 'image':
      return <ImageNode />;
    case 'video':
      return <VideoNode />;
    case 'web':
      return <WebNode />;
    case 'pdf':
      return <PdfNode />;
    case 'section':
      return (
        <SectionNode title="Derivations" color="yellow" className="h-[280px] w-[320px]">
          <div className="flex flex-col gap-2.5 p-1">
            <div className="rounded-md border border-border bg-surface p-2.5 shadow-xs">
              <div className="tex text-[15px] text-fg">
                <V>e</V>
                <Sup>
                  <V>i</V>π
                </Sup>{' '}
                + 1 = 0
              </div>
            </div>
            <p className="text-xs text-muted">
              Press <kbd className="kbd text-[10px]">Ctrl</kbd>+<kbd className="kbd text-[10px]">G</kbd> to
              wrap selected nodes in a section.
            </p>
          </div>
        </SectionNode>
      );
  }
}

export function NodeTypes() {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('li')?.getBoundingClientRect().width ?? 400;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * (card + 20), behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section id="nodes" className="relative border-t border-line bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-[clamp(2rem,3.9vw,3.1rem)] leading-[0.98] font-medium tracking-[-0.03em] text-fg">
                Eleven kinds of node.
                <br />
                <span className="text-muted">Plus sections to organize them.</span>
              </h2>
              <p className="mt-4 max-w-[60ch] text-[15.5px] leading-[1.6] text-muted">
                Text, Math, Math+, Graph, Table, Sheet, Script, Image, Video, Web, PDF, and Sections. Pick a
                tool. Double-click the canvas. Your node appears.
              </p>
            </div>
            <div className="flex gap-2">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  aria-label={dir === -1 ? 'Previous nodes' : 'Next nodes'}
                  disabled={dir === -1 ? edge.start : edge.end}
                  onClick={() => page(dir)}
                  className="grid size-10 cursor-pointer place-items-center rounded-xl border border-line bg-surface text-fg transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
                >
                  {dir === -1 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-10">
          <ul
            ref={track}
            onScroll={measure}
            className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
          >
            {ALL_KINDS.map((kind) => {
              const meta = KIND_META[kind];
              return (
                <li
                  key={kind}
                  className="w-[min(88vw,25rem)] shrink-0 snap-start scroll-ml-4 overflow-hidden rounded-xl border border-line bg-surface sm:scroll-ml-6"
                >
                  <div
                    aria-hidden
                    className={cn(
                      'canvas-grid pointer-events-none grid h-[22rem] place-items-center overflow-hidden border-b border-line bg-canvas select-none',
                    )}
                  >
                    <NodeStage kind={kind} />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent">
                        <meta.icon className="size-4" strokeWidth={1.9} />
                      </span>
                      <h3 className="font-display text-[17px] font-medium tracking-[-0.01em] text-fg">
                        {meta.label}
                      </h3>
                    </div>
                    <p className="mt-3 text-[14px] leading-[1.55] text-muted">{BLURB[kind]}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
