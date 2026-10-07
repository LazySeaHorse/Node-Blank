import { useEngine } from '@/lib/math/engine';
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

/** Results for one Math+ node; all Math+ nodes share a single evaluation. `undefined` while the engine loads. */
export function useMathPlusResults(id: string): LineResult[] | undefined {
  const engine = useEngine();
  const key = useCanvasStore(selectDocumentsKey);
  if (!engine) return undefined;
  if (cache?.key !== key) cache = { key, results: evaluateDocuments(engine.ce, JSON.parse(key)) };
  return cache.results[id] ?? [];
}
