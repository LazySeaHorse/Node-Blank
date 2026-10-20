import { describe, expect, it, vi } from 'vitest';
import { parseFrameState, sendFrameCommand, WEB_SOURCE } from './frameMessages';

const report = (extra: object = {}) => ({
  source: WEB_SOURCE,
  type: 'state',
  url: 'https://a.com/x',
  ...extra,
});

describe('parseFrameState', () => {
  it('reads a state report', () => {
    expect(
      parseFrameState(report({ title: ' Hi ', favicon: 'https://a.com/i.png', canGoBack: true })),
    ).toEqual({
      url: 'https://a.com/x',
      title: 'Hi',
      favicon: 'https://a.com/i.png',
      canGoBack: true,
      canGoForward: false,
    });
  });

  it('ignores other messages', () => {
    expect(parseFrameState(null)).toBeNull();
    expect(parseFrameState('state')).toBeNull();
    expect(parseFrameState({ ...report(), source: 'other' })).toBeNull();
    expect(parseFrameState({ ...report(), type: 'ready' })).toBeNull();
  });

  it('refuses addresses that are not http(s)', () => {
    expect(parseFrameState(report({ url: 'javascript:alert(1)' }))).toBeNull();
    expect(parseFrameState(report({ favicon: 'javascript:alert(1)' }))).not.toHaveProperty('favicon');
  });

  it('clips long titles', () => {
    expect(parseFrameState(report({ title: 'x'.repeat(500) }))?.title).toHaveLength(300);
  });
});

describe('sendFrameCommand', () => {
  it('posts tagged commands', () => {
    const frame = { postMessage: vi.fn() } as unknown as Window;
    sendFrameCommand(frame, 'back');
    sendFrameCommand(frame, { navigate: 'https://b.com/' });
    expect(frame.postMessage).toHaveBeenNthCalledWith(
      1,
      { source: WEB_SOURCE, type: 'command', command: 'back' },
      '*',
    );
    expect(frame.postMessage).toHaveBeenNthCalledWith(
      2,
      { source: WEB_SOURCE, type: 'command', command: 'navigate', url: 'https://b.com/' },
      '*',
    );
  });

  it('does nothing without a frame', () => {
    expect(() => sendFrameCommand(null, 'reload')).not.toThrow();
  });
});
