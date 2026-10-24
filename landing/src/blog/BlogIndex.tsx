import { Mascot } from '@landing/components/Mascot';
import { APP_URL } from '@landing/components/Nav';
import { blogUrl, Link } from '@landing/router';
import { Footer } from '@landing/sections/Cta';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock,
  Filter,
  Globe2,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getAllPosts, getCategories } from './registry';

export function BlogIndex() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const allPosts = getAllPosts();
  const categories = ['All', ...getCategories()];
  const regions = ['All', 'US', 'UK', 'DACH', 'India', 'Global'];

  useEffect(() => {
    document.title = 'Blog & STEM Problem Set Guides — Unlined';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Guides, derivations, and workflows for engineering problem sets, linear algebra, multivariable calculus, and university curricula at MIT, Stanford, Cambridge, IIT, and ETH Zürich.',
      );
    }
  }, []);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      // Category filter
      if (selectedCategory !== 'All' && post.category !== selectedCategory) {
        return false;
      }
      // Region filter
      if (selectedRegion !== 'All' && post.geoRegion !== selectedRegion) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = post.title.toLowerCase().includes(q);
      const inDesc = post.description.toLowerCase().includes(q);
      const inKeywords = post.keywords.some((k) => k.toLowerCase().includes(q));
      const inCategory = post.category.toLowerCase().includes(q);

      return inTitle || inDesc || inKeywords || inCategory;
    });
  }, [allPosts, selectedCategory, selectedRegion, searchQuery]);

  return (
    <div className="min-h-screen bg-canvas text-fg antialiased selection:bg-accent/20">
      {/* Top Header & Navigation */}
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2" ariaLabel="Unlined Home">
              <Mascot className="size-7 transition-transform duration-300 group-hover:-rotate-6" />
              <span className="font-display text-[15px] font-medium tracking-tight text-fg">Unlined</span>
            </Link>

            <span className="text-muted/60 select-none">/</span>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
              <Link href="/" className="hover:text-fg transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3 text-muted/60" />
              <span className="font-medium text-fg">Blog &amp; Guides</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:inline-flex rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg transition hover:bg-surface-2"
            >
              Back to Home
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

      {/* Hero Section */}
      <section className="border-b border-line bg-gradient-to-b from-surface/50 via-canvas to-canvas py-12 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="max-w-[800px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-accent mb-4">
              <BookOpen className="size-3.5" />
              <span>STEM Knowledge Base &amp; Workflows</span>
            </div>
            <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-bold tracking-tight text-fg leading-[1.08] text-balance">
              Derivations, problem sets &amp; spatial math notes.
            </h1>
            <p className="mt-4 text-[clamp(1rem,1.8vw,1.2rem)] leading-relaxed text-muted text-balance font-sans">
              Practical guides on multivariable calculus, linear algebra, engineering psets, and university
              workflows. Built for students who are tired of switching between five windows.
            </p>
          </div>

          {/* Search bar & Filters container */}
          <div className="mt-10 space-y-4">
            {/* Search input */}
            <div className="relative max-w-[640px]">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, theorem, keyword (e.g. SVD, Jacobian, MIT, circuits)..."
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-xs font-mono text-muted mr-1">
                <Filter className="size-3" /> Topic:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-fg text-canvas shadow-xs'
                      : 'border border-line bg-surface text-muted hover:bg-surface-2 hover:text-fg'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Region pills (US, UK, DACH, India, etc.) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 font-mono text-muted mr-1">
                <Globe2 className="size-3" /> Region:
              </span>
              {regions.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setSelectedRegion(reg)}
                  className={`rounded-md px-2.5 py-0.5 text-[11.5px] transition cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-accent text-accent-fg font-medium'
                      : 'border border-line bg-surface-2 text-muted hover:text-fg'
                  }`}
                >
                  {reg}
                </button>
              ))}

              {(selectedCategory !== 'All' || selectedRegion !== 'All' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedRegion('All');
                    setSearchQuery('');
                  }}
                  className="ml-auto text-xs text-accent hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Articles Section */}
      <main className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6">
        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between text-xs text-muted font-mono">
          <span>
            Showing {filteredPosts.length} of {allPosts.length} articles
          </span>
          {searchQuery && <span>Filter: &quot;{searchQuery}&quot;</span>}
        </div>

        {/* Empty state */}
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
            <BookOpen className="mx-auto size-8 text-muted mb-3" />
            <h3 className="font-display text-lg font-semibold text-fg">No matching articles found</h3>
            <p className="mt-1 text-sm text-muted">
              We couldn't find any articles matching your search query or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedRegion('All');
                setSearchQuery('');
              }}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-fg transition hover:brightness-110 cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 transition duration-200 hover:border-accent/60 hover:shadow-md"
              >
                <div>
                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
                    <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-fg">
                      {post.category}
                    </span>
                    {post.geoRegion && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted">
                        <Globe2 className="size-3 text-accent" />
                        {post.geoRegion}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={blogUrl(post.slug)} className="block">
                    <h2 className="font-display text-lg sm:text-xl font-bold leading-snug tracking-tight text-fg group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Description */}
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted line-clamp-3">
                    {post.description}
                  </p>

                  {/* Keywords */}
                  {post.keywords && post.keywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {post.keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-muted"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer of card */}
                <div className="mt-6 border-t border-line/60 pt-4 flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11.5px]">
                      <Clock className="size-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <Link
                    href={blogUrl(post.slug)}
                    className="inline-flex items-center gap-1 font-medium text-accent transition group-hover:translate-x-0.5"
                  >
                    <span>Read guide</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-line bg-gradient-to-r from-surface via-surface to-surface-2 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-0.5 text-xs font-medium text-accent">
                <Sparkles className="size-3.5" />
                No account required • 100% Free &amp; Open Source
              </div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-fg">
                Ready to organize your math and engineering work?
              </h3>
              <p className="text-sm text-muted max-w-[550px]">
                Double-click anywhere to place a math equation, graph, code runner, or PDF. Everything stays
                local in your browser.
              </p>
            </div>
            <a
              href={APP_URL}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition hover:brightness-110 motion-safe:active:scale-[0.98] cursor-pointer shrink-0 shadow-sm"
            >
              <span>Open Unlined Canvas</span>
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
