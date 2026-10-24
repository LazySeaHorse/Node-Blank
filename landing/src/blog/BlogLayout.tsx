import { Mascot } from '@landing/components/Mascot';
import { APP_URL } from '@landing/components/Nav';
import { blogUrl, Link } from '@landing/router';
import { Footer } from '@landing/sections/Cta';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Clock,
  Globe2,
  ListCollapse,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRelatedPosts } from './registry';
import type { BlogPost } from './types';

interface BlogLayoutProps {
  post: BlogPost;
}

export function BlogLayout({ post }: BlogLayoutProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const related = getRelatedPosts(post.slug, 3);

  // Set document title and meta description
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${post.title} — Unlined`;

    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDesc = metaDescription?.getAttribute('content') || '';
    if (metaDescription) {
      metaDescription.setAttribute('content', post.description);
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription && originalDesc) {
        metaDescription.setAttribute('content', originalDesc);
      }
    };
  }, [post.title, post.description]);

  // Track scroll progress and active TOC header
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      if (total > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }

      if (post.tableOfContents?.length) {
        const headings = post.tableOfContents
          .map((item) => document.getElementById(item.id))
          .filter((el): el is HTMLElement => Boolean(el));

        for (let i = headings.length - 1; i >= 0; i--) {
          const h = headings[i];
          const rect = h.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveSection(post.tableOfContents[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [post.tableOfContents]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setMobileTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-fg antialiased selection:bg-accent/20">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-accent transition-[width] duration-75"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="group flex items-center gap-2 shrink-0" ariaLabel="Unlined Home">
              <Mascot className="size-7 transition-transform duration-300 group-hover:-rotate-6" />
              <span className="font-display text-[15px] font-medium tracking-tight text-fg hidden sm:inline">
                Unlined
              </span>
            </Link>

            <span className="text-muted/60 select-none hidden sm:inline">/</span>

            {/* Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-muted min-w-0 truncate"
            >
              <Link href="/" className="hover:text-fg transition-colors shrink-0">
                Home
              </Link>
              <ChevronRight className="size-3 text-muted/60 shrink-0" />
              <Link href="/blog" className="hover:text-fg transition-colors shrink-0">
                Blog
              </Link>
              <ChevronRight className="size-3 text-muted/60 shrink-0" />
              <span className="truncate text-fg font-medium">{post.title}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-fg cursor-pointer"
              title="Share article link"
            >
              <Share2 className="size-3.5" />
              <span className="hidden md:inline">{copiedLink ? 'Copied Link!' : 'Share'}</span>
            </button>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg transition hover:bg-surface-2 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">All Articles</span>
            </Link>

            <a
              href={APP_URL}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-accent-fg transition hover:brightness-110 motion-safe:active:scale-[0.98] cursor-pointer"
            >
              <span>Launch App</span>
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-accent"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Blog &amp; Guides
          </Link>
        </div>

        {/* Article Header & Metadata */}
        <header className="mb-10 max-w-[900px]">
          <div className="flex flex-wrap items-center gap-2.5 text-xs mb-4">
            <span className="inline-flex items-center rounded-md border border-line bg-surface-2 px-2.5 py-0.5 font-mono font-medium text-fg">
              {post.category}
            </span>
            {post.geoRegion && (
              <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-muted">
                <Globe2 className="size-3 text-accent" />
                {post.geoRegion}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-muted">
              <Clock className="size-3 text-muted" />
              {post.readTime}
            </span>
            <span className="text-muted/60">•</span>
            <span className="inline-flex items-center gap-1 text-muted">
              <Calendar className="size-3 text-muted" />
              {post.publishedAt}
            </span>
          </div>

          <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-tight text-fg leading-[1.12] text-balance">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="mt-4 text-[clamp(1.05rem,1.8vw,1.25rem)] leading-relaxed text-muted text-balance font-sans">
              {post.subtitle}
            </p>
          )}

          {post.author && (
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
              <div className="grid size-9 place-items-center rounded-full bg-surface-2 border border-line font-medium text-xs text-fg">
                {post.author.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <div className="text-sm font-medium text-fg">{post.author.name}</div>
                {post.author.role && <div className="text-xs text-muted">{post.author.role}</div>}
              </div>
            </div>
          )}
        </header>

        {/* Mobile Table of Contents Accordion */}
        {post.tableOfContents && post.tableOfContents.length > 0 && (
          <div className="mb-8 rounded-xl border border-line bg-surface lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="flex w-full items-center justify-between p-4 text-left font-medium text-sm text-fg"
            >
              <span className="flex items-center gap-2">
                <ListCollapse className="size-4 text-accent" />
                Table of Contents
              </span>
              <span className="text-xs text-muted">{mobileTocOpen ? 'Hide' : 'Show'}</span>
            </button>
            {mobileTocOpen && (
              <nav className="border-t border-line p-4 space-y-2">
                {post.tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={`block w-full text-left text-xs transition-colors py-1 ${
                      item.level === 3 ? 'pl-4' : ''
                    } ${activeSection === item.id ? 'font-medium text-accent' : 'text-muted hover:text-fg'}`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Grid: Main Content + Sticky Sidebar */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Article Typography Container */}
          <main className="lg:col-span-8 min-w-0">
            <div className="prose-container max-w-none text-fg text-[16px] leading-[1.75] font-sans">
              {post.content}
            </div>

            {/* In-article Sticky/Embedded Call to Action Banner */}
            <div className="my-12 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-surface-2 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-[500px]">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-tip/10 px-3 py-0.5 text-xs font-medium text-tip">
                    <Sparkles className="size-3.5" />
                    Free &amp; Open Source Canvas
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-fg">
                    Doing STEM problem sets?
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Open Unlined in a browser tab. Keep textbook PDFs, LaTeX equations, live graphs, and code
                    together without flipping pages.
                  </p>
                </div>
                <a
                  href={APP_URL}
                  className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition hover:brightness-110 motion-safe:active:scale-[0.98] shrink-0 cursor-pointer shadow-sm"
                >
                  Open Unlined
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Keywords / Tags */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="border-t border-line pt-6">
                <div className="text-xs font-mono text-muted uppercase tracking-wider mb-2.5">
                  Related Topics &amp; Keywords
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {post.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-md border border-line bg-surface-2 px-2.5 py-1 text-xs text-muted"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sticky Sidebar (Desktop) */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-20 space-y-8">
              {/* Table of Contents */}
              {post.tableOfContents && post.tableOfContents.length > 0 && (
                <div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
                  <div className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-muted mb-3">
                    <ListCollapse className="size-3.5 text-accent" />
                    On this page
                  </div>
                  <nav className="space-y-1.5">
                    {post.tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => scrollToHeading(item.id)}
                        className={`block w-full text-left text-[13px] leading-snug transition-colors py-1 cursor-pointer ${
                          item.level === 3 ? 'pl-3' : ''
                        } ${
                          activeSection === item.id ? 'font-medium text-accent' : 'text-muted hover:text-fg'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Quick Canvas Launch Card */}
              <div className="rounded-xl border border-line bg-surface-2/70 p-5">
                <div className="flex items-center gap-2">
                  <Mascot className="size-6" />
                  <span className="font-display text-sm font-semibold text-fg">Try it on the canvas</span>
                </div>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  Start an empty workspace with LaTeX math nodes, dynamic calculators, and markdown
                  scratchpads.
                </p>
                <a
                  href={APP_URL}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2 px-3 text-xs font-medium text-accent-fg transition hover:brightness-110 cursor-pointer"
                >
                  Launch Unlined
                  <ArrowRight className="size-3.5" />
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-fg">
                  Related Guides &amp; Articles
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Continue exploring STEM derivations, university workflows, and infinite canvas techniques.
                </p>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                Browse all guides
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <div
                  key={rel.slug}
                  className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 transition hover:border-accent/50 hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                        {rel.category}
                      </span>
                      <span className="text-muted text-[11px]">{rel.readTime}</span>
                    </div>
                    <Link href={blogUrl(rel.slug)} className="block">
                      <h3 className="font-display text-base font-semibold leading-snug text-fg group-hover:text-accent transition-colors">
                        {rel.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">{rel.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line/60">
                    <Link
                      href={blogUrl(rel.slug)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-accent"
                    >
                      Read Guide
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
