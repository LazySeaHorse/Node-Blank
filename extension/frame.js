// Runs in every frame, but only does anything in a page that is a direct child of Node-Blank, i.e. the
// page shown by a Web node. It reports where the page is (the address bar, title and favicon of the
// node) and obeys back, forward and reload.
(() => {
  const { SOURCE, isAppOrigin } = globalThis.NodeBlankWeb;

  // Chrome lists the origins of all ancestors, nearest first. A page nested deeper in the framed site has
  // the framed site as its nearest ancestor and is left alone.
  const ancestors = location.ancestorOrigins;
  if (window.parent === window || window.parent !== window.top || !ancestors || ancestors.length !== 1)
    return;
  const appOrigin = ancestors[0];
  if (!isAppOrigin(appOrigin)) return;

  /** The page's own icon, else the conventional place for one. */
  function favicon() {
    const link = document.querySelector('link[rel~="icon" i]');
    return link?.href || new URL('/favicon.ico', location.href).href;
  }

  let last = '';
  /** Sends the page's state to the app, unless nothing changed since the last time (or `force`). */
  function report(force = false) {
    const nav = window.navigation;
    const state = {
      source: SOURCE,
      type: 'state',
      url: location.href,
      title: document.title,
      favicon: favicon(),
      canGoBack: nav ? nav.canGoBack : history.length > 1,
      canGoForward: nav ? nav.canGoForward : undefined,
    };
    const key = JSON.stringify(state);
    if (key === last && !force) return;
    last = key;
    window.parent.postMessage(state, appOrigin);
  }

  // Pages change their address without loading: pushState and replaceState are called in the page's own
  // JavaScript world, out of reach from here, so listen for the navigation events and poll as a backstop.
  window.navigation?.addEventListener('currententrychange', () => report());
  window.addEventListener('popstate', () => report());
  window.addEventListener('hashchange', () => report());
  // The app waits for a report after the frame loads to know the extension is at work, so this one is always sent.
  window.addEventListener('load', () => report(true));
  setInterval(() => report(), 1000);
  document.addEventListener('DOMContentLoaded', () => {
    report();
    const title = document.querySelector('title');
    if (title)
      new MutationObserver(() => report()).observe(title, {
        childList: true,
        characterData: true,
        subtree: true,
      });
  });
  report();

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.origin !== appOrigin) return;
    const data = event.data;
    if (data?.source !== SOURCE || data.type !== 'command') return;
    if (data.command === 'back') history.back();
    else if (data.command === 'forward') history.forward();
    else if (data.command === 'reload') location.reload();
    else if (data.command === 'navigate' && typeof data.url === 'string') {
      // Only web addresses; the app is not the one to hand a framed page a javascript: URL.
      try {
        const url = new URL(data.url);
        if (url.protocol === 'https:' || url.protocol === 'http:') location.assign(url.href);
      } catch {}
    }
  });
})();
