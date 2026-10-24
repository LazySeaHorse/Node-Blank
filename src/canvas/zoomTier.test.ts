import { describe, expect, it } from 'vitest';
import { zoomTier } from './zoomTier';

describe('zoomTier', () => {
  it('keeps full detail from 72% up', () => {
    expect(zoomTier(1)).toBe('near');
    expect(zoomTier(0.72)).toBe('near');
    expect(zoomTier(0.5)).toBe('mid');
    expect(zoomTier(0.42)).toBe('mid');
    expect(zoomTier(0.1)).toBe('mid');
  });
});
