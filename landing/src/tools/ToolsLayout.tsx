import { GithubIcon } from '@landing/components/GithubIcon';
import { Mascot } from '@landing/components/Mascot';
import { APP_URL, REPO_URL } from '@landing/components/Nav';
import {
  ArrowLeft,
  ArrowUpRight,
  Calculator,
  Grid3X3,
  LayoutGrid,
  Moon,
  SplitSquareVertical,
  Sun,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

export interface ToolsLayoutProps {
  title: string;
  description: string;
  badge?: string;
  activeTool?: 'matrix-rref' | 'split-pdf' | 'math-evaluator' | 'index';
  navigate: (to: string) => void;
  children: ReactNode;
}

export function ToolsLayout({
  title,
  description,
  badge,
  activeTool = 'index',
  navigate,
  children,
}: ToolsLayoutProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const navItems = [
    { id: 'index', label: 'All Tools', path: '/tools', icon: LayoutGrid },
    { id: 'matrix-rref', label: 'Matrix RREF', path: '/tools/matrix-rref', icon: Grid3X3 },
    {
      id: 'split-pdf',
      label: 'Split PDF Helper',
      path: '/tools/split-pdf-scratchpad',
      icon: SplitSquareVertical,
    },
    { id: 'math-evaluator', label: 'Math REPL', path: '/tools/math-evaluator', icon: Calculator },
  ] as const;

  return (
    <div className="min-h-screen bg-canvas text-fg selection:bg-accent/20 flex flex-col antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group flex items-center gap-2.5 text-left cursor-pointer transition-transform"
              title="Return to Node-Blank Home"
            >
              <Mascot className="size-8 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="font-display text-[15px] font-semibold tracking-tight text-fg leading-none">
                  Node-Blank
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted mt-0.5">
                  Interactive STEM Tools
                </span>
              </div>
            </button>

            {/* Breadcrumb nav on larger screens */}
            <nav className="hidden md:flex items-center gap-1 border-l border-line pl-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTool === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-surface-2 text-fg font-semibold shadow-xs'
                        : 'text-muted hover:text-fg hover:bg-surface-2/60'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="grid size-8 place-items-center rounded-lg border border-line bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-fg cursor-pointer"
            >
              {isDark ? <Sun className="size-4 text-tip" /> : <Moon className="size-4" />}
            </button>

            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Repository"
              className="hidden sm:grid size-8 place-items-center rounded-lg border border-line bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <GithubIcon className="size-4" />
            </a>

            <a
              href={APP_URL}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs sm:text-sm font-medium text-accent-fg transition-[filter,transform] hover:brightness-110 active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <span>Launch Canvas</span>
              <ArrowUpRight className="size-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Mobile secondary tool selector */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto border-t border-line/60 px-4 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  isActive ? 'bg-surface-2 text-fg font-semibold' : 'text-muted hover:text-fg'
                }`}
              >
                <Icon className="size-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Tool Header Banner */}
        {activeTool !== 'index' && (
          <div className="border-b border-line bg-surface/50 py-6 sm:py-8">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => navigate('/tools')}
                      className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="size-3" />
                      <span>Back to Tools</span>
                    </button>
                    {badge && (
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-mono font-medium text-accent border border-accent/20">
                        {badge}
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-fg">
                    {title}
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-muted max-w-2xl">{description}</p>
                </div>

                <div className="hidden lg:flex items-center gap-3">
                  <div className="rounded-xl border border-line bg-surface p-3 text-right">
                    <div className="text-[11px] font-mono text-muted uppercase">Execution</div>
                    <div className="text-xs font-semibold text-fg">100% Client-Side</div>
                  </div>
                  <div className="rounded-xl border border-line bg-surface p-3 text-right">
                    <div className="text-[11px] font-mono text-muted uppercase">Precision</div>
                    <div className="text-xs font-semibold text-fg">Exact BigInt Fractions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface mt-16">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3">
            <Mascot className="size-7" />
            <div>
              <span className="font-display text-sm font-semibold text-fg">Node-Blank</span>
              <p className="text-xs text-muted">
                Free, private, local-first infinite canvas for STEM problem solving.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-muted">
            <button
              type="button"
              onClick={() => navigate('/tools')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              Tools Index
            </button>
            <button
              type="button"
              onClick={() => navigate('/tools/matrix-rref')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              Matrix RREF
            </button>
            <button
              type="button"
              onClick={() => navigate('/tools/split-pdf-scratchpad')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              Split-Screen PDF
            </button>
            <button
              type="button"
              onClick={() => navigate('/tools/math-evaluator')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              Math REPL
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              Node-Blank Home
            </button>
            <a href={APP_URL} className="font-medium text-accent hover:underline cursor-pointer">
              Launch Desktop Canvas →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
