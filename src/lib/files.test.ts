import { describe, expect, it } from 'vitest';
import { fitWithin, slugify } from './files';

describe('fitWithin', () => {
  it('scales down preserving aspect ratio', () => {
    expect(fitWithin({ width: 1000, height: 500 }, 400)).toEqual({ width: 400, height: 200 });
    expect(fitWithin({ width: 300, height: 900 }, 300)).toEqual({ width: 100, height: 300 });
  });

  it('never scales up', () => {
    expect(fitWithin({ width: 100, height: 50 }, 400)).toEqual({ width: 100, height: 50 });
  });
});

describe('slugify', () => {
  it('makes safe filenames', () => {
    expect(slugify('My Canvas: v2!')).toBe('my-canvas-v2');
    expect(slugify('***')).toBe('canvas');
  });
});
