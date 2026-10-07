import { describe, expect, it } from 'vitest';
import { cloneNodes, createNode, searchTextOf, stripTransient } from './factory';

describe('createNode', () => {
  it('fills defaults and spec size', () => {
    const node = createNode('graph', { x: 1, y: 2 });
    expect(node).toMatchObject({ type: 'graph', position: { x: 1, y: 2 }, width: 380, height: 360 });
    expect(node.data).toEqual({ functions: ['x^2'] });
  });

  it('merges provided data over defaults', () => {
    const node = createNode('math', { x: 0, y: 0 }, { latex: 'x' });
    expect(node.data).toEqual({ latex: 'x' });
    expect(node.width).toBeUndefined();
  });

  it('generates unique ids', () => {
    expect(createNode('math', { x: 0, y: 0 }).id).not.toBe(createNode('math', { x: 0, y: 0 }).id);
  });
});

describe('cloneNodes', () => {
  it('re-ids, offsets, and deep-copies data', () => {
    const original = createNode('table', { x: 10, y: 10 });
    const [copy] = cloneNodes([{ ...original, selected: true }], { x: 5, y: 5 });
    expect(copy.id).not.toBe(original.id);
    expect(copy.position).toEqual({ x: 15, y: 15 });
    expect(copy.data).toEqual(original.data);
    expect(copy.data).not.toBe(original.data);
    expect(copy.selected).toBeUndefined();
  });
});

describe('stripTransient', () => {
  it('keeps only persisted fields', () => {
    const node = {
      ...createNode('image', { x: 0, y: 0 }),
      selected: true,
      dragging: true,
      measured: { width: 1 },
    };
    expect(Object.keys(stripTransient(node)).sort()).toEqual([
      'data',
      'height',
      'id',
      'position',
      'type',
      'width',
    ]);
  });
});

describe('searchTextOf', () => {
  it('uses the kind-specific extractor', () => {
    expect(searchTextOf(createNode('sheet', { x: 0, y: 0 }, { cells: [['a', 'b']] }))).toBe('a b');
  });
});
