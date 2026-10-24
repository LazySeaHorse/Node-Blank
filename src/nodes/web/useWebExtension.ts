import { useSyncExternalStore } from 'react';
import { WEB_SOURCE } from './frameMessages';

/** The extension's content script marks the page with its version before the app runs. */
const read = () => document.documentElement.dataset.unlinedWeb ?? null;

function subscribe(onChange: () => void) {
  // The script also announces itself, in case it was injected after the app started.
  const onMessage = (event: MessageEvent) => {
    if (event.source === window && event.data?.source === WEB_SOURCE && event.data.type === 'ready')
      onChange();
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}

/** Version of the Unlined Web extension in this browser, or null when it is not installed (or the page predates it). */
export const useWebExtension = () => useSyncExternalStore(subscribe, read, () => null);

/** Whether this version of the extension can send back a video's current frame (1.1 and later). */
export const canGrabFrames = (version: string | null) => {
  const [major = 0, minor = 0] = (version ?? '').split('.').map(Number);
  return version !== null && (major > 1 || (major === 1 && minor >= 1));
};
