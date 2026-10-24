import { BlogIndex } from '@landing/blog/BlogIndex';
import { BlogLayout } from '@landing/blog/BlogLayout';
import { getPostBySlug } from '@landing/blog/registry';
import { Nav } from '@landing/components/Nav';
import { PrivacyPolicy } from '@landing/legal/PrivacyPolicy';
import { TermsOfUse } from '@landing/legal/TermsOfUse';
import { Link, useRouter } from '@landing/router';
import { AiControl } from '@landing/sections/AiControl';
import { Controls } from '@landing/sections/Controls';
import { FinalCta, Footer, Story } from '@landing/sections/Cta';
import { Hero } from '@landing/sections/Hero';
import { LocalFirst } from '@landing/sections/LocalFirst';
import { NodeTypes } from '@landing/sections/NodeTypes';
import { Roadmap } from '@landing/sections/Roadmap';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useEffect } from 'react';

export default function App() {
  const { route } = useRouter();

  // Reset meta on Home route
  useEffect(() => {
    if (route.name === 'home') {
      document.title = 'Unlined — Infinite Canvas for Math, Markdown, Web & Code';
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          'content',
          'A lightweight, local-first infinite canvas for math, Markdown, live web pages, PDFs, spreadsheets, graphs, and code. Private by default with optional encrypted cloud sync and AI agent control.',
        );
      }
    }
  }, [route.name]);

  if (route.name === 'privacy') {
    return (
      <div className="relative min-h-screen bg-canvas text-fg antialiased">
        <Nav />
        <main>
          <PrivacyPolicy />
        </main>
        <Footer />
      </div>
    );
  }

  if (route.name === 'terms') {
    return (
      <div className="relative min-h-screen bg-canvas text-fg antialiased">
        <Nav />
        <main>
          <TermsOfUse />
        </main>
        <Footer />
      </div>
    );
  }

  if (route.name === 'blog-index') {
    return <BlogIndex />;
  }

  if (route.name === 'blog-post') {
    const post = getPostBySlug(route.slug);
    if (!post) {
      return (
        <div className="min-h-screen bg-canvas text-fg flex flex-col justify-between">
          <header className="border-b border-line p-4">
            <div className="mx-auto max-w-[1240px] flex items-center justify-between">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg"
              >
                <ArrowLeft className="size-3.5" />
                Back to Blog
              </Link>
            </div>
          </header>
          <div className="mx-auto max-w-[600px] text-center p-8">
            <BookOpen className="mx-auto size-12 text-muted mb-4" />
            <h1 className="font-display text-2xl font-bold">Article Not Found</h1>
            <p className="mt-2 text-sm text-muted">
              We couldn't find an article matching slug "{route.slug}". It may have been moved or renamed.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-fg"
            >
              Browse All Articles
            </Link>
          </div>
          <Footer />
        </div>
      );
    }
    return <BlogLayout post={post} />;
  }

  // Home route
  return (
    <div className="relative min-h-screen bg-canvas text-fg antialiased">
      <Nav />
      <main>
        <Hero />
        <Story />
        <NodeTypes />
        <Controls />
        <LocalFirst />
        <AiControl />
        <Roadmap />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
