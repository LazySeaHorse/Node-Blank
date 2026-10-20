import { Mascot } from '@landing/components/Mascot';
import { APP_URL } from '@landing/components/Nav';
import { Link, toolsUrl } from '@landing/router';
import { Footer } from '@landing/sections/Cta';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Sparkles, Wrench } from 'lucide-react';
import { useEffect } from 'react';
import { getAllTools } from './registry';
import type { ToolDefinition } from './types';

export function ToolLayout({ tool }: { tool: ToolDefinition }) {
  const allTools = getAllTools();
  const otherTools = allTools.filter((t) => t.slug !== tool.slug);

  useEffect(() => {
    document.title = `${tool.name} — Node-Blank STEM Tools`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', tool.description);
    }
  }, [tool.name, tool.description]);

  return (
    <div className="min-h-screen bg-canvas text-fg antialiased selection:bg-accent/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2" ariaLabel="Node-Blank Home">
              <Mascot className="size-7 transition-transform duration-300 group-hover:-rotate-6" />
              <span className="font-display text-[15px] font-medium tracking-tight text-fg">Node-Blank</span>
            </Link>

            <span className="text-muted/60 select-none">/</span>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted truncate">
              <Link href="/" className="hover:text-fg transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3 text-muted/60" />
              <Link href="/tools" className="hover:text-fg transition-colors">
                Tools
              </Link>
              <ChevronRight className="size-3 text-muted/60" />
              <span className="font-medium text-fg truncate">{tool.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tools"
              className="inline-flex rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg transition hover:bg-surface-2 cursor-pointer"
            >
              All Tools
            </Link>
            <a
              href={APP_URL}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-accent-fg transition hover:brightness-110 motion-safe:active:scale-[0.98] cursor-pointer"
            >
              <span>Launch Canvas</span>
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-6">
          <Link
            href="/tools"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-accent"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to All Interactive Tools
          </Link>
        </div>

        <header className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-0.5 font-mono text-xs font-medium text-accent mb-3">
            <Wrench className="size-3.5" />
            {tool.category}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-fg">{tool.name}</h1>
          <p className="mt-3 text-base text-muted max-w-[700px] leading-relaxed">{tool.subtitle}</p>
        </header>

        {/* Interactive Tool Component */}
        <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-sm mb-12">
          {tool.component}
        </section>

        {/* Description & Usage Guide */}
        <div className="mb-12 rounded-xl border border-line bg-surface-2/60 p-6">
          <h3 className="font-display text-base font-semibold text-fg mb-2">About this tool</h3>
          <p className="text-sm text-muted leading-relaxed">{tool.description}</p>
          {tool.formulaNote && (
            <div className="mt-4 pt-3 border-t border-line text-xs font-mono text-fg">{tool.formulaNote}</div>
          )}
        </div>

        {/* Canvas CTA */}
        <div className="mb-16 rounded-2xl border border-line bg-gradient-to-r from-surface to-surface-2 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-tip/10 px-3 py-0.5 text-xs font-medium text-tip mb-2">
              <Sparkles className="size-3.5" />
              Need an open canvas for math?
            </div>
            <h4 className="font-display text-xl font-bold text-fg">
              Work on problems without limits in Node-Blank
            </h4>
            <p className="text-sm text-muted mt-1">
              Combine math, graphs, video, code, and PDFs in a single tab. Free &amp; local-first.
            </p>
          </div>
          <a
            href={APP_URL}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition hover:brightness-110 cursor-pointer shrink-0"
          >
            Launch Canvas
            <ArrowRight className="size-4" />
          </a>
        </div>

        {/* Other Tools */}
        {otherTools.length > 0 && (
          <section className="border-t border-line pt-10">
            <h3 className="font-display text-xl font-bold text-fg mb-4">Other STEM Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherTools.map((t) => (
                <Link
                  key={t.slug}
                  href={toolsUrl(t.slug)}
                  className="rounded-xl border border-line bg-surface p-5 transition hover:border-accent/60 block group"
                >
                  <div className="text-xs font-mono text-muted mb-1">{t.category}</div>
                  <h4 className="font-display font-semibold text-fg group-hover:text-accent transition-colors">
                    {t.name}
                  </h4>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{t.subtitle}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
