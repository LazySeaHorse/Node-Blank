import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_VIEWPORT } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { getCanvasContent, redo, undo, useCanvasStore } from './canvasStore';

const state = () => useCanvasStore.getState();

beforeEach(() => {
  vi.useFakeTimers();
  state().load({ nodes: [], viewport: DEFAULT_VIEWPORT });
});
afterEach(() => vi.useRealTimers());

/** Lets the history debounce window elapse so the next edit becomes its own undo step. */
const settle = () => vi.advanceTimersByTime(1000);

describe('canvasStore', () => {
  it('adds nodes selected and deselects the rest', () => {
    const a = createNode('math', { x: 0, y: 0 });
    const b = createNode('math', { x: 0, y: 0 });
    state().addNodes([a]);
    state().addNodes([b]);
    expect(state().nodes.map((n) => [n.id, n.selected])).toEqual([
      [a.id, false],
      [b.id, true],
    ]);
  });

  it('updates node data immutably', () => {
    const node = createNode('math', { x: 0, y: 0 });
    state().addNodes([node]);
    const before = state().nodes[0];
    state().updateNodeData<'math'>(node.id, { latex: 'y' });
    expect(state().nodes[0].data).toEqual({ latex: 'y' });
    expect(before.data).toEqual({ latex: '' });
  });

  it('duplicates the selection with an offset', () => {
    state().addNodes([createNode('text', { x: 10, y: 10 })]);
    state().duplicateSelected();
    expect(state().nodes).toHaveLength(2);
    expect(state().nodes[1].position).toEqual({ x: 40, y: 40 });
    expect(state().nodes[1].selected).toBe(true);
    expect(state().nodes[0].selected).toBe(false);
  });

  it('undoes and redoes content changes', () => {
    const node = createNode('math', { x: 0, y: 0 });
    state().addNodes([node]);
    settle();
    state().updateNodeData<'math'>(node.id, { latex: 'a' });
    settle();
    undo();
    expect(state().nodes[0].data).toEqual({ latex: '' });
    undo();
    expect(state().nodes).toHaveLength(0);
    redo();
    redo();
    expect(state().nodes[0].data).toEqual({ latex: 'a' });
  });

  it('coalesces rapid edits into one undo step', () => {
    const node = createNode('math', { x: 0, y: 0 });
    state().addNodes([node]);
    settle();
    for (const latex of ['a', 'ab', 'abc']) state().updateNodeData<'math'>(node.id, { latex });
    settle();
    undo();
    expect(state().nodes[0].data).toEqual({ latex: '' });
  });

  it('does not record selection-only changes', () => {
    const node = createNode('math', { x: 0, y: 0 });
    state().addNodes([node]);
    settle();
    const pastLength = useCanvasStore.temporal.getState().pastStates.length;
    state().onNodesChange([{ type: 'select', id: node.id, selected: false }]);
    settle();
    expect(useCanvasStore.temporal.getState().pastStates.length).toBe(pastLength);
  });

  it('load replaces content and clears history', () => {
    state().addNodes([createNode('math', { x: 0, y: 0 })]);
    state().load({ nodes: [], viewport: { x: 1, y: 2, zoom: 3 } });
    expect(useCanvasStore.temporal.getState().pastStates).toHaveLength(0);
    expect(getCanvasContent()).toEqual({ nodes: [], viewport: { x: 1, y: 2, zoom: 3 } });
  });

  it('exports content without transient fields', () => {
    state().addNodes([createNode('math', { x: 0, y: 0 })]);
    expect(getCanvasContent().nodes[0]).not.toHaveProperty('selected');
  });
});
