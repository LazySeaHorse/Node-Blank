import { AsciiField } from '@landing/components/AsciiField';
import { GithubIcon } from '@landing/components/GithubIcon';
import { Mascot } from '@landing/components/Mascot';
import { AppMock } from '@landing/components/mock/AppMock';
import {
  CodeNode,
  GraphNode,
  MathNode,
  MathPlusNode,
  TableNode,
  TextNode,
} from '@landing/components/mock/nodes';
import { APP_URL, REPO_URL } from '@landing/components/Nav';
import { ArrowRight, ArrowUpRight, Database, MousePointerClick, WifiOff } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const FACTS = [
  { icon: Database, text: 'Saves as you work' },
  { icon: WifiOff, text: 'Works offline' },
  { icon: MousePointerClick, text: 'Built for mouse and keyboard' },
];

const HERO_NODES = [
  { x: 28, y: 96, node: <MathNode selected /> },
  { x: 28, y: 184, node: <GraphNode /> },
  { x: 408, y: 92, node: <TextNode /> },
  { x: 424, y: 366, node: <MathPlusNode /> },
  { x: 700, y: 92, node: <CodeNode /> },
  { x: 690, y: 290, node: <TableNode /> },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const artY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);
  const asciiOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.22]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 34]);

  return (
    <section ref={ref} id="top" className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 lg:pb-24">
      {/* ambient field */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div style={{ opacity: asciiOpacity }} className="absolute inset-0">
          <AsciiField intensity={0.36} radius={215} />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(248,250,252,0) 55%, rgba(248,250,252,0.92) 92%, #f8fafc 100%)',
          }}
        />
      </div>

      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
        {/* copy */}
        <motion.div style={{ y: copyY }} className="lg:col-span-5">
          <h1 className="font-display text-[clamp(2.5rem,5.6vw,4.35rem)] leading-[0.94] font-extrabold tracking-[-0.035em] text-fg text-balance">
            An{' '}
            <span className="relative inline-block">
              <span className="relative z-10">infinite</span>
              <span className="absolute inset-x-[-0.06em] bottom-[0.1em] z-0 h-[0.18em] -rotate-[0.5deg] rounded-[2px] bg-tip/30" />
              <span className="absolute inset-x-[-0.06em] bottom-[0.1em] z-0 h-[3px] -rotate-[0.5deg] rounded-[2px] bg-tip" />
            </span>{' '}
            canvas that stays out of your way.
          </h1>

          <p className="mt-5 max-w-[44ch] text-[16.5px] leading-[1.62] text-muted">
            Write math. Plot graphs. Run code. Drop in images and video. Put it all on one canvas, exactly
            where you want it. Your work saves in your browser. There is no account and no cloud.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={APP_URL}
              className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-accent-fg transition-[filter] hover:brightness-110"
            >
              Open Node-Blank
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-[14.5px] font-semibold text-fg transition-colors hover:bg-surface-2"
            >
              <GithubIcon className="size-4 text-muted transition-colors group-hover:text-fg" />
              View the source
              <ArrowUpRight className="size-3.5 text-muted" />
            </a>
          </div>

          <ul className="mt-8 flex flex-col gap-2 border-t border-line pt-5">
            {FACTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-[13px] text-muted">
                <Icon className="size-[15px] shrink-0 text-accent" strokeWidth={2} />
                {text}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* the app */}
        <motion.div style={{ y: artY }} className="relative lg:col-span-7">
          <div className="relative">
            <AppMock nodes={HERO_NODES} />
            <Mascot track={false} className="absolute -bottom-9 -left-5 z-20 size-20 sm:-left-8 sm:size-24" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
