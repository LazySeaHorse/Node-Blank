import { describe, expect, it } from 'vitest';
import { NODE_TAB_HEIGHT } from '../spec';
import { imageBox } from './spec';

describe('imageBox', () => {
  it('caps the image and adds the tab on top', () => {
    expect(imageBox({ width: 1000, height: 500 })).toEqual({ width: 480, height: 240 + NODE_TAB_HEIGHT });
  });

  it('keeps a small image at its own size', () => {
    expect(imageBox({ width: 100, height: 50 })).toEqual({ width: 100, height: 50 + NODE_TAB_HEIGHT });
  });
});
