// Runs in every frame, but only does anything in a page that is a direct child of Node-Blank, i.e. the
// page shown by a Web node. It reports where the page is (the address bar, title and favicon of the
// node) and obeys back, forward, reload and grab (a picture of the video's current frame).
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

  /** Longest side of a grabbed frame; the app shows images far smaller than a full-HD frame anyway. */
  const MAX_EDGE = 1280;

  /** The video worth grabbing: the largest one on the page that has a picture. */
  function findVideo() {
    const ready = [...document.querySelectorAll('video')].filter(
      (v) => v.readyState >= 2 && v.videoWidth > 0,
    );
    return ready.sort((a, b) => b.videoWidth * b.videoHeight - a.videoWidth * a.videoHeight)[0];
  }

  /** Whether a canvas is all black, which is what protected video draws as. Looks at a 16 x 9 thumbnail. */
  function isBlack(canvas) {
    const small = document.createElement('canvas');
    small.width = 16;
    small.height = 9;
    const context = small.getContext('2d');
    context.drawImage(canvas, 0, 0, 16, 9);
    const { data } = context.getImageData(0, 0, 16, 9);
    for (let i = 0; i < data.length; i += 4)
      if (data[i] > 8 || data[i + 1] > 8 || data[i + 2] > 8) return false;
    return true;
  }

  /** Draws the video's current frame to a JPEG and sends it to the app, or says why it cannot. */
  function grab(id) {
    const reply = (fields) =>
      window.parent.postMessage({ source: SOURCE, type: 'frame', id, ...fields }, appOrigin);
    const video = findVideo();
    if (!video) return reply({ error: 'no-video' });
    const scale = Math.min(1, MAX_EDGE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    try {
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const black = isBlack(canvas);
      const time = video.currentTime;
      canvas.toBlob(
        (blob) =>
          reply(
            blob ? { blob, time, width: canvas.width, height: canvas.height, black } : { error: 'encode' },
          ),
        'image/jpeg',
        0.9,
      );
    } catch {
      // A video from another origin without CORS taints the canvas.
      reply({ error: 'blocked' });
    }
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.origin !== appOrigin) return;
    const data = event.data;
    if (data?.source !== SOURCE || data.type !== 'command') return;
    if (data.command === 'back') history.back();
    else if (data.command === 'forward') history.forward();
    else if (data.command === 'reload') location.reload();
    else if (data.command === 'grab' && typeof data.id === 'number') grab(data.id);
    else if (data.command === 'navigate' && typeof data.url === 'string') {
      // Only web addresses; the app is not the one to hand a framed page a javascript: URL.
      try {
        const url = new URL(data.url);
        if (url.protocol === 'https:' || url.protocol === 'http:') location.assign(url.href);
      } catch {}
    }
  });
})();
