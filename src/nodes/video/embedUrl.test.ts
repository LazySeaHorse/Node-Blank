import { describe, expect, it } from 'vitest';
import { toEmbedUrl } from './embedUrl';

const YT = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

describe('toEmbedUrl', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    '<iframe width="560" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0"></iframe>',
  ])('normalizes YouTube input %s', (input) => {
    expect(toEmbedUrl(input)).toBe(YT);
  });

  it('normalizes Vimeo links', () => {
    expect(toEmbedUrl('https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456');
  });

  it('passes other http(s) URLs through', () => {
    expect(toEmbedUrl('https://example.com/video')).toBe('https://example.com/video');
  });

  it('rejects non-URLs and unsafe schemes', () => {
    expect(toEmbedUrl('not a url')).toBeNull();
    expect(toEmbedUrl('javascript:alert(1)')).toBeNull();
  });
});
