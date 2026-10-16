import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_VIEWPORT } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { exportCanvases } from '@/persistence/io';
import { undo, useCanvasStore } from '@/store/canvasStore';
import { pasteNodes } from '@/store/workspace';
import { parseClipboard, serializeSelection } from './clipboard';

const state = () => useCanvasStore.getState();
const at = (x: number, y: number) => ({ x, y });

beforeEach(() => state().load({ nodes: [], viewport: DEFAULT_VIEWPORT }));

describe('clipboard', () => {
  it('round-trips the selected nodes', () => {
    const a = createNode('math', at(10, 20), { latex: 'x^2' });
    const b = createNode('text', at(500, 20));
    const payload = serializeSelection([{ ...a, selected: true }, b]);
    const nodes = payload ? parseClipboard(payload) : null;
    expect(nodes).toHaveLength(1);
    expect(nodes?.[0]).toMatchObject({ id: a.id, type: 'math', data: { latex: 'x^2' } });
  });

  it('has nothing to copy without a selection', () => {
    expect(serializeSelection([createNode('math', at(0, 0))])).toBeNull();
  });

  it('brings the nodes inside a selected section', () => {
    const section = createNode('section', at(0, 0), {}, { width: 400, height: 300 });
    const inside = createNode('math', at(50, 80));
    const outside = createNode('math', at(2000, 0));
    const payload = serializeSelection([{ ...section, selected: true }, inside, outside]);
    expect(
      parseClipboard(payload ?? '')
        ?.map((n) => n.id)
        .sort(),
    ).toEqual([section.id, inside.id].sort());
  });

  it('ignores anything that is not copied nodes', () => {
    expect(parseClipboard('hello')).toBeNull();
    expect(parseClipboard('{"a":1}')).toBeNull();
    expect(parseClipboard(JSON.stringify(exportCanvases([])))).toBeNull();
  });
});

describe('pasteNodes', () => {
  it('places copies with fresh ids at the target, selected, as one undo step', () => {
    const a = createNode('math', at(100, 100));
    const b = createNode('math', at(300, 160));
    state().load({ nodes: [a], viewport: DEFAULT_VIEWPORT });
    pasteNodes([a, b], at(1000, 500));
    const { nodes } = state();
    expect(nodes).toHaveLength(3);
    expect(nodes.slice(1).map((n) => n.position)).toEqual([at(1000, 500), at(1200, 560)]);
    expect(nodes.map((n) => n.id)).not.toContain(b.id);
    expect(nodes.filter((n) => n.selected)).toHaveLength(2);
    undo();
    expect(state().nodes).toHaveLength(1);
  });
});
