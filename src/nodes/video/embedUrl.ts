/**
 * Turns a pasted YouTube/Vimeo link, embed snippet, or other https URL into an iframe `src`.
 * Returns null for anything that is not an http(s) URL.
 */
export function toEmbedUrl(input: string): string | null {
  const text = input.trim();
  const src = text.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)?.[1] ?? text;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const host = url.hostname.replace(/^(www|m)\./, '');
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  if (host === 'vimeo.com') {
    const id = url.pathname.match(/^\/(\d+)/)?.[1];
    if (id) return `https://player.vimeo.com/video/${id}`;
  }
  return url.href;
}
