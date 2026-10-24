import { ComputeEngine } from '@cortex-js/compute-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_VIEWPORT } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { useCanvasStore } from '@/store/canvasStore';
import { mathPlusEvaluation } from './useMathPlusResults';

const ce = new ComputeEngine();
const state = () => useCanvasStore.getState();
const evaluation = () => mathPlusEvaluation(ce, state());

let a: string;
let b: string;
let link: string;

beforeEach(() => {
  const [first, second] = [
    createNode('mathPlus', { x: 0, y: 0 }, { latex: '2+3' }),
    createNode('mathPlus', { x: 400, y: 0 }, { latex: 'k*2+1' }),
  ];
  state().load({ nodes: [first, second], viewport: DEFAULT_VIEWPORT });
  [a, b] = [first.id, second.id];
  link = state().linkNodes(a, b, { label: 'k' }) as string;
});

describe('mathPlusEvaluation', () => {
  it('feeds the link into its target', () => {
    expect(evaluation().lines[b][0].value).toBe('11');
    expect(evaluation().inputs[b][0]).toMatchObject({ name: 'k', value: '5', sourceId: a });
  });

  it('is reused while only visual things about links change', () => {
    const before = evaluation();
    state().updateEdgeData(link, { color: 'blue', dashed: true, head: 'dot', tail: 'bar' });
    state().reverseEdge(link);
    state().reverseEdge(link);
    expect(evaluation()).toBe(before);
  });

  it('is reused when a label changes without changing its name', () => {
    state().updateEdgeData(link, { label: '$k$' });
    const before = evaluation();
    state().updateEdgeData(link, { label: ' k ' });
    expect(evaluation()).toBe(before);
    state().updateEdgeData(link, { label: 'rate' });
    state().updateEdgeData(link, { label: 'speed' });
    const unnamed = evaluation();
    state().updateEdgeData(link, { label: 'pace' });
    expect(evaluation()).toBe(unnamed);
  });

  it('is recomputed when the name, a formula or the link itself changes', () => {
    const before = evaluation();
    state().updateEdgeData(link, { label: 'ans' });
    const renamed = evaluation();
    expect(renamed).not.toBe(before);
    // The formula still reads k, which nothing brings now.
    expect(renamed.lines[b][0].value).toBe('2k+1');
    expect(renamed.inputs[b][0]).toMatchObject({ name: 'ans', used: false });
    state().updateNodeData<'mathPlus'>(a, { latex: '4' });
    expect(evaluation()).not.toBe(renamed);
    state().deleteElements([], [link]);
    expect(evaluation().inputs[b]).toEqual([]);
  });

  it('ignores links that touch other kinds of node', () => {
    const text = createNode('text', { x: 0, y: 300 });
    state().addNodes([text]);
    const before = evaluation();
    state().linkNodes(text.id, b, { label: 'k' });
    state().linkNodes(a, text.id);
    expect(evaluation()).toBe(before);
  });
});
