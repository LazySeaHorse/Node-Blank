import type { Engine } from '@/lib/math/engine';

export type PlotFn = (x: number) => number;

/** Compiles LaTeX such as `x^2`, `y = \sin x` or `f(x) = 1/x` into a plottable function of x. */
export function compileFunction({ ce, compile }: Engine, latex: string): PlotFn | null {
  const body = latex.replace(/^\s*(?:y|f\s*\(\s*x\s*\))\s*=/, '').trim();
  if (!body) return null;
  try {
    const expr = ce.parse(body);
    if (!expr.isValid) return null;
    const compiled = compile(expr);
    if (!compiled.success) return null;
    return (x) => {
      const y = compiled.run({ x });
      return typeof y === 'number' ? y : Number.NaN;
    };
  } catch {
    return null;
  }
}
