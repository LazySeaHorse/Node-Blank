/**
 * Debounced saver: `schedule()` on every change, `flush()` when the save must happen now
 * (switching canvases, closing the tab).
 */
export function createAutosave(save: () => Promise<void>, delayMs = 500) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dirty = false;

  const flush = async () => {
    clearTimeout(timer);
    if (!dirty) return;
    dirty = false;
    await save();
  };

  return {
    schedule() {
      dirty = true;
      clearTimeout(timer);
      timer = setTimeout(flush, delayMs);
    },
    flush,
    /** Drops pending changes without saving. */
    cancel() {
      dirty = false;
      clearTimeout(timer);
    },
  };
}
