import type { ComputeEngine } from '@cortex-js/compute-engine';

export interface LineResult {
  /** Exact result as LaTeX. */
  value: string | null;
  /** Decimal approximation when it adds information (e.g. √2 ≈ 1.414…). */
  approx: string | null;
  error: string | null;
  /** The line defined a variable or function (`a := 2`). */
  assigned: boolean;
}

/** MathLive stores multi-line input as `\displaylines{a \\ b}`. */
export function splitLines(latex: string): string[] {
  const body = latex.trim().match(/^\\displaylines\s*\{([\s\S]*)\}$/)?.[1] ?? latex;
  return body
    .split(/\\\\/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function evaluateLine(ce: ComputeEngine, latex: string): LineResult {
  try {
    const expr = ce.parse(latex);
    if (!expr.isValid) return { value: null, approx: null, error: 'Syntax error', assigned: false };
    const result = expr.evaluate();
    const value = result.latex;
    const numeric = result.N().re;
    const approx =
      Number.isFinite(numeric) && !Number.isInteger(numeric) ? String(Number(numeric.toPrecision(10))) : null;
    return {
      value,
      approx: approx === value ? null : approx,
      error: null,
      assigned: expr.operator === 'Assign',
    };
  } catch (err) {
    return {
      value: null,
      approx: null,
      error: err instanceof Error ? err.message : 'Evaluation error',
      assigned: false,
    };
  }
}

/**
 * Evaluates Math+ documents in order inside a fresh scope, so variables flow from earlier
 * documents to later ones and nothing leaks between evaluations.
 */
export function evaluateDocuments(
  ce: ComputeEngine,
  documents: { id: string; latex: string }[],
): Record<string, LineResult[]> {
  const results: Record<string, LineResult[]> = {};
  ce.pushScope();
  try {
    for (const { id, latex } of documents)
      results[id] = splitLines(latex).map((line) => evaluateLine(ce, line));
  } finally {
    ce.popScope();
  }
  return results;
}
