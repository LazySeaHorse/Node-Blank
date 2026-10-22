/**
 * Play/pause for embedded players that take commands by `postMessage`: YouTube (needs `enablejsapi=1`)
 * and Vimeo. Any other embed has no such channel and gets no button.
 */
export type PlayerKind = 'youtube' | 'vimeo';

const ORIGINS: Record<PlayerKind, string> = {
  youtube: 'https://www.youtube.com',
  vimeo: 'https://player.vimeo.com',
};

export function playerKind(embedUrl: string | null): PlayerKind | null {
  if (!embedUrl) return null;
  const origin = new URL(embedUrl).origin;
  return (Object.keys(ORIGINS) as PlayerKind[]).find((kind) => ORIGINS[kind] === origin) ?? null;
}

const post = (frame: Window, kind: PlayerKind, message: object) =>
  frame.postMessage(JSON.stringify(message), ORIGINS[kind]);

/** Asks the player to report its state; call once the iframe has loaded. */
export function listen(frame: Window, kind: PlayerKind) {
  if (kind === 'youtube') post(frame, 'youtube', { event: 'listening', id: 1, channel: 'widget' });
  else
    for (const value of ['play', 'pause', 'finish'])
      post(frame, 'vimeo', { method: 'addEventListener', value });
}

export function command(frame: Window, kind: PlayerKind, play: boolean) {
  if (kind === 'youtube')
    post(frame, 'youtube', { event: 'command', func: play ? 'playVideo' : 'pauseVideo', args: [] });
  else post(frame, 'vimeo', { method: play ? 'play' : 'pause' });
}

/** Whether a message from the player says it is playing (true) or not (false); null when it says neither. */
export function parsePlaying(kind: PlayerKind, origin: string, data: unknown): boolean | null {
  if (origin !== ORIGINS[kind]) return null;
  let message: unknown = data;
  if (typeof data === 'string') {
    try {
      message = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (typeof message !== 'object' || message === null) return null;
  const m = message as { event?: unknown; info?: unknown };
  if (kind === 'vimeo')
    return m.event === 'play' ? true : m.event === 'pause' || m.event === 'finish' ? false : null;
  const state =
    m.event === 'onStateChange'
      ? m.info
      : m.event === 'infoDelivery' && typeof m.info === 'object' && m.info !== null
        ? (m.info as { playerState?: unknown }).playerState
        : undefined;
  // 1 playing, 3 buffering (about to play); 0 ended, 2 paused, 5 cued.
  return typeof state === 'number' ? state === 1 || state === 3 : null;
}
