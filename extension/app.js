// Runs in Node-Blank itself. Tells the app the extension is installed, and the service worker
// which tab to strip frame headers for.
(() => {
  const { SOURCE } = globalThis.NodeBlankWeb;
  const version = chrome.runtime.getManifest().version;

  // Content scripts share the page's DOM, so a data attribute is visible to the app.
  document.documentElement.dataset.nodeBlankWeb = version;
  window.postMessage({ source: SOURCE, type: 'ready', version }, location.origin);

  chrome.runtime.sendMessage({ type: 'register' }).catch(() => {});
})();
