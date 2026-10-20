import { describe, expect, it } from 'vitest';
import type { CloudEntry } from './cloud';
import { compareCanvas, pullable, pushable, type SyncRecord } from './status';

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
    expect(compareCanvas(undefined, record, remote)).toBe('cloud-only');
  });
});

describe('bulk actions', () => {
  it('push and pull only what cannot lose changes', () => {
    expect(['local-newer', 'local-only'].every((s) => pushable(s as never))).toBe(true);
    expect(['cloud-newer', 'cloud-only'].every((s) => pullable(s as never))).toBe(true);
    for (const s of ['synced', 'conflict'] as const) {
      expect(pushable(s)).toBe(false);
      expect(pullable(s)).toBe(false);
    }
  });
});
