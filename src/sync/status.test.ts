import { describe, expect, it } from 'vitest';
import type { CloudEntry } from './cloud';
import { compareAll, compareCanvas, pullable, pushable, type SyncRecord } from './status';

const local = { id: 'a', name: 'A', updatedAt: 100 };
const remote: CloudEntry = { name: 'A', updatedAt: 90, rev: 'r1', bins: ['b'] };
const record: SyncRecord = { id: 'a', rev: 'r1', localUpdatedAt: 100 };

describe('compareCanvas', () => {
  it('is synced when neither side moved since the last sync', () => {
    expect(compareCanvas(local, record, remote)).toBe('synced');
  });

  it('is local-newer when only this device changed', () => {
    expect(compareCanvas({ ...local, updatedAt: 150 }, record, remote)).toBe('local-newer');
  });

  it('is cloud-newer when only the cloud changed', () => {
    expect(compareCanvas(local, record, { ...remote, rev: 'r2' })).toBe('cloud-newer');
  });

  it('is a conflict when both changed', () => {
    expect(compareCanvas({ ...local, updatedAt: 150 }, record, { ...remote, rev: 'r2' })).toBe('conflict');
  });

  it('is a conflict when both have it but this device never synced it', () => {
    expect(compareCanvas(local, undefined, remote)).toBe('conflict');
  });

  it('is local-only when the cloud lacks it, even if it was synced once', () => {
    expect(compareCanvas(local, undefined, undefined)).toBe('local-only');
    expect(compareCanvas(local, record, undefined)).toBe('local-only');
  });

  it('is cloud-only when this device lacks it', () => {
    expect(compareCanvas(undefined, undefined, remote)).toBe('cloud-only');
    expect(compareCanvas(undefined, { ...record, rev: 'older' }, remote)).toBe('cloud-only');
  });
});

describe('deletions', () => {
  const tomb: CloudEntry = { name: '', updatedAt: 95, rev: 'r2', bins: [], deleted: true };

  it('is deleted-here when the canvas is gone and the cloud still has the version last synced', () => {
    expect(compareCanvas(undefined, record, remote)).toBe('deleted-here');
  });

  it('is cloud-only, not deleted-here, if the cloud copy moved on after the deletion', () => {
    expect(compareCanvas(undefined, record, { ...remote, rev: 'r9' })).toBe('cloud-only');
  });

  it('is deleted-in-cloud when the cloud deleted it and it is unchanged here', () => {
    expect(compareCanvas(local, record, tomb)).toBe('deleted-in-cloud');
  });

  it('is a conflict when it was changed here and deleted in the cloud', () => {
    expect(compareCanvas({ ...local, updatedAt: 150 }, record, tomb)).toBe('conflict');
  });

  it('is gone when both sides deleted it', () => {
    expect(compareCanvas(undefined, record, tomb)).toBe('gone');
    expect(compareCanvas(undefined, undefined, tomb)).toBe('gone');
  });

  it('lists canvases deleted here apart from those never pulled, and hides tombstones', () => {
    const entry = (rev: string, updatedAt: number, deleted?: boolean): CloudEntry => ({
      name: rev,
      updatedAt,
      rev,
      bins: deleted ? [] : ['b'],
      deleted,
    });
    const result = compareAll([], [{ id: 'd', rev: 'd1', localUpdatedAt: 1 }], {
      d: entry('d1', 5),
      n: entry('n', 6),
      t: entry('t', 7, true),
    });
    expect(result.deletedHere.map((c) => c.id)).toEqual(['d']);
    expect(result.cloudOnly.map((c) => c.id)).toEqual(['n']);
  });
});

describe('bulk actions', () => {
  it('push and pull only what cannot lose changes', () => {
    expect(['local-newer', 'local-only', 'deleted-here'].every((s) => pushable(s as never))).toBe(true);
    expect(['cloud-newer', 'cloud-only', 'deleted-in-cloud'].every((s) => pullable(s as never))).toBe(true);
    for (const s of ['synced', 'conflict', 'gone'] as const) {
      expect(pushable(s)).toBe(false);
      expect(pullable(s)).toBe(false);
    }
  });
});

describe('compareAll', () => {
  it('lists each local canvas and the cloud copies this device lacks, newest first', () => {
    const entry = (rev: string, updatedAt: number): CloudEntry => ({
      name: rev,
      updatedAt,
      rev,
      bins: ['b'],
    });
    const result = compareAll([local, { id: 'b', name: 'B', updatedAt: 5 }], [record], {
      a: remote,
      x: entry('x', 1),
      y: entry('y', 9),
    });
    expect(result.statuses).toEqual({ a: 'synced', b: 'local-only' });
    expect(result.deletedHere).toEqual([]);
    expect(result.cloudOnly.map((c) => c.id)).toEqual(['y', 'x']);
  });
});
