import { normaliseWebUrl } from './url';

/** Tag on every message between the app and the extension's script inside a framed page (see extension/). */
export const WEB_SOURCE = 'node-blank-web';

/** What a framed page reports about itself. */
export interface FrameState {
  url: string;
  title: string;
  favicon?: string;
  canGoBack: boolean;
  canGoForward: boolean;
}

export type FrameCommand = 'back' | 'forward' | 'reload' | { navigate: string };

/**
 * Reads a `message` event's data as a state report. The sender is whatever page is in the frame, so
 * nothing is trusted: addresses must be http(s) and the title is clipped.
 */
export function parseFrameState(data: unknown): FrameState | null {
  if (typeof data !== 'object' || data === null) return null;
  const m = data as Record<string, unknown>;
  if (m.source !== WEB_SOURCE || m.type !== 'state' || typeof m.url !== 'string') return null;
  const url = normaliseWebUrl(m.url);
  if (!url) return null;
  const favicon = typeof m.favicon === 'string' ? normaliseWebUrl(m.favicon) : null;
  return {
    url,
    title: typeof m.title === 'string' ? m.title.trim().slice(0, 300) : '',
    ...(favicon ? { favicon } : {}),
    canGoBack: m.canGoBack === true,
    canGoForward: m.canGoForward === true,
  };
}

/** Asks the extension's script in `frame` to act. The page there may be any site, so it only learns the command. */
export function sendFrameCommand(frame: Window | null | undefined, command: FrameCommand) {
  const body = typeof command === 'string' ? { command } : { command: 'navigate', url: command.navigate };
  frame?.postMessage({ source: WEB_SOURCE, type: 'command', ...body }, '*');
}
