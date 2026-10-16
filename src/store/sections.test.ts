import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_VIEWPORT } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { undo, useCanvasStore } from './canvasStore';
import { organiseCanvas, refreshGroups } from './groups';
import { deleteSectionWithContents, wrapSelectionInSection } from './sections';

const state = () => useCanvasStore.getState();
const math = (x: number, y: number) => createNode('math', { x, y });

beforeEach(() => {
  vi.useRealTimers();
  state().load({ nodes: [], viewport: DEFAULT_VIEWPORT });
});

describe('sections', () => {
  it('wraps the selection in a section behind the nodes, selected on its own', () => {
    const [a, b] = [math(100, 100), math(400, 200)];
    state().load({
      nodes: [
        { ...a, selected: true },
        { ...b, selected: true },
      ],
      viewport: DEFAULT_VIEWPORT,
    });
    wrapSelectionInSection();
    const { nodes } = state();
    expect(nodes.map((n) => n.type)).toEqual(['section', 'math', 'math']);
    expect(nodes.filter((n) => n.selected).map((n) => n.type)).toEqual(['section']);
    const section = nodes[0];
    expect(section.position.x).toBeLessThan(100);
    expect(section.position.y).toBeLessThan(100);
    expect(section.width).toBeGreaterThan(300);
  });

  it('does nothing without a selection', () => {
    state().load({ nodes: [math(0, 0)], viewport: DEFAULT_VIEWPORT });
    wrapSelectionInSection();
    expect(state().nodes).toHaveLength(1);
  });

  it('undoes a wrap in one step', () => {
    state().load({ nodes: [{ ...math(0, 0), selected: true }], viewport: DEFAULT_VIEWPORT });
    wrapSelectionInSection();
    expect(state().nodes).toHaveLength(2);
    undo();
    expect(state().nodes).toHaveLength(1);
  });

  it('duplicates a section together with the nodes inside it', () => {
    const inside = math(50, 80);
    const outside = math(2000, 0);
    const section = createNode('section', { x: 0, y: 0 }, {}, { width: 400, height: 300 });
    state().load({
      nodes: [{ ...section, selected: true }, inside, outside],
      viewport: DEFAULT_VIEWPORT,
    });
    state().duplicateSelected();
    const { nodes } = state();
    expect(nodes.filter((n) => n.type === 'section')).toHaveLength(2);
    expect(nodes.filter((n) => n.type === 'math')).toHaveLength(3); // inside, outside, and the copy of inside
    expect(nodes[0].type).toBe('section'); // copies of sections go behind everything
  });

  it('keeps sections out of groups', () => {
    const section = createNode('section', { x: 0, y: 0 }, {}, { width: 400, height: 300 });
    state().load({ nodes: [section, math(10, 60)], viewport: DEFAULT_VIEWPORT });
    expect(refreshGroups().flatMap((g) => g.nodeIds)).not.toContain(section.id);
  });

  it('moves a section and its contents together when organising', () => {
    const section = createNode('section', { x: 1000, y: 1000 }, {}, { width: 400, height: 300 });
    const inside = math(1050, 1100);
    const other = math(0, 0);
    state().load({ nodes: [section, inside, other], viewport: DEFAULT_VIEWPORT });
    const offset = { x: inside.position.x - section.position.x, y: inside.position.y - section.position.y };
    organiseCanvas();
    const moved = (id: string) => state().nodes.find((n) => n.id === id)?.position;
    const s = moved(section.id);
    const i = moved(inside.id);
    expect(s).toBeDefined();
    expect(i).toEqual({ x: (s?.x ?? 0) + offset.x, y: (s?.y ?? 0) + offset.y });
  });

  it('ungrouping removes only the box', () => {
    const section = createNode('section', { x: 0, y: 0 }, {}, { width: 400, height: 300 });
    const inside = math(50, 80);
    state().load({ nodes: [section, inside], viewport: DEFAULT_VIEWPORT });
    state().deleteNodes([section.id]);
    expect(state().nodes.map((n) => n.id)).toEqual([inside.id]);
    undo();
    expect(state().nodes).toHaveLength(2);
  });

  it('deletes a section with the nodes inside it as one undo step', () => {
    const section = createNode('section', { x: 0, y: 0 }, {}, { width: 400, height: 300 });
    const [inside, outside] = [math(50, 80), math(2000, 0)];
    state().load({ nodes: [section, inside, outside], viewport: DEFAULT_VIEWPORT });
    deleteSectionWithContents(section.id);
    expect(state().nodes.map((n) => n.id)).toEqual([outside.id]);
    undo();
    expect(state().nodes).toHaveLength(3);
  });
});
