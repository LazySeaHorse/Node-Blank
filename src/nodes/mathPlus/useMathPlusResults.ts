import { type Engine, loadEngine, useEngine } from '@/lib/math/engine';
import type { AppNode } from '@/model/types';
import { type CanvasState, useCanvasStore } from '@/store/canvasStore';
import { type Evaluation, evaluateLinked, type LineResult, type LinkInput } from './evaluate';
import { linkVarName, type MathLink } from './order';

/** Math+ nodes evaluate top-to-bottom, then left-to-right, like reading a page. */
const readingOrder = (a: AppNode, b: AppNode) => a.position.y - b.position.y || a.position.x - b.position.x;

/** Everything evaluation depends on: the Math+ nodes' formulas in reading order, and the links between them. */
interface MathPlusInput {
  docs: { id: string; latex: string }[];
  links: MathLink[];
}

/**
 * Only Math+ to Math+ links count, and only the name a label gives (not its text), so styling a link or
 * rewording its label never re-evaluates anything.
 */
function mathPlusInput(state: Pick<CanvasState, 'nodes' | 'edges'>): MathPlusInput {
  const docs = state.nodes
    .filter((n) => n.type === 'mathPlus')
    .sort(readingOrder)
    .map((n) => ({ id: n.id, latex: n.data.latex as string }));
  const ids = new Set(docs.map((d) => d.id));
  const links = state.edges
    .filter((e) => e.source !== e.target && ids.has(e.source) && ids.has(e.target))
    // In the canvas's own (creation) order, which is also the order chips are shown in.
    .map((e) => ({ id: e.id, source: e.source, target: e.target, name: linkVarName(e.data?.label) }));
  return { docs, links };
}

/** A string key so components only re-render when Math+ inputs, links or their order change, not on every drag. */
const selectKey = (state: CanvasState) => JSON.stringify(mathPlusInput(state));

let cache: { key: string; evaluation: Evaluation } | undefined;

function evaluationFor(ce: Engine['ce'], key: string): Evaluation {
  if (cache?.key !== key) {
    const { docs, links } = JSON.parse(key) as MathPlusInput;
    cache = { key, evaluation: evaluateLinked(ce, docs, links) };
  }
  return cache.evaluation;
}

/**
 * Results and link inputs of every Math+ node in the given canvas state. They share variables and links, so all
 * are evaluated together, once per distinct state of the Math+ part of the canvas.
 */
export const mathPlusEvaluation = (
  ce: Engine['ce'],
  state: Pick<CanvasState, 'nodes' | 'edges'>,
): Evaluation => evaluationFor(ce, JSON.stringify(mathPlusInput(state)));

/** The evaluation of the open canvas; `undefined` while the engine loads. */
function useEvaluation(): Evaluation | undefined {
  const engine = useEngine();
  const key = useCanvasStore(selectKey);
  return engine ? evaluationFor(engine.ce, key) : undefined;
}

/** Results for one Math+ node; all Math+ nodes share a single evaluation. `undefined` while the engine loads. */
export function useMathPlusResults(id: string): LineResult[] | undefined {
  const evaluation = useEvaluation();
  return evaluation ? (evaluation.lines[id] ?? []) : undefined;
}

/** The links feeding one Math+ node, with the value each brings or why it brings none. */
export function useMathPlusInputs(id: string): LinkInput[] {
  return useEvaluation()?.inputs[id] ?? [];
}

/** The results of a Math+ node, one per line, as LaTeX; lines without a result are left out. */
export async function mathPlusResultsText(id: string): Promise<string> {
  const { ce } = await loadEngine();
  const results = mathPlusEvaluation(ce, useCanvasStore.getState()).lines[id] ?? [];
  return results.flatMap((r) => (r.value ? [r.value] : [])).join('\n');
}
