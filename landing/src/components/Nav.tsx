import { GithubIcon } from '@landing/components/GithubIcon';
import { Mascot } from '@landing/components/Mascot';
import { motion, useScroll, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export const APP_URL = '/app/';
export const REPO_URL = 'https://github.com/LazySeaHorse/Node-Blank';

const LINKS = [
  { href: '#nodes', label: 'Nodes' },
  { href: '#controls', label: 'Controls' },
  { href: '#ai', label: 'AI' },
  { href: '#local', label: 'Your data' },
];

export function Nav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent"
      />
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          solid ? 'border-b border-line bg-canvas/85 backdrop-blur-md' : 'border-b border-transparent',
        )}
      >
        <nav className="mx-auto flex h-14 max-w-[1240px] items-center gap-3 px-4 sm:px-6">
          <a href="#top" className="group flex items-center gap-2.5" aria-label="Node-Blank home">
            <Mascot className="size-8 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
            <span className="font-display text-[15px] font-extrabold tracking-tight text-fg">Node-Blank</span>
          </a>

          <div className="ml-auto hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted transition-colors hover:text-fg"
              >
                <span className="relative z-10">{l.label}</span>
                <span className="absolute inset-x-2.5 bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-200 group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Source on GitHub"
              className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <GithubIcon className="size-[17px]" />
            </a>
            <a
              href={APP_URL}
              className="rounded-lg bg-accent px-3.5 py-1.5 text-[13px] font-semibold text-accent-fg transition-[filter] hover:brightness-110"
            >
              Open the canvas
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}
