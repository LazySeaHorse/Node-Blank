import { SyncError } from '@/sync/errors';
import type { BinStore } from '@/sync/jsonbin';

/** A store in memory that counts what is asked of it, and can be made to refuse. */
export class FakeBinStore implements BinStore {
  bins = new Map<string, unknown>();
  failRemove = new Set<string>();
  failCreateAfter = Number.POSITIVE_INFINITY;
  failUpdate = false;
  private n = 0;
  async create(data: unknown) {
    if (this.n >= this.failCreateAfter) throw new SyncError('network', 'offline');
    const id = `bin${++this.n}`;
    this.bins.set(id, structuredClone(data));
    return id;
  }
  async read(id: string) {
    if (!this.bins.has(id)) throw new SyncError('not-found', 'gone');
    return structuredClone(this.bins.get(id));
  }
  async update(id: string, data: unknown) {
    if (this.failUpdate) throw new SyncError('network', 'offline');
    this.bins.set(id, structuredClone(data));
  }
  async remove(id: string) {
    if (this.failRemove.has(id)) throw new SyncError('other', 'nope');
    if (!this.bins.delete(id)) throw new SyncError('not-found', 'gone');
  }
}
