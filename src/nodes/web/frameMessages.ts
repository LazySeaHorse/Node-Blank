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

export type FrameCommand = 'back' | 'forward' | 'reload' | { navigate: string } | { grab: number };

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
  const body =
    typeof command === 'string'
      ? { command }
      : 'grab' in command
        ? { command: 'grab', id: command.grab }
        : { command: 'navigate', url: command.navigate };
  frame?.postMessage({ source: WEB_SOURCE, type: 'command', ...body }, '*');
}

/** A picture of the video playing in a framed page. `black` when it came out black, as protected video does. */
export interface FrameGrab {
  blob: Blob;
  /** Seconds into the video. */
  time: number;
  width: number;
  height: number;
  black: boolean;
}

const GRAB_ERRORS: Record<string, string> = {
  'no-video': 'There is no video to grab yet. Press play first.',
  blocked: 'This video does not allow its frames to be read.',
  encode: 'Could not turn the frame into an image.',
};
/** Far above any frame the extension sends; a bigger "image" is not from it. */
const MAX_GRAB_BYTES = 8 * 1024 * 1024;

/**
 * Reads a `message` event's data as the answer to grab request `id`: the frame, an error to show, or null
 * when it is about something else. The sender is whatever page is in the frame, so the image is checked.
 */
export function parseFrameGrab(data: unknown, id: number): FrameGrab | { error: string } | null {
  if (typeof data !== 'object' || data === null) return null;
  const m = data as Record<string, unknown>;
  if (m.source !== WEB_SOURCE || m.type !== 'frame' || m.id !== id) return null;
  if (typeof m.error === 'string') return { error: GRAB_ERRORS[m.error] ?? 'Could not grab a frame.' };
  const { blob, time, width, height } = m;
  const size = (n: unknown) => typeof n === 'number' && Number.isInteger(n) && n > 0 && n <= 8192;
  if (!(blob instanceof Blob) || blob.type !== 'image/jpeg' || blob.size > MAX_GRAB_BYTES)
    return { error: 'Could not grab a frame.' };
  if (typeof time !== 'number' || !Number.isFinite(time) || !size(width) || !size(height))
    return { error: 'Could not grab a frame.' };
  return {
    blob,
    time: Math.max(0, time),
    width: width as number,
    height: height as number,
    black: m.black === true,
  };
}

let grabId = 0;

/** Asks the extension's script in `frame` for the video's current frame. Rejects with a message fit to show. */
export function grabFrame(frame: Window | null | undefined, timeout = 5000): Promise<FrameGrab> {
  const id = ++grabId;
  return new Promise((resolve, reject) => {
    const done = () => {
      window.removeEventListener('message', listen);
      clearTimeout(timer);
    };
    const listen = (event: MessageEvent) => {
      if (event.source !== frame) return;
      const answer = parseFrameGrab(event.data, id);
      if (!answer) return;
      done();
      if ('error' in answer) reject(new Error(answer.error));
      else resolve(answer);
    };
    const timer = setTimeout(() => {
      done();
      reject(new Error('The video did not answer. Reload the extension and this page.'));
    }, timeout);
    window.addEventListener('message', listen);
    sendFrameCommand(frame, { grab: id });
  });
}
