export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'result' | 'system';
export interface LogLine {
  level: LogLevel;
  text: string;
}

/** Scripts (including their timers) are killed after this long. */
const TIME_LIMIT_MS = 5000;

/**
 * Runs `source` in a throwaway worker, streaming console output. `onDone` fires once the top-level
 * code has finished (timers it started may still log until the time limit). Returns a function that stops it.
 */
export function runScript(source: string, onLine: (line: LogLine) => void, onDone?: () => void): () => void {
  const worker = new Worker(new URL('./sandbox.worker.ts', import.meta.url), { type: 'module' });
  let finished = false;

  const timer = setTimeout(() => {
    if (!finished) onLine({ level: 'system', text: `Stopped: still running after ${TIME_LIMIT_MS / 1000}s` });
    worker.terminate();
  }, TIME_LIMIT_MS);

  worker.onmessage = ({ data }: MessageEvent<LogLine | { level: 'done' }>) => {
    if (data.level === 'done') {
      finished = true;
      onDone?.();
    } else onLine(data);
  };
  worker.onerror = (event) => onLine({ level: 'error', text: event.message });
  worker.postMessage(source);

  return () => {
    clearTimeout(timer);
    worker.terminate();
  };
}
