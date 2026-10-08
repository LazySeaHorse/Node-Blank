import { AsciiField } from '@landing/components/AsciiField';
import { GithubIcon } from '@landing/components/GithubIcon';
import { Mascot } from '@landing/components/Mascot';
import { APP_URL, REPO_URL } from '@landing/components/Nav';
import { Reveal } from '@landing/components/Reveal';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

/* ── The pitch in one line ── */

export function Story() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-surface py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-9 px-4 sm:px-6 lg:grid-cols-12 lg:items-end lg:gap-12">
        <Reveal className="lg:col-span-8">
          <p className="font-display text-[clamp(1.4rem,2.9vw,2.15rem)] leading-[1.16] font-semibold tracking-[-0.025em] text-fg text-balance">
            Notebooks give you pages. Whiteboards give you shapes.{' '}
            <span className="text-tip">Node-Blank gives you space.</span>
          </p>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-4">
          <dl className="flex flex-col gap-3 border-l-2 border-line pl-5">
            {[
              ['Fast', 'It opens in a tab. There is nothing to install.'],
              ['Private', 'Your work stays on your device.'],
              ['Free', 'It is open source. No account needed.'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">{k}</dt>
                <dd className="mt-0.5 text-[14px] leading-[1.45] font-medium text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Final call to action ── */

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line bg-canvas pt-20 pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]">
        <AsciiField intensity={0.3} radius={235} cellW={11} cellH={18} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-canvas/40 to-canvas" />
      </div>

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h2 className="font-display text-[clamp(2.4rem,6.4vw,4.6rem)] leading-[0.92] font-extrabold tracking-[-0.04em] text-fg">
              Open a blank
              <br />
              canvas.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[16px] leading-[1.6] text-muted">
              Nothing to install. Nothing to sign up for. Double-click anywhere and start.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 pb-8">
              <a
                href={APP_URL}
                className="group inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-[15px] font-semibold text-accent-fg transition-[filter] hover:brightness-110"
              >
                Launch Node-Blank
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-3 text-[15px] font-semibold text-fg transition-colors hover:bg-surface-2"
              >
                <GithubIcon className="size-4 text-muted transition-colors group-hover:text-fg" />
                Star the repo
                <ArrowUpRight className="size-3.5 text-muted" />
              </a>
            </div>
          </Reveal>

          <div className="relative hidden justify-end lg:col-span-5 lg:flex">
            <Mascot className="w-[280px] translate-y-[6%]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */

const FOOT_LINKS = [
  { label: 'Open the canvas', href: APP_URL },
  { label: 'GitHub', href: REPO_URL },
  { label: 'Releases', href: `${REPO_URL}/releases` },
  { label: 'AI bridge', href: `${REPO_URL}/blob/main/bridge/README.md` },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-6 sm:px-6">
        <a href="#top" className="group inline-flex items-center gap-2.5">
          <Mascot className="size-8 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-display text-[15px] font-extrabold tracking-tight text-fg">Node-Blank</span>
        </a>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FOOT_LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="text-[13.5px] text-muted transition-colors hover:text-accent"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
