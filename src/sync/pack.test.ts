// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { AppNode } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { DecryptError, deriveKey, newSalt } from './crypto';
import { SyncError } from './errors';
import { keepLocalImages, MAX_PIECES, packCanvas, unpackCanvas, withoutImages } from './pack';

const key = async (password = 'pw') => deriveKey(password, newSalt(), 1000);
const viewport = { x: 1, y: 2, zoom: 0.5 };

const image = (id: string, src: string): AppNode =>
  ({
    id,
    type: 'image',
    position: { x: 0, y: 0 },
    data: { src, title: 'Photo' },
    width: 40,
    height: 30,
  }) as AppNode;

/** Text that does not compress, so a canvas can be made as big as a test needs. */
const noise = (length: number) => {
  let text = '';
  while (text.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(Math.min(65_536, length - text.length)));
    text += Array.from(bytes, (b) => String.fromCharCode(33 + (b % 90))).join('');
  }
  return text;
};

describe('packCanvas', () => {
  it('round-trips a canvas', async () => {
    const k = await key();
    const text = createNode('text', { x: 10, y: 20 });
    const canvas = { name: 'Notes', content: { nodes: [text], viewport } };
    const pieces = await packCanvas(k, 'c1', 'r1', canvas);
    expect(await unpackCanvas(k, 'c1', 'r1', pieces)).toEqual({
      name: 'Notes',
      content: { nodes: [expect.objectContaining({ id: text.id, type: 'text' })], viewport },
    });
  });

  it('cuts a big canvas into pieces that each fit, and puts it back together', async () => {
    const k = await key();
    const big = createNode('text', { x: 0, y: 0 });
    (big.data as { markdown: string }).markdown = noise(150_000);
    const canvas = { name: 'Big', content: { nodes: [big], viewport } };
    const pieces = await packCanvas(k, 'c1', 'r1', canvas, 50_000);
    expect(pieces.length).toBeGreaterThan(2);
    expect(pieces.every((p) => p.length <= 50_000)).toBe(true);
    const back = await unpackCanvas(k, 'c1', 'r1', pieces);
    expect((back.content.nodes[0].data as { markdown: string }).markdown).toHaveLength(150_000);
  });

  it('refuses a canvas that would need too many bins', async () => {
    const k = await key();
    const big = createNode('text', { x: 0, y: 0 });
    (big.data as { markdown: string }).markdown = noise(30_000);
    const error = await packCanvas(
      k,
      'c1',
      'r1',
      { name: 'Big', content: { nodes: [big], viewport } },
      100,
    ).catch((e) => e);
    expect(error).toBeInstanceOf(SyncError);
    expect(error.kind).toBe('too-large');
    expect(MAX_PIECES).toBeLessThan(30_000 / 100);
  });

  it('opens only with the right password, canvas and revision', async () => {
    const canvas = { name: 'A', content: { nodes: [], viewport } };
    const salt = newSalt();
    const pieces = await packCanvas(await deriveKey('right', salt, 1000), 'c1', 'r1', canvas);
    const right = await deriveKey('right', salt, 1000);
    await expect(
      unpackCanvas(await deriveKey('wrong', salt, 1000), 'c1', 'r1', pieces),
    ).rejects.toBeInstanceOf(DecryptError);
    await expect(unpackCanvas(right, 'c2', 'r1', pieces)).rejects.toBeInstanceOf(DecryptError);
    await expect(unpackCanvas(right, 'c1', 'r2', pieces)).rejects.toBeInstanceOf(DecryptError);
  });

  it('leaves embedded pictures out of what it uploads', async () => {
    const k = await key();
    const canvas = {
      name: 'A',
      content: { nodes: [image('i1', `data:image/png;base64,${'A'.repeat(5000)}`)], viewport },
    };
    const pieces = await packCanvas(k, 'c1', 'r1', canvas);
    const back = await unpackCanvas(k, 'c1', 'r1', pieces);
    expect(back.content.nodes[0]).toMatchObject({
      id: 'i1',
      type: 'image',
      data: { src: '', title: 'Photo' },
    });
  });
});

describe('images', () => {
  it('only blanks pictures embedded in the node, not links', () => {
    const nodes = [image('a', 'data:image/png;base64,AAAA'), image('b', 'https://example.com/x.png')];
    expect(withoutImages(nodes).map((n) => (n.data as { src: string }).src)).toEqual([
      '',
      'https://example.com/x.png',
    ]);
  });

  it('gives a pulled image the picture this device already has', () => {
    const local = [image('a', 'data:image/png;base64,AAAA')];
    const pulled = [image('a', ''), image('z', '')];
    expect(keepLocalImages(pulled, local).map((n) => (n.data as { src: string }).src)).toEqual([
      'data:image/png;base64,AAAA',
      '',
    ]);
  });
});
