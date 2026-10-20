import { describe, expect, it } from 'vitest';
import { isNearScreen } from './useLoaded';

const screen = { width: 1000, height: 800 };
const node = { x: 0, y: 0, width: 900, height: 640 };

describe('isNearScreen', () => {
  it('keeps nodes on screen and just off it', () => {
    expect(isNearScreen(node, { x: 0, y: 0, zoom: 1 }, screen)).toBe(true);
    expect(isNearScreen(node, { x: 1200, y: 0, zoom: 1 }, screen)).toBe(true);
  });

  it('lets go of nodes far from the screen', () => {
    expect(isNearScreen(node, { x: 1600, y: 0, zoom: 1 }, screen)).toBe(false);
    expect(isNearScreen(node, { x: 0, y: -1500, zoom: 1 }, screen)).toBe(false);
    expect(isNearScreen(node, { x: -3000, y: 0, zoom: 1 }, screen)).toBe(false);
  });

  it('lets go of everything when zoomed far out', () => {
    expect(isNearScreen(node, { x: 0, y: 0, zoom: 0.15 }, screen)).toBe(false);
    expect(isNearScreen(node, { x: 0, y: 0, zoom: 0.25 }, screen)).toBe(true);
  });
});
