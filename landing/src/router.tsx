import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'blog-index' }
  | { name: 'blog-post'; slug: string }
  | { name: 'tools-index' }
  | { name: 'tool-view'; toolSlug: string }
  | { name: 'privacy' }
  | { name: 'terms' };

/**
 * Parse the current URL pathname and hash into a typed Route.
 * Supports both clean pathnames (`/blog`, `/blog/:slug`, `/tools`, `/tools/:toolSlug`, `/privacy`, `/terms`)
 * and hash fallbacks (`/#blog`, `/#blog/:slug`, `/#tools`, `/#tools/:toolSlug`, `/#privacy`, `/#terms`).
 */
export function parseRoute(pathname: string, hash: string): Route {
  // 1. Check pathname first
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  if (cleanPath === '/privacy') {
    return { name: 'privacy' };
  }
  if (cleanPath === '/terms') {
    return { name: 'terms' };
  }

  if (cleanPath === '/blog') {
    return { name: 'blog-index' };
  }
  if (cleanPath.startsWith('/blog/')) {
    const slug = decodeURIComponent(cleanPath.slice('/blog/'.length)).trim();
    if (slug) return { name: 'blog-post', slug };
    return { name: 'blog-index' };
  }

  if (cleanPath === '/tools') {
    return { name: 'tools-index' };
  }
  if (cleanPath.startsWith('/tools/')) {
    const toolSlug = decodeURIComponent(cleanPath.slice('/tools/'.length)).trim();
    if (toolSlug) return { name: 'tool-view', toolSlug };
    return { name: 'tools-index' };
  }

  // 2. Hash fallback (for static hosting or anchor-based deep linking)
  const cleanHash = hash.replace(/^#\/?/, '').trim();
  if (cleanHash === 'privacy') {
    return { name: 'privacy' };
  }
  if (cleanHash === 'terms') {
    return { name: 'terms' };
  }

  if (cleanHash === 'blog') {
    return { name: 'blog-index' };
  }
  if (cleanHash.startsWith('blog/')) {
    const slug = decodeURIComponent(cleanHash.slice('blog/'.length)).trim();
    if (slug) return { name: 'blog-post', slug };
    return { name: 'blog-index' };
  }

  if (cleanHash === 'tools') {
    return { name: 'tools-index' };
  }
  if (cleanHash.startsWith('tools/')) {
    const toolSlug = decodeURIComponent(cleanHash.slice('tools/'.length)).trim();
    if (toolSlug) return { name: 'tool-view', toolSlug };
    return { name: 'tools-index' };
  }

  return { name: 'home' };
}

function getCurrentLocation() {
  if (typeof window === 'undefined') {
    return { pathname: '/', hash: '' };
  }
  return {
    pathname: window.location.pathname,
    hash: window.location.hash,
  };
}

let locationSnapshot = getCurrentLocation();

function subscribe(callback: () => void) {
  const handler = () => {
    locationSnapshot = getCurrentLocation();
    callback();
  };
  window.addEventListener('popstate', handler);
  window.addEventListener('hashchange', handler);
  return () => {
    window.removeEventListener('popstate', handler);
    window.removeEventListener('hashchange', handler);
  };
}

/**
 * Hook providing the currently matched Route and navigation function.
 */
export function useRouter(): {
  route: Route;
  navigate: (to: string, options?: { replace?: boolean }) => void;
} {
  const loc = useSyncExternalStore(
    subscribe,
    () => locationSnapshot,
    () => ({ pathname: '/', hash: '' }),
  );
  const route = parseRoute(loc.pathname, loc.hash);

  return { route, navigate };
}

/**
 * Imperative client-side navigation.
 * Updates history with pushState / replaceState, dispatches popstate, and scrolls to top.
 */
export function navigate(to: string, options?: { replace?: boolean }) {
  if (typeof window === 'undefined') return;

  // External URLs or explicit app link
  if (/^[a-z]+:/i.test(to) || to.startsWith('//')) {
    window.location.href = to;
    return;
  }

  if (options?.replace) {
    window.history.replaceState(null, '', to);
  } else {
    window.history.pushState(null, '', to);
  }

  locationSnapshot = getCurrentLocation();
  window.dispatchEvent(new Event('popstate'));

  const hashIndex = to.indexOf('#');
  if (hashIndex !== -1) {
    const hashId = to.slice(hashIndex + 1);
    const element = hashId ? document.getElementById(hashId) : null;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Helper to generate consistent pathnames with optional hash mode detection.
 */
export function blogUrl(slug?: string): string {
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#blog')) {
    return slug ? `/#blog/${slug}` : '/#blog';
  }
  return slug ? `/blog/${slug}` : '/blog';
}

export function toolsUrl(toolSlug?: string): string {
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#tools')) {
    return toolSlug ? `/#tools/${toolSlug}` : '/#tools';
  }
  return toolSlug ? `/tools/${toolSlug}` : '/tools';
}

export function privacyUrl(): string {
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#privacy')) {
    return '/#privacy';
  }
  return '/privacy';
}

export function termsUrl(): string {
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#terms')) {
    return '/#terms';
  }
  return '/terms';
}

/**
 * Nav link component that intercepts internal SPA links without full page reloads.
 */
export function Link({
  href,
  children,
  className,
  title,
  ariaLabel,
  target,
  rel,
  onClick,
  activeClassName,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  activeClassName?: string;
}) {
  const { route } = useRouter();

  // Determine active state
  let isActive = false;
  if (href === '/blog' || href === '/#blog') {
    isActive = route.name === 'blog-index';
  } else if (href === '/tools' || href === '/#tools') {
    isActive = route.name === 'tools-index';
  } else if (href === '/privacy' || href === '/#privacy') {
    isActive = route.name === 'privacy';
  } else if (href === '/terms' || href === '/#terms') {
    isActive = route.name === 'terms';
  } else if (href === '/' || href === '') {
    isActive = route.name === 'home';
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;

    // Only intercept plain left clicks without modifiers
    if (
      e.button === 0 &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.shiftKey &&
      (!target || target === '_self') &&
      !href.startsWith('http') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('/app')
    ) {
      e.preventDefault();
      navigate(href);
    }
  };

  const finalClassName = `${className ?? ''} ${isActive && activeClassName ? activeClassName : ''}`.trim();

  return (
    <a
      href={href}
      className={finalClassName}
      title={title}
      aria-label={ariaLabel}
      target={target}
      rel={rel}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </a>
  );
}
