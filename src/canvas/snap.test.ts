import type { NodeChange } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import type { AppNode } from '@/model/types';
import { GRID, withSnappedResize } from './snap';

const node = (id: string, type: AppNode['type']) =>
  ({ id, type, position: { x: 0, y: 0 }, data: {} }) as AppNode;
const resize = (id: string, width: number, height: number, resizing = true): NodeChange<AppNode> => ({
  type: 'dimensions',
  id,
  dimensions: { width, height },
  resizing,
  setAttributes: true,
});

describe('withSnappedResize', () => {
  const nodes = [node('g', 'graph'), node('i', 'image')];

  it('rounds a resized node up to whole grid steps', () => {
    const [change] = withSnappedResize([resize('g', 5 * GRID + 1, 3 * GRID - 4)], nodes);
    expect(change).toMatchObject({ dimensions: { width: 6 * GRID, height: 3 * GRID } });
  });

  it('leaves measurements, images and other changes alone', () => {
    const measured = resize('g', 101, 57, false);
    const image = resize('i', 101, 57);
    const select: NodeChange<AppNode> = { type: 'select', id: 'g', selected: true };
    expect(withSnappedResize([measured, select], nodes)).toEqual([measured, select]);
    expect(withSnappedResize([image], nodes)).toEqual([image]);
  });
});
