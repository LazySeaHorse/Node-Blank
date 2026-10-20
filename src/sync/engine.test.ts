// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNode } from '@/nodes/factory';
import * as repo from '@/persistence/canvasRepo';
import { db } from '@/persistence/db';
import { FakeBinStore } from '@/test/fakeBinStore';

let store: FakeBinStore;
vi.mock('./jsonbin', () => ({ jsonbin: () => store }));
// Few rounds of key stretching, so the tests are quick.
vi.mock('./crypto', async (original) => {
  const real = await original<typeof import('./crypto')>();
  return { ...real, KDF_ITERATIONS: 1000 };
});

const { check, connect, pull, push, reset, syncAll, useSync } = await import('./engine');
const { useSyncSettings } = await import('./settings');
const { compareAll } = await import('./status');

const text = (markdown: string) => {
  const node = createNode('text', { x: 0, y: 0 });
  (node.data as { markdown: string }).markdown = markdown;
  return { nodes: [node], viewport: { x: 0, y: 0, zoom: 1 } };
};
const markdownOf = async (id: string) =>
  ((await repo.loadContent(id)).nodes[0].data as { markdown: string }).markdown;

const statuses = async () =>
  compareAll(await repo.listCanvases(), await repo.listSyncRecords(), useSync.getState().entries ?? {});

beforeEach(async () => {
  store = new FakeBinStore();
  await Promise.all([db.canvases.clear(), db.contents.clear(), db.syncRecords.clear()]);
  reset();
  useSyncSettings.setState({ key: 'K', keyKind: 'master', manifestId: '', password: 'pw' });
  useSyncSettings.setState({
    manifestId: await connect({ key: 'K', keyKind: 'master', manifestId: '', password: 'pw' }),
  });
});

describe('sync engine', () => {
  it('needs the settings first', async () => {
    useSyncSettings.setState({ password: '' });
    await expect(check()).rejects.toThrow('Set up cloud sync');
  });

  it('refuses a wrong password', async () => {
    const { manifestId } = useSyncSettings.getState();
    await expect(
      connect({ key: 'K', keyKind: 'master', manifestId, password: 'nope' }),
    ).rejects.toMatchObject({
      kind: 'password',
    });
  });

  it('pushes a canvas, after which it is in sync', async () => {
    const id = await repo.createCanvas('Notes', text('hello'));
    await check();
    expect((await statuses()).statuses[id]).toBe('local-only');
    await push(id);
    expect((await statuses()).statuses[id]).toBe('synced');
  });

  it('notices a local edit after a push, and a cloud change after a pull', async () => {
    const id = await repo.createCanvas('Notes', text('v1'));
    await push(id);
    await new Promise((r) => setTimeout(r, 5));
    await repo.saveContent(id, text('v2'));
    expect((await statuses()).statuses[id]).toBe('local-newer');
    await push(id);

    // Another device pushes a change.
    await db.syncRecords.update(id, { rev: 'stale' });
    await check();
    expect((await statuses()).statuses[id]).toBe('cloud-newer');
    await pull(id);
    expect((await statuses()).statuses[id]).toBe('synced');
    expect(await markdownOf(id)).toBe('v2');
  });

  it('brings a canvas this device lacks, with its id', async () => {
    const id = await repo.createCanvas('Remote', text('from afar'));
    await push(id);
    await repo.deleteCanvas(id);
    await check();
    expect((await statuses()).cloudOnly.map((c) => c.id)).toEqual([id]);
    await pull(id);
    expect((await repo.getCanvas(id))?.name).toBe('Remote');
    expect(await markdownOf(id)).toBe('from afar');
  });

  it('pushes everything that is safe to, and leaves conflicts alone', async () => {
    const fresh = await repo.createCanvas('Fresh', text('new'));
    const settled = await repo.createCanvas('Settled', text('same'));
    const clash = await repo.createCanvas('Clash', text('mine'));
    await push(settled);
    await push(clash);
    await new Promise((r) => setTimeout(r, 5));
    await repo.saveContent(clash, text('mine, edited'));
    await db.syncRecords.update(clash, { rev: 'older' });

    const result = await syncAll('push');
    expect(result).toEqual({ done: 1, failed: [] });
    const { statuses: after } = await statuses();
    expect(after[fresh]).toBe('synced');
    expect(after[settled]).toBe('synced');
    expect(after[clash]).toBe('conflict');
  });

  it('pulls everything that is safe to', async () => {
    const id = await repo.createCanvas('A', text('cloud'));
    await push(id);
    await db.syncRecords.update(id, { rev: 'older' });
    await repo.saveContent(id, text('local'));
    await db.syncRecords.update(id, { localUpdatedAt: (await repo.getCanvas(id))?.updatedAt });
    const other = await repo.createCanvas('B', text('b'));
    await push(other);
    await repo.deleteCanvas(other);

    const result = await syncAll('pull');
    // A changed in the cloud only (its record is behind); B is only in the cloud.
    expect(result.done).toBe(2);
    expect(await markdownOf(id)).toBe('cloud');
    expect(await markdownOf(other)).toBe('b');
  });

  it('stops a bulk action at an error that would repeat', async () => {
    await repo.createCanvas('A', text('a'));
    await repo.createCanvas('B', text('b'));
    store.failCreateAfter = 0;
    const result = await syncAll('push');
    expect(result.done).toBe(0);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].message).toContain('offline');
  });
});
