// Loaded first by every content script and by the service worker (importScripts), so they agree on
// which pages are Unlined and on the message shape.
globalThis.UnlinedWeb = {
  /** Tag on every message between the app and a framed page. */
  SOURCE: 'unlined-web',

  /** Whether `origin` (e.g. "http://localhost:5173") serves Unlined: the live site or a local dev server. */
  isAppOrigin(origin) {
    let url;
    try {
      url = new URL(origin);
    } catch {
      return false;
    }
    if (url.protocol === 'https:') return url.hostname === 'unlined.1azy.ink';
    return url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  },
};
