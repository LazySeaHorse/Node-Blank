/** Hosts that are served over plain http far more often than not: local servers and bare IPv4 addresses. */
const LOCAL_HOST = /^(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?(\/|$)/i;

/**
 * Turns what someone typed in an address bar into an http(s) URL: `example.com` becomes
 * `https://example.com/`, `localhost:3000` becomes `http://localhost:3000/`. Returns null for empty input,
 * anything that is not a web address and any other scheme (`javascript:`, `data:`, `file:`), so the
 * result is safe to hand to an iframe.
 */
export function normaliseWebUrl(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  // Another scheme (`file:`, `javascript:`); a colon followed by digits is a port, as in `localhost:3000`.
  if (/^[a-z][a-z\d+.-]*:(?!\d)/i.test(text) && !/^https?:/i.test(text)) return null;
  const withScheme = /^https?:\/\//i.test(text)
    ? text
    : `${LOCAL_HOST.test(text) ? 'http' : 'https'}://${text}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  return url.hostname ? url.href : null;
}

/** The host of a web address for display, without a leading `www.`; the input itself when it is not one. */
export function hostnameOf(input: string): string {
  try {
    return new URL(input).hostname.replace(/^www\./, '');
  } catch {
    return input;
  }
}
