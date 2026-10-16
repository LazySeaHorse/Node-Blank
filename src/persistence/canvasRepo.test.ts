import { beforeEach, describe, expect, it } from 'vitest';
import { createNode } from '@/nodes/factory';
import {
  createCanvas,
  deleteCanvas,
  getCanvas,
  listCanvases,
  loadContent,
  renameCanvas,
  saveContent,
} from './canvasRepo';
import { db } from './db';

beforeEach(async () => {
  await db.canvases.clear();
  await db.contents.clear();
});

describe('canvasRepo', () => {
  it('creates an empty canvas', async () => {
    const id = await createCanvas('First');
    expect(await getCanvas(id)).toMatchObject({ id, name: 'First' });
    expect(await loadContent(id)).toEqual({ nodes: [], viewport: { x: 0, y: 0, zoom: 1 } });
  });

  it('saves and loads content, bumping updatedAt', async () => {
    const id = await createCanvas('A');
    const before = (await getCanvas(id))?.updatedAt ?? 0;
    await new Promise((r) => setTimeout(r, 5));
    const content = {
      nodes: [createNode('math', { x: 1, y: 2 }, { latex: 'x' })],
      viewport: { x: 5, y: 6, zoom: 2 },
    };
    await saveContent(id, content);
    expect(await loadContent(id)).toEqual(content);
    expect((await getCanvas(id))?.updatedAt).toBeGreaterThan(before);
  });

  it('repairs nested displaylines in saved math nodes as they load', async () => {
    const node = createNode(
      'mathPlus',
      { x: 0, y: 0 },
      { latex: '\\displaylines{a\\\\ \\displaylines{b\\\\ c}}' },
    );
    const id = await createCanvas('Old', { nodes: [node], viewport: { x: 0, y: 0, zoom: 1 } });
    expect((await loadContent(id)).nodes[0].data).toEqual({ latex: '\\displaylines{a\\\\ b\\\\ c}' });
  });

  it('lists most recently updated first', async () => {
    const a = await createCanvas('A');
    await new Promise((r) => setTimeout(r, 5));
    await createCanvas('B');
    await new Promise((r) => setTimeout(r, 5));
    await saveContent(a, { nodes: [], viewport: { x: 0, y: 0, zoom: 1 } });
    expect((await listCanvases()).map((c) => c.name)).toEqual(['A', 'B']);
  });

  it('renames and deletes', async () => {
    const id = await createCanvas('Old');
    await renameCanvas(id, 'New');
    expect((await getCanvas(id))?.name).toBe('New');
    await deleteCanvas(id);
    expect(await getCanvas(id)).toBeUndefined();
    expect(await db.contents.get(id)).toBeUndefined();
  });
});
