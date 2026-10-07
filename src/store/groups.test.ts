import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_VIEWPORT } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { getCanvasContent, undo, useCanvasStore } from './canvasStore';
import { nodeRect, organiseCanvas, refreshGroups } from './groups';

const state = () => useCanvasStore.getState();
const math = (x: number, y: number) => createNode('math', { x, y });

beforeEach(() => state().load({ nodes: [], viewport: DEFAULT_VIEWPORT }));

describe('groups', () => {
  it('sizes nodes by measurement, then stored size, then the kind default', () => {
    const graph = createNode('graph', { x: 0, y: 0 });
    expect(nodeRect(graph)).toMatchObject({ width: 380, height: 360 });
    expect(nodeRect({ ...graph, measured: { width: 10, height: 20 } })).toMatchObject({
      width: 10,
      height: 20,
    });
    expect(nodeRect(math(0, 0))).toMatchObject({ width: 240, height: 120 });
  });

  it('refreshes groups without moving nodes and keeps ids stable', () => {
    const [a, b, far] = [math(0, 0), math(260, 0), math(5000, 0)];
    state().load({ nodes: [a, b, far], viewport: DEFAULT_VIEWPORT });
    const first = refreshGroups();
    expect(first.map((g) => g.nodeIds)).toEqual([[a.id, b.id], [far.id]]);
    expect(state().nodes.map((n) => n.position)).toEqual([a.position, b.position, far.position]);

    state().moveNodes(new Map([[far.id, { x: 520, y: 0 }]]));
    const second = refreshGroups();
    expect(second).toEqual([{ id: first[0].id, nodeIds: [a.id, b.id, far.id] }]);
  });

  it('saves groups with the canvas', () => {
    state().load({ nodes: [math(0, 0)], viewport: DEFAULT_VIEWPORT });
    expect(getCanvasContent()).not.toHaveProperty('groups');
    const groups = refreshGroups();
    expect(getCanvasContent().groups).toEqual(groups);
  });

  it('organises with even padding as one undo step', () => {
    const [a, b] = [math(0, 0), math(300, 40)];
    state().load({ nodes: [a, b], viewport: DEFAULT_VIEWPORT });
    organiseCanvas();
    expect(state().nodes.map((n) => n.position)).toEqual([
      { x: 0, y: 0 },
      { x: 264, y: 0 },
    ]);
    expect(state().groups).toHaveLength(1);
    undo();
    expect(state().nodes.map((n) => n.position)).toEqual([a.position, b.position]);
  });
});
