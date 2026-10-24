import { describe, expect, it } from 'vitest';
import { createNode } from '@/nodes/factory';
import {
  cloneGraph,
  closesMathPlusLoop,
  findLink,
  internalEdges,
  linkDataSchema,
  normaliseLinkData,
  sanitizeEdges,
  stripEdge,
} from './links';

const e = (id: string, source: string, target: string, data?: object) => ({
  id,
  source,
  target,
  ...(data ? { data } : {}),
});

describe('links', () => {
  it('strips runtime fields and default look', () => {
    expect(
      stripEdge({
        id: 'x',
        source: 'a',
        target: 'b',
        selected: true,
        data: { head: 'arrow', tail: 'none', dashed: false },
      }),
    ).toEqual(e('x', 'a', 'b'));
    expect(stripEdge({ id: 'x', source: 'a', target: 'b', data: { label: 'k', head: 'dot' } })).toEqual(
      e('x', 'a', 'b', { label: 'k', head: 'dot' }),
    );
  });

  it('normalises data to its non-default fields', () => {
    expect(normaliseLinkData({ label: '', color: 'blue', dashed: true, tail: 'bar' })).toEqual({
      color: 'blue',
      dashed: true,
      tail: 'bar',
    });
    expect(normaliseLinkData({})).toBeUndefined();
  });

  it('drops dangling and self links but keeps duplicates', () => {
    const edges = [
      e('1', 'a', 'b'),
      e('2', 'a', 'a'),
      e('3', 'a', 'zzz'),
      e('4', 'a', 'b'),
      e('5', 'b', 'a'),
    ];
    expect(sanitizeEdges(edges, ['a', 'b']).map((x) => x.id)).toEqual(['1', '4', '5']);
  });

  it('keeps links with both ends inside a set', () => {
    const edges = [e('1', 'a', 'b'), e('2', 'b', 'c')];
    expect(internalEdges(edges, new Set(['a', 'b'])).map((x) => x.id)).toEqual(['1']);
  });

  it('finds a link only in the same direction', () => {
    const edges = [e('1', 'a', 'b')];
    expect(findLink(edges, 'a', 'b')?.id).toBe('1');
    expect(findLink(edges, 'b', 'a')).toBeUndefined();
  });

  it('clones a graph with fresh ids and remapped internal links', () => {
    const [a, b, c] = [0, 1, 2].map((x) => createNode('math', { x: x * 100, y: 0 }));
    const edges = [e('1', a.id, b.id, { label: 'k' }), e('2', b.id, c.id)];
    const copy = cloneGraph([a, b], edges, { x: 10, y: 20 });
    expect(copy.nodes.map((n) => n.position)).toEqual([
      { x: 10, y: 20 },
      { x: 110, y: 20 },
    ]);
    expect(copy.edges).toHaveLength(1);
    expect(copy.edges[0]).toMatchObject({
      source: copy.nodes[0].id,
      target: copy.nodes[1].id,
      data: { label: 'k' },
    });
    expect(copy.edges[0].id).not.toBe('1');
  });

  it('rejects a bad link end', () => {
    expect(linkDataSchema.safeParse({ head: 'star' }).success).toBe(false);
    expect(linkDataSchema.safeParse({ head: 'bar', color: 'blue' }).success).toBe(true);
  });
});

describe('closesMathPlusLoop', () => {
  const [a, b, c] = ['mathPlus', 'mathPlus', 'mathPlus'].map((t, i) =>
    createNode(t as 'mathPlus', { x: i * 100, y: 0 }),
  );
  const text = createNode('text', { x: 0, y: 0 });
  const chain = [e('1', a.id, b.id), e('2', b.id, c.id)];

  it('sees a loop through other Math+ nodes', () => {
    expect(closesMathPlusLoop([a, b, c], chain, c.id, a.id)).toBe(true);
    expect(closesMathPlusLoop([a, b, c], chain, b.id, a.id)).toBe(true);
  });

  it('does not call a forward link or an unrelated one a loop', () => {
    expect(closesMathPlusLoop([a, b, c], chain, a.id, c.id)).toBe(false);
    expect(closesMathPlusLoop([a, b, c], [], b.id, a.id)).toBe(false);
  });

  it('ignores links that touch other kinds of node', () => {
    const through = [e('1', a.id, text.id), e('2', text.id, b.id)];
    expect(closesMathPlusLoop([a, b, text], through, b.id, a.id)).toBe(false);
    expect(closesMathPlusLoop([a, text], [e('1', a.id, text.id)], text.id, a.id)).toBe(false);
  });
});
