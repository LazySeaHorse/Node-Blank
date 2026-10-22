import { describe, expect, it } from 'vitest';
import { parsePlaying, playerKind } from './player';

const YT = 'https://www.youtube.com';

describe('playerKind', () => {
  it('knows YouTube and Vimeo embeds only', () => {
    expect(playerKind('https://www.youtube.com/embed/abc?enablejsapi=1')).toBe('youtube');
    expect(playerKind('https://player.vimeo.com/video/1')).toBe('vimeo');
    expect(playerKind('https://example.com/v')).toBeNull();
    expect(playerKind(null)).toBeNull();
  });
});

describe('parsePlaying', () => {
  it('reads YouTube state changes and info deliveries', () => {
    expect(parsePlaying('youtube', YT, JSON.stringify({ event: 'onStateChange', info: 1 }))).toBe(true);
    expect(parsePlaying('youtube', YT, JSON.stringify({ event: 'onStateChange', info: 2 }))).toBe(false);
    expect(
      parsePlaying('youtube', YT, JSON.stringify({ event: 'infoDelivery', info: { playerState: 0 } })),
    ).toBe(false);
    expect(
      parsePlaying('youtube', YT, JSON.stringify({ event: 'infoDelivery', info: { currentTime: 3 } })),
    ).toBeNull();
  });

  it('reads Vimeo events', () => {
    const origin = 'https://player.vimeo.com';
    expect(parsePlaying('vimeo', origin, JSON.stringify({ event: 'play' }))).toBe(true);
    expect(parsePlaying('vimeo', origin, { event: 'pause' })).toBe(false);
  });

  it('ignores other origins and junk', () => {
    expect(
      parsePlaying('youtube', 'https://evil.example', JSON.stringify({ event: 'onStateChange', info: 1 })),
    ).toBeNull();
    expect(parsePlaying('youtube', YT, 'not json')).toBeNull();
  });
});
