import { useSyncExternalStore } from 'react';
import { WEB_SOURCE } from './frameMessages';

/** The extension's content script marks the page with its version before the app runs. */
const read = () => document.documentElement.dataset.nodeBlankWeb ?? null;

function subscribe(onChange: () => void) {
  // The script also announces itself, in case it was injected after the app started.
  const onMessage = (event: MessageEvent) => {
    if (event.source === window && event.data?.source === WEB_SOURCE && event.data.type === 'ready')
      onChange();
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}

/** Version of the Node-Blank Web extension in this browser, or null when it is not installed (or the page predates it). */
export const useWebExtension = () => useSyncExternalStore(subscribe, read, () => null);
