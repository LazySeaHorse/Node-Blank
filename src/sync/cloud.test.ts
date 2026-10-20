// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { createNode } from '@/nodes/factory';
import { FakeBinStore } from '@/test/fakeBinStore';
import { Cloud } from './cloud';
import { SyncError } from './errors';

const ITERATIONS = 1000;
const viewport = { x: 0, y: 0, zoom: 1 };

const canvas = (name: string, text = 'hello') => {
  const node = createNode('text', { x: 0, y: 0 });
  (node.data as { markdown: string }).markdown = text;
  return { name, content: { nodes: [node], viewport } };
};

let store: FakeBinStore;
beforeEach(() => {
  store = new FakeBinStore();
});

describe('Cloud', () => {
  it('starts empty and lets the same password back in', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    expect(await cloud.readIndex()).toEqual({ canvases: {}, trash: [] });
    const again = await Cloud.connect(store, cloud.manifestId, 'pw');
    expect(await again.readIndex()).toEqual({ canvases: {}, trash: [] });
  });

  it('refuses a wrong password', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    const error = await Cloud.connect(store, cloud.manifestId, 'nope').catch((e) => e);
    expect(error).toBeInstanceOf(SyncError);
    expect(error.kind).toBe('password');
  });

  it('refuses a bin that is not a Node-Blank save', async () => {
    const id = await store.create({ hello: 'world' });
    const error = await Cloud.connect(store, id, 'pw').catch((e) => e);
    expect(error.kind).toBe('format');
  });

  it('keeps names and contents out of the store in the clear', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    await cloud.push('c1', canvas('Secret plans', 'launch codes'));
    const everything = JSON.stringify([...store.bins.values()]);
    expect(everything).not.toContain('Secret plans');
    expect(everything).not.toContain('launch codes');
  });

  it('pushes a canvas and pulls it back', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    const sent = canvas('Notes', 'remember');
    const entry = await cloud.push('c1', sent, 1234);
    expect(entry).toMatchObject({ name: 'Notes', updatedAt: 1234 });
    const other = await Cloud.connect(store, cloud.manifestId, 'pw');
    const { entry: seen, canvas: got } = await other.pull('c1');
    expect(seen.rev).toBe(entry.rev);
    expect(got?.name).toBe('Notes');
    expect(got?.content.nodes[0].id).toBe(sent.content.nodes[0].id);
  });

  it('gives each upload a new revision and deletes the bins it replaced', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    const first = await cloud.push('c1', canvas('A'));
    const second = await cloud.push('c1', canvas('A', 'changed'));
    expect(second.rev).not.toBe(first.rev);
    for (const bin of first.bins) expect(store.bins.has(bin)).toBe(false);
    // The manifest and the one canvas bin are all that is left.
    expect(store.bins.size).toBe(2);
  });

  it('keeps other canvases when one is pushed from a second device', async () => {
    const a = await Cloud.create(store, 'pw', ITERATIONS);
    const b = await Cloud.connect(store, a.manifestId, 'pw');
    await a.push('one', canvas('One'));
    await b.push('two', canvas('Two'));
    expect(Object.keys((await a.readIndex()).canvases).sort()).toEqual(['one', 'two']);
  });

  it('leaves the old copy intact when a push fails before the switch', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    const first = await cloud.push('c1', canvas('A', 'old'));
    store.failUpdate = true;
    await expect(cloud.push('c1', canvas('A', 'new'))).rejects.toBeInstanceOf(SyncError);
    store.failUpdate = false;
    expect((await cloud.readIndex()).canvases.c1.rev).toBe(first.rev);
    expect((await cloud.pull('c1')).canvas?.content.nodes[0].data).toMatchObject({ markdown: 'old' });
    // The bins the failed push made were cleared away again.
    expect(store.bins.size).toBe(2);
  });

  it('cleans up the bins it made when it gives up halfway', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    store.failCreateAfter = 1;
    await expect(cloud.push('c1', canvas('A'))).rejects.toBeInstanceOf(SyncError);
    expect(store.bins.size).toBe(1);
  });

  it('remembers old bins it could not delete and retries them on the next push', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    const first = await cloud.push('c1', canvas('A'));
    store.failRemove.add(first.bins[0]);
    const second = await cloud.push('c1', canvas('A', 'two'));
    expect(second.rev).not.toBe(first.rev);
    expect((await cloud.readIndex()).trash).toEqual(first.bins);
    store.failRemove.clear();
    await cloud.push('c1', canvas('A', 'three'));
    expect((await cloud.readIndex()).trash).toEqual([]);
    expect(store.bins.has(first.bins[0])).toBe(false);
  });

  it('says so when the cloud has no such canvas', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    const error = await cloud.pull('missing').catch((e) => e);
    expect(error.kind).toBe('not-found');
  });

  it('leaves a tombstone when a canvas is deleted, and frees its bins', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    const live = await cloud.push('c1', canvas('Secret plans'));
    const tomb = await cloud.remove('c1', 99);
    expect(tomb).toMatchObject({ name: '', updatedAt: 99, bins: [], deleted: true });
    expect(tomb.rev).not.toBe(live.rev);
    expect((await cloud.readIndex()).canvases.c1).toEqual(tomb);
    for (const bin of live.bins) expect(store.bins.has(bin)).toBe(false);
    // Only the manifest is left.
    expect(store.bins.size).toBe(1);
  });

  it('pulls a tombstone as a deletion', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    await cloud.push('c1', canvas('A'));
    await cloud.remove('c1');
    const { entry, canvas: gone } = await cloud.pull('c1');
    expect(entry.deleted).toBe(true);
    expect(gone).toBeNull();
  });

  it('lets a push bring a deleted canvas back', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    await cloud.push('c1', canvas('A'));
    await cloud.remove('c1');
    const back = await cloud.push('c1', canvas('A', 'again'));
    expect(back.deleted).toBeUndefined();
    expect((await cloud.pull('c1')).canvas?.name).toBe('A');
  });

  it('can delete a canvas the cloud never had, leaving a tombstone all the same', async () => {
    const cloud = await Cloud.create(store, 'pw', ITERATIONS);
    expect((await cloud.remove('never')).deleted).toBe(true);
  });
});
