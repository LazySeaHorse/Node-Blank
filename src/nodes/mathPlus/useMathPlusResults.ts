import { type Engine, loadEngine, useEngine } from '@/lib/math/engine';
import type { AppNode } from '@/model/types';
import { type CanvasState, useCanvasStore } from '@/store/canvasStore';
import { evaluateDocuments, type LineResult } from './evaluate';

/** Math+ nodes evaluate top-to-bottom, then left-to-right, like reading a page. */
const readingOrder = (a: AppNode, b: AppNode) => a.position.y - b.position.y || a.position.x - b.position.x;

/** A string key so components only re-render when Math+ inputs or their order change, not on every drag. */
const selectDocumentsKey = (state: CanvasState) =>
  JSON.stringify(
    state.nodes
      .filter((n) => n.type === 'mathPlus')
      .sort(readingOrder)
      .map((n) => ({ id: n.id, latex: n.data.latex as string })),
  );

let cache: { key: string; results: Record<string, LineResult[]> } | undefined;

const resultsFor = (ce: Engine['ce'], key: string) => {
  if (cache?.key !== key) cache = { key, results: evaluateDocuments(ce, JSON.parse(key)) };
  return cache.results;
};

/** Results for one Math+ node; all Math+ nodes share a single evaluation. `undefined` while the engine loads. */
export function useMathPlusResults(id: string): LineResult[] | undefined {
  const engine = useEngine();
  const key = useCanvasStore(selectDocumentsKey);
  if (!engine) return undefined;
  return resultsFor(engine.ce, key)[id] ?? [];
}

/** The results of a Math+ node, one per line, as LaTeX; lines without a result are left out. */
export async function mathPlusResultsText(id: string): Promise<string> {
  const { ce } = await loadEngine();
  const results = resultsFor(ce, selectDocumentsKey(useCanvasStore.getState()))[id] ?? [];
  return results.flatMap((r) => (r.value ? [r.value] : [])).join('\n');
}
