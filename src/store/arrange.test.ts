import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_VIEWPORT } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { alignSelected, bringToFront, sendToBack } from './arrange';
import { undo, useCanvasStore } from './canvasStore';

const state = () => useCanvasStore.getState();
const ids = () => state().nodes.map((n) => n.id);
const box = (x: number, y: number, w: number, h: number, selected = true) => ({
  ...createNode('image', { x, y }, { src: '' }, { width: w, height: h }),
  selected,
});

beforeEach(() => {
  vi.useRealTimers();
  state().load({ nodes: [], viewport: DEFAULT_VIEWPORT });
});

describe('alignSelected', () => {
  const load = () => {
    const [a, b, c] = [box(0, 0, 100, 50), box(200, 100, 60, 80), box(50, 300, 40, 20)];
    state().load({ nodes: [a, b, c], viewport: DEFAULT_VIEWPORT });
    return [a, b, c];
  };
  const pos = (id: string) => state().nodes.find((n) => n.id === id)?.position;

  it('aligns left edges to the leftmost node', () => {
    const [a, b, c] = load();
    alignSelected('left');
    expect([pos(a.id)?.x, pos(b.id)?.x, pos(c.id)?.x]).toEqual([0, 0, 0]);
    expect(pos(b.id)?.y).toBe(100);
  });

  it('aligns right edges to the rightmost edge', () => {
    const [a, b, c] = load();
    alignSelected('right');
    expect([pos(a.id)?.x, pos(b.id)?.x, pos(c.id)?.x]).toEqual([160, 200, 220]);
  });

  it('centres on the middle of the selection bounds', () => {
    const [a, b, c] = load();
    alignSelected('center'); // bounds 0..260, middle 130
    expect([pos(a.id)?.x, pos(b.id)?.x, pos(c.id)?.x]).toEqual([80, 100, 110]);
  });

  it('aligns top, middle and bottom', () => {
    const [a, b, c] = load();
    alignSelected('top');
    expect([pos(a.id)?.y, pos(b.id)?.y, pos(c.id)?.y]).toEqual([0, 0, 0]);
    const [a2] = load();
    alignSelected('bottom'); // bounds end at 320
    expect(pos(a2.id)?.y).toBe(270);
    state().load({ nodes: [box(0, 0, 10, 50), box(0, 100, 10, 100)], viewport: DEFAULT_VIEWPORT });
    alignSelected('middle'); // bounds 0..200
    expect(state().nodes.map((n) => n.position.y)).toEqual([75, 50]);
  });

  it('ignores unselected nodes and needs at least two', () => {
    const [a, b] = [box(0, 0, 10, 10, false), box(100, 100, 10, 10)];
    state().load({ nodes: [a, b], viewport: DEFAULT_VIEWPORT });
    alignSelected('left');
    expect(pos(b.id)).toEqual({ x: 100, y: 100 });
  });

  it('is one undo step', () => {
    const [a] = load();
    alignSelected('left');
    alignSelected('top');
    undo();
    undo();
    expect(pos(a.id)).toEqual({ x: 0, y: 0 });
    expect(state().nodes[1].position).toEqual({ x: 200, y: 100 });
  });
});

describe('z-order', () => {
  const section = () => createNode('section', { x: 0, y: 0 }, {}, { width: 400, height: 300 });

  it('brings selected nodes to the front, keeping their order', () => {
    const [a, b, c] = [box(0, 0, 10, 10, true), box(0, 0, 10, 10, false), box(0, 0, 10, 10, true)];
    state().load({ nodes: [a, b, c], viewport: DEFAULT_VIEWPORT });
    bringToFront();
    expect(ids()).toEqual([b.id, a.id, c.id]);
  });

  it('sends selected nodes to the back but in front of sections', () => {
    const s = section();
    const [a, b] = [box(0, 0, 10, 10, false), box(0, 0, 10, 10, true)];
    state().load({ nodes: [s, a, b], viewport: DEFAULT_VIEWPORT });
    sendToBack();
    expect(ids()).toEqual([s.id, b.id, a.id]);
  });

  it('moves sections only among sections', () => {
    const [s1, s2] = [{ ...section(), selected: true }, section()];
    const a = box(0, 0, 10, 10, false);
    state().load({ nodes: [s1, s2, a], viewport: DEFAULT_VIEWPORT });
    bringToFront();
    expect(ids()).toEqual([s2.id, s1.id, a.id]);
    sendToBack();
    expect(ids()).toEqual([s1.id, s2.id, a.id]);
  });

  it('does nothing when nothing is selected, and undoes in one step', () => {
    const [a, b] = [box(0, 0, 10, 10, false), box(0, 0, 10, 10, true)];
    state().load({ nodes: [b, a], viewport: DEFAULT_VIEWPORT });
    bringToFront();
    expect(ids()).toEqual([a.id, b.id]);
    undo();
    expect(ids()).toEqual([b.id, a.id]);
    state().onNodesChange([{ type: 'select', id: b.id, selected: false }]);
    bringToFront();
    expect(ids()).toEqual([b.id, a.id]);
  });
});
