import { describe, expect, it } from 'vitest';
import { linkVarName, orderDocuments } from './order';

const link = (id: string, source: string, target: string) => ({ id, source, target });

describe('orderDocuments', () => {
  it('keeps reading order without links', () => {
    expect(orderDocuments(['a', 'b', 'c'], [])).toEqual({ order: ['a', 'b', 'c'], broken: new Set() });
  });

  it('pulls a source that sits below its target ahead of it', () => {
    expect(orderDocuments(['a', 'b', 'c'], [link('l', 'c', 'a')]).order).toEqual(['b', 'c', 'a']);
  });

  it('takes the earliest ready node each time', () => {
    const { order } = orderDocuments(['a', 'b', 'c', 'd'], [link('1', 'd', 'a'), link('2', 'c', 'b')]);
    expect(order).toEqual(['c', 'b', 'd', 'a']);
  });

  it('handles chains and several sources', () => {
    const links = [link('1', 'd', 'c'), link('2', 'c', 'b'), link('3', 'b', 'a')];
    expect(orderDocuments(['a', 'b', 'c', 'd'], links).order).toEqual(['d', 'c', 'b', 'a']);
    expect(orderDocuments(['a', 'b', 'c'], [link('1', 'b', 'a'), link('2', 'c', 'a')]).order).toEqual([
      'b',
      'c',
      'a',
    ]);
  });

  it('opens a loop at the earliest node in reading order, breaking the link into it', () => {
    const { order, broken } = orderDocuments(['a', 'b'], [link('ab', 'a', 'b'), link('ba', 'b', 'a')]);
    expect(order).toEqual(['a', 'b']);
    expect([...broken]).toEqual(['ba']);
  });

  it('breaks only links from nodes not yet evaluated, in a longer loop', () => {
    const links = [link('ab', 'a', 'b'), link('bc', 'b', 'c'), link('ca', 'c', 'a'), link('xa', 'x', 'a')];
    const { order, broken } = orderDocuments(['a', 'b', 'c', 'x'], links);
    // x has no inputs, so it goes first; then the loop a -> b -> c -> a opens at a.
    expect(order).toEqual(['x', 'a', 'b', 'c']);
    expect([...broken]).toEqual(['ca']);
  });

  it('ignores self links and links to unknown nodes', () => {
    expect(orderDocuments(['a', 'b'], [link('1', 'a', 'a'), link('2', 'zzz', 'a')])).toEqual({
      order: ['a', 'b'],
      broken: new Set(),
    });
  });
});

describe('linkVarName', () => {
  it('uses a single latin letter, with or without dollar signs', () => {
    expect(linkVarName('k')).toBe('k');
    expect(linkVarName('$k$')).toBe('k');
    expect(linkVarName(' $ T $ ')).toBe('T');
  });

  it('falls back to ans', () => {
    for (const label of [undefined, '', 'rate', 'e', '$i$', 'ab', '$\\alpha$', '1', 'k k'])
      expect(linkVarName(label)).toBe('ans');
  });
});
