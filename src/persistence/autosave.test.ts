import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAutosave } from './autosave';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('createAutosave', () => {
  it('saves once after changes settle', () => {
    const save = vi.fn(async () => {});
    const autosave = createAutosave(save, 100);
    autosave.schedule();
    vi.advanceTimersByTime(50);
    autosave.schedule();
    vi.advanceTimersByTime(99);
    expect(save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('flushes immediately and only when dirty', async () => {
    const save = vi.fn(async () => {});
    const autosave = createAutosave(save, 100);
    await autosave.flush();
    expect(save).not.toHaveBeenCalled();
    autosave.schedule();
    await autosave.flush();
    expect(save).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(200);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('cancel drops pending changes', () => {
    const save = vi.fn(async () => {});
    const autosave = createAutosave(save, 100);
    autosave.schedule();
    autosave.cancel();
    vi.advanceTimersByTime(200);
    expect(save).not.toHaveBeenCalled();
  });
});
