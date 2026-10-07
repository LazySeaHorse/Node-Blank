/// <reference lib="webworker" />
import { formatValue } from './format';

const post = (level: string, args: unknown[]) =>
  postMessage({ level, text: args.map(formatValue).join(' ') });

for (const level of ['log', 'info', 'warn', 'error'] as const) {
  console[level] = (...args: unknown[]) => post(level, args);
}

// Calling eval through a reference makes it an indirect eval: global scope, returns the last expression.
// biome-ignore lint/security/noGlobalEval: executing user code is this worker's whole purpose.
const evaluate: (source: string) => unknown = globalThis.eval;

addEventListener('message', async (event: MessageEvent<string>) => {
  try {
    const result = await evaluate(event.data);
    if (result !== undefined) post('result', [result]);
  } catch (error) {
    post('error', [error]);
  }
  postMessage({ level: 'done' });
});
