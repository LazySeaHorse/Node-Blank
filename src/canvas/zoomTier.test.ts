import { describe, expect, it } from 'vitest';
import { counterScale, zoomTier } from './zoomTier';

describe('zoomTier', () => {
  it('keeps full detail from 72% up and shows titles only below 10%', () => {
    expect(zoomTier(1)).toBe('near');
    expect(zoomTier(0.72)).toBe('near');
    expect(zoomTier(0.5)).toBe('mid');
    expect(zoomTier(0.42)).toBe('mid');
    expect(zoomTier(0.1)).toBe('mid');
    expect(zoomTier(0.05)).toBe('far');
  });
});

describe('counterScale', () => {
  it('leaves a canvas at 100% or more alone', () => {
    expect(counterScale(1)).toBe(1);
    expect(counterScale(3)).toBe(1);
  });

  it('grows as the canvas shrinks, in quarter steps', () => {
    expect(counterScale(0.5)).toBe(2);
    expect(counterScale(0.3)).toBe(3.25);
    expect(counterScale(0.1)).toBe(10);
  });
});
