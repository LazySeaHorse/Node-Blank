import { APP_URL } from '@landing/components/Nav';
import katex from 'katex';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Sparkles,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Rational } from '@/lib/rational';
import { ToolsLayout } from './ToolsLayout';

function renderLatex(tex: string): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: false });
  } catch {
    return tex;
  }
}

function renderDisplayLatex(tex: string): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: true });
  } catch {
    return tex;
  }
}

export function rationalToLatex(r: Rational): string {
  if (r.isInteger) return `${r.num}`;
  if (r.num < 0n) return `-\\frac{${-r.num}}{${r.den}}`;
  return `\\frac{${r.num}}{${r.den}}`;
}

export interface MatrixStep {
  stepIndex: number;
  operationType: 'initial' | 'swap' | 'scale' | 'eliminate' | 'complete';
  title: string;
  latexExplanation: string;
  matrix: Rational[][];
  pivot?: { row: number; col: number };
  activeRows?: number[];
}

interface PresetSystem {
  name: string;
  description: string;
  rows: number;
  cols: number;
  data: string[][];
}

const PRESETS: PresetSystem[] = [
  {
    name: '3×4 Unique Solution',
    description: 'System of 3 equations in 3 variables with a single unique solution point.',
    rows: 3,
    cols: 4,
    data: [
      ['1', '2', '-1', '2'],
      ['2', '1', '1', '7'],
      ['1', '-1', '2', '5'],
    ],
  },
  {
    name: '3×3 Invertible Matrix',
    description: 'Linearly independent columns; reduces to the 3×3 Identity matrix I₃.',
    rows: 3,
    cols: 3,
    data: [
      ['2', '1', '1'],
      ['4', '-6', '0'],
      ['-2', '7', '2'],
    ],
  },
  {
    name: '3×4 Infinite Solutions (Free Variable)',
    description: 'Rank 2 system with a free parameter t; forms a line of solutions.',
    rows: 3,
    cols: 4,
    data: [
      ['1', '3', '-1', '4'],
      ['2', '6', '-2', '8'],
      ['1', '1', '1', '2'],
    ],
  },
  {
    name: '3×4 Inconsistent (No Solution)',
    description: 'Parallel or non-intersecting planes leading to a contradiction 0 = 1.',
    rows: 3,
    cols: 4,
    data: [
      ['1', '1', '1', '2'],
      ['2', '2', '2', '5'],
      ['1', '-2', '3', '1'],
    ],
  },
  {
    name: '2×3 Intersection Point',
    description: 'Two intersecting lines in the 2D plane.',
    rows: 2,
    cols: 3,
    data: [
      ['3', '2', '12'],
      ['1', '-1', '1'],
    ],
  },
  {
    name: '4×4 Rank Deficient',
    description: '4×4 matrix with dependent row and non-trivial null space.',
    rows: 4,
    cols: 4,
    data: [
      ['1', '2', '3', '4'],
      ['2', '4', '6', '8'],
      ['0', '1', '2', '3'],
      ['1', '0', '-1', '-2'],
    ],
  },
];

function formatMatrixAsLatex(matrix: Rational[][], isAugmented = false): string {
  const m = matrix.length;
  const n = matrix[0]?.length ?? 0;
  if (m === 0 || n === 0) return '';

  if (isAugmented && n > 1) {
    const align = `${'c'.repeat(n - 1)}|c`;
    const rows = matrix.map((row) => row.map((val) => rationalToLatex(val)).join(' & ')).join(' \\\\ \n');
    return `\\left[\\begin{array}{${align}}\n${rows}\n\\end{array}\\right]`;
  }

  const rows = matrix.map((row) => row.map((val) => rationalToLatex(val)).join(' & ')).join(' \\\\ \n');
  return `\\begin{bmatrix}\n${rows}\n\\end{bmatrix}`;
}

export function computeGaussJordanSteps(initialMatrix: Rational[][]): MatrixStep[] {
  const m = initialMatrix.length;
  const n = initialMatrix[0]?.length ?? 0;
  if (m === 0 || n === 0) return [];

  // Deep clone matrix
  const mat: Rational[][] = initialMatrix.map((row) => [...row]);
  const steps: MatrixStep[] = [];

  steps.push({
    stepIndex: 0,
    operationType: 'initial',
    title: 'Initial Matrix',
    latexExplanation: '\\text{Start with original input matrix } A',
    matrix: mat.map((row) => [...row]),
  });

  let lead = 0;
  let stepCount = 1;

  for (let r = 0; r < m; r++) {
    if (lead >= n) break;

    // Search for a non-zero pivot entry in lead column
    let i = r;
    while (i < m && mat[i][lead].isZero) {
      i++;
    }

    if (i === m) {
      // No non-zero entry in this column, move to next column and retry this row
      lead++;
      r--;
      continue;
    }

    // If pivot is not in row r, swap row i and row r
    if (i !== r) {
      const temp = mat[i];
      mat[i] = mat[r];
      mat[r] = temp;

      steps.push({
        stepIndex: stepCount++,
        operationType: 'swap',
        title: `Swap Row ${r + 1} and Row ${i + 1}`,
        latexExplanation: `R_{${r + 1}} \\leftrightarrow R_{${i + 1}} \\quad \\text{(bring non-zero pivot into row ${r + 1})}`,
        matrix: mat.map((row) => [...row]),
        pivot: { row: r, col: lead },
        activeRows: [r, i],
      });
    }

    // Scale pivot row so leading entry becomes 1
    const pivotVal = mat[r][lead];
    if (pivotVal.num !== 1n || pivotVal.den !== 1n) {
      const divisor = pivotVal;
      mat[r] = mat[r].map((val) => val.div(divisor));

      const invScale = new Rational(divisor.den, divisor.num);
      steps.push({
        stepIndex: stepCount++,
        operationType: 'scale',
        title: `Normalize Row ${r + 1}`,
        latexExplanation: `R_{${r + 1}} \\leftarrow ${rationalToLatex(invScale)} \\cdot R_{${r + 1}} \\quad \\text{(make leading pivot equal to 1)}`,
        matrix: mat.map((row) => [...row]),
        pivot: { row: r, col: lead },
        activeRows: [r],
      });
    }

    // Eliminate all other entries in column `lead` (both above and below row r)
    for (let k = 0; k < m; k++) {
      if (k !== r && !mat[k][lead].isZero) {
        const factor = mat[k][lead];
        mat[k] = mat[k].map((val, colIdx) => val.sub(factor.mul(mat[r][colIdx])));

        const negFactor = factor.neg();
        const factorLatex = rationalToLatex(negFactor);
        const signStr = negFactor.num >= 0n ? `+ ${factorLatex}` : factorLatex;

        steps.push({
          stepIndex: stepCount++,
          operationType: 'eliminate',
          title: `Eliminate Row ${k + 1}`,
          latexExplanation: `R_{${k + 1}} \\leftarrow R_{${k + 1}} ${signStr} \\cdot R_{${r + 1}} \\quad \\text{(clear entry at } (${k + 1}, ${lead + 1})\\text{)}`,
          matrix: mat.map((row) => [...row]),
          pivot: { row: r, col: lead },
          activeRows: [k, r],
        });
      }
    }

    lead++;
  }

  steps.push({
    stepIndex: stepCount,
    operationType: 'complete',
    title: 'Reduced Row Echelon Form (RREF)',
    latexExplanation: '\\text{Matrix is now in unique Reduced Row Echelon Form (RREF)}',
    matrix: mat.map((row) => [...row]),
  });

  return steps;
}

export function MatrixRrefTool({ navigate }: { navigate: (to: string) => void }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [gridValues, setGridValues] = useState<string[][]>(() => [
    ['1', '2', '-1', '2'],
    ['2', '1', '1', '7'],
    ['1', '-1', '2', '5'],
  ]);

  const [history, setHistory] = useState<string[][][]>([]);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  // Manual row operation state
  const [swapR1, setSwapR1] = useState(1);
  const [swapR2, setSwapR2] = useState(2);

  const [scaleRow, setScaleRow] = useState(1);
  const [scaleFactor, setScaleFactor] = useState('1/2');

  const [targetRow, setTargetRow] = useState(2);
  const [addFactor, setAddFactor] = useState('-2');
  const [sourceRow, setSourceRow] = useState(1);

  // Convert raw string values to Rational matrix
  const rationalMatrix = useMemo(() => {
    return gridValues.map((row) =>
      row.map((cell) => {
        const parsed = Rational.parse(cell);
        return parsed ?? Rational.ZERO;
      }),
    );
  }, [gridValues]);

  // Compute step-by-step Gauss Jordan
  const steps = useMemo(() => {
    return computeGaussJordanSteps(rationalMatrix);
  }, [rationalMatrix]);

  const rrefMatrix = steps[steps.length - 1]?.matrix ?? rationalMatrix;

  // Analysis of the matrix / linear system
  const analysis = useMemo(() => {
    const m = rrefMatrix.length;
    const n = rrefMatrix[0]?.length ?? 0;
    if (m === 0 || n === 0) return null;

    const pivotCols: number[] = [];
    const pivotRows: number[] = [];

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        if (!rrefMatrix[r][c].isZero) {
          pivotCols.push(c);
          pivotRows.push(r);
          break;
        }
      }
    }

    const rank = pivotCols.length;
    const isAugmented = n > 1;
    const isLastColAugmentedPivot = isAugmented && pivotCols.includes(n - 1);

    let systemStatus: 'consistent_unique' | 'consistent_infinite' | 'inconsistent' | 'not_system' =
      'not_system';
    if (isAugmented) {
      if (isLastColAugmentedPivot) {
        systemStatus = 'inconsistent';
      } else {
        const numVars = n - 1;
        const varPivots = pivotCols.filter((c) => c < numVars);
        if (varPivots.length === numVars) {
          systemStatus = 'consistent_unique';
        } else {
          systemStatus = 'consistent_infinite';
        }
      }
    }

    return {
      rank,
      nullity: n - (isAugmented ? 1 : 0) - (isLastColAugmentedPivot ? rank - 1 : rank),
      pivotCols,
      systemStatus,
      isAugmented,
      isSquare: m === n,
    };
  }, [rrefMatrix]);

  // Dimension Resizing
  const handleDimensionChange = (newRows: number, newCols: number) => {
    const clampedRows = Math.max(1, Math.min(6, newRows));
    const clampedCols = Math.max(1, Math.min(6, newCols));

    setHistory((prev) => [...prev, gridValues]);
    const nextGrid: string[][] = [];
    for (let r = 0; r < clampedRows; r++) {
      const row: string[] = [];
      for (let c = 0; c < clampedCols; c++) {
        row.push(gridValues[r]?.[c] ?? '0');
      }
      nextGrid.push(row);
    }
    setRows(clampedRows);
    setCols(clampedCols);
    setGridValues(nextGrid);
    setActiveStepIndex(null);
  };

  const handleCellChange = (r: number, c: number, value: string) => {
    const next = gridValues.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === r && colIdx === c ? value : cell)),
    );
    setGridValues(next);
  };

  const loadPreset = (preset: PresetSystem) => {
    setHistory((prev) => [...prev, gridValues]);
    setRows(preset.rows);
    setCols(preset.cols);
    setGridValues(preset.data.map((row) => [...row]));
    setActiveStepIndex(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setRows(prev.length);
    setCols(prev[0].length);
    setGridValues(prev);
  };

  const handleClear = () => {
    setHistory((prev) => [...prev, gridValues]);
    setGridValues(Array.from({ length: rows }, () => Array.from({ length: cols }, () => '0')));
  };

  // Manual Operations
  const applyRowSwap = () => {
    const r1 = swapR1 - 1;
    const r2 = swapR2 - 1;
    if (r1 === r2 || r1 < 0 || r1 >= rows || r2 < 0 || r2 >= rows) return;

    setHistory((prev) => [...prev, gridValues]);
    const next = gridValues.map((row) => [...row]);
    const temp = next[r1];
    next[r1] = next[r2];
    next[r2] = temp;
    setGridValues(next);
  };

  const applyRowScale = () => {
    const r = scaleRow - 1;
    const factor = Rational.parse(scaleFactor);
    if (!factor || factor.isZero || r < 0 || r >= rows) return;

    setHistory((prev) => [...prev, gridValues]);
    const next = gridValues.map((row, rowIdx) => {
      if (rowIdx !== r) return row;
      return row.map((cell) => {
        const val = Rational.parse(cell) ?? Rational.ZERO;
        return val.mul(factor).toFraction();
      });
    });
    setGridValues(next);
  };

  const applyRowAdd = () => {
    const target = targetRow - 1;
    const source = sourceRow - 1;
    const factor = Rational.parse(addFactor);
    if (!factor || target < 0 || target >= rows || source < 0 || source >= rows || target === source) return;

    setHistory((prev) => [...prev, gridValues]);
    const next = gridValues.map((row, rowIdx) => {
      if (rowIdx !== target) return row;
      return row.map((cell, cIdx) => {
        const targetVal = Rational.parse(cell) ?? Rational.ZERO;
        const sourceVal = Rational.parse(gridValues[source][cIdx]) ?? Rational.ZERO;
        return targetVal.add(factor.mul(sourceVal)).toFraction();
      });
    });
    setGridValues(next);
  };

  const copyLatex = useCallback(
    (isAugmented = true) => {
      const latex = formatMatrixAsLatex(rationalMatrix, isAugmented);
      navigator.clipboard.writeText(latex);
      setCopiedLatex(true);
      setTimeout(() => setCopiedLatex(false), 2000);
    },
    [rationalMatrix],
  );

  return (
    <ToolsLayout
      title="Matrix Row Reduction (RREF) Calculator"
      description="Interactive Gauss-Jordan elimination with exact fraction arithmetic, manual row operations, step-by-step solver, and LaTeX export."
      badge="Linear Algebra"
      activeTool="matrix-rref"
      navigate={navigate}
    >
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        {/* Preset Selector Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-line pb-4">
          <span className="text-xs font-mono font-medium text-muted uppercase mr-1">Presets:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => loadPreset(preset)}
              className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-fg hover:bg-surface-2 transition-colors cursor-pointer"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Matrix Input & Operations */}
          <div className="lg:col-span-6 space-y-6">
            {/* Matrix Input Panel */}
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 mb-5">
                <div>
                  <h2 className="text-base font-semibold text-fg flex items-center gap-2">
                    <span>Input Matrix</span>
                    <span className="font-mono text-xs text-muted font-normal">
                      ({rows}×{cols})
                    </span>
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Type exact integers, decimals, or fractions like{' '}
                    <code className="font-mono text-fg">1/3</code>,{' '}
                    <code className="font-mono text-fg">-2/5</code>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-line bg-surface-2 p-1 text-xs">
                    {[
                      [2, 2],
                      [2, 3],
                      [3, 3],
                      [3, 4],
                      [4, 4],
                      [4, 5],
                    ].map(([r, c]) => (
                      <button
                        key={`${r}x${c}`}
                        type="button"
                        onClick={() => handleDimensionChange(r, c)}
                        className={`rounded px-2 py-0.5 font-mono cursor-pointer transition-colors ${
                          rows === r && cols === c
                            ? 'bg-surface font-semibold text-fg shadow-xs'
                            : 'text-muted hover:text-fg'
                        }`}
                      >
                        {r}×{c}
                      </button>
                    ))}
                  </div>

                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUndo}
                      title="Undo last change"
                      className="p-1.5 rounded-lg border border-line text-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                    >
                      <Undo2 className="size-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClear}
                    title="Fill all with zeros"
                    className="p-1.5 rounded-lg border border-line text-muted hover:text-danger hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Matrix Grid */}
              <div className="flex justify-center py-4 overflow-x-auto">
                <div className="inline-flex items-center px-4 py-2 relative">
                  {/* Left bracket */}
                  <div className="w-2 self-stretch border-y-2 border-l-2 border-fg/70 rounded-l-md mr-3" />

                  {/* Grid cells */}
                  <div
                    className="grid gap-2.5"
                    style={{
                      gridTemplateColumns: `repeat(${cols}, minmax(56px, 72px))`,
                    }}
                  >
                    {gridValues.map((row, r) =>
                      row.map((val, c) => {
                        const isAugmentedLine = cols > 1 && c === cols - 1;
                        return (
                          <div key={`cell-${r}-${c}`} className="relative">
                            {isAugmentedLine && (
                              <div className="absolute -left-1.5 top-0 bottom-0 w-px bg-fg/20" />
                            )}
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => handleCellChange(r, c, e.target.value)}
                              aria-label={`Row ${r + 1}, Column ${c + 1}`}
                              className="w-full h-11 text-center font-mono text-sm font-semibold rounded-lg border border-line bg-canvas focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-fg"
                              placeholder="0"
                            />
                          </div>
                        );
                      }),
                    )}
                  </div>

                  {/* Right bracket */}
                  <div className="w-2 self-stretch border-y-2 border-r-2 border-fg/70 rounded-r-md ml-3" />
                </div>
              </div>

              {/* Matrix Action Buttons */}
              <div className="mt-4 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyLatex(cols > rows)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    {copiedLatex ? (
                      <>
                        <Check className="size-3.5 text-live" />
                        <span>Copied LaTeX!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-muted" />
                        <span>Copy as LaTeX</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs font-mono text-muted">
                  Rank: <strong className="text-fg">{analysis?.rank ?? 0}</strong>
                </div>
              </div>
            </div>

            {/* Manual Elementary Row Operations */}
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-semibold text-fg mb-1">Manual Elementary Row Operations</h3>
              <p className="text-xs text-muted mb-4">
                Test row transformations manually or practice for exams.
              </p>

              <div className="space-y-3.5">
                {/* 1. Row Swap */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line/80 bg-surface-2/40 p-3 text-xs">
                  <span className="font-mono font-medium text-muted w-14 shrink-0">Swap:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono">R</span>
                    <select
                      value={swapR1}
                      onChange={(e) => setSwapR1(Number(e.target.value))}
                      className="rounded border border-line bg-canvas px-2 py-1 font-mono text-xs text-fg"
                    >
                      {Array.from({ length: rows }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-muted">↔</span>
                    <span className="font-mono">R</span>
                    <select
                      value={swapR2}
                      onChange={(e) => setSwapR2(Number(e.target.value))}
                      className="rounded border border-line bg-canvas px-2 py-1 font-mono text-xs text-fg"
                    >
                      {Array.from({ length: rows }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={applyRowSwap}
                    className="ml-auto rounded-lg bg-surface border border-line px-3 py-1 font-medium text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    Apply Swap
                  </button>
                </div>

                {/* 2. Row Scale */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line/80 bg-surface-2/40 p-3 text-xs">
                  <span className="font-mono font-medium text-muted w-14 shrink-0">Scale:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono">R</span>
                    <select
                      value={scaleRow}
                      onChange={(e) => setScaleRow(Number(e.target.value))}
                      className="rounded border border-line bg-canvas px-2 py-1 font-mono text-xs text-fg"
                    >
                      {Array.from({ length: rows }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-muted">←</span>
                    <input
                      type="text"
                      value={scaleFactor}
                      onChange={(e) => setScaleFactor(e.target.value)}
                      className="w-16 rounded border border-line bg-canvas px-2 py-1 text-center font-mono text-xs text-fg"
                      placeholder="k"
                    />
                    <span className="text-muted">×</span>
                    <span className="font-mono">R{scaleRow}</span>
                  </div>
                  <button
                    type="button"
                    onClick={applyRowScale}
                    className="ml-auto rounded-lg bg-surface border border-line px-3 py-1 font-medium text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    Apply Scale
                  </button>
                </div>

                {/* 3. Row Elimination / Add */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line/80 bg-surface-2/40 p-3 text-xs">
                  <span className="font-mono font-medium text-muted w-14 shrink-0">Add/Sub:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono">R</span>
                    <select
                      value={targetRow}
                      onChange={(e) => setTargetRow(Number(e.target.value))}
                      className="rounded border border-line bg-canvas px-2 py-1 font-mono text-xs text-fg"
                    >
                      {Array.from({ length: rows }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-muted">←</span>
                    <span className="font-mono">R{targetRow} +</span>
                    <input
                      type="text"
                      value={addFactor}
                      onChange={(e) => setAddFactor(e.target.value)}
                      className="w-16 rounded border border-line bg-canvas px-2 py-1 text-center font-mono text-xs text-fg"
                      placeholder="k"
                    />
                    <span className="text-muted">×</span>
                    <span className="font-mono">R</span>
                    <select
                      value={sourceRow}
                      onChange={(e) => setSourceRow(Number(e.target.value))}
                      className="rounded border border-line bg-canvas px-2 py-1 font-mono text-xs text-fg"
                    >
                      {Array.from({ length: rows }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={applyRowAdd}
                    className="ml-auto rounded-lg bg-surface border border-line px-3 py-1 font-medium text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    Apply Add
                  </button>
                </div>
              </div>
            </div>

            {/* Context Callout: Why Spatial Canvas */}
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-accent/10 p-2 text-accent">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-fg">
                    Need to do row reduction next to your textbook problem?
                  </h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    In Node-Blank, you can drop your linear algebra PDF on the canvas, add a Math+ calculation
                    node right beside it, and graph 3D vector spaces — all without tab switching.
                  </p>
                  <a
                    href={APP_URL}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:brightness-110 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Launch Node-Blank Spatial Canvas</span>
                    <ArrowRight className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Auto-Solver & Step-by-Step Gauss-Jordan */}
          <div className="lg:col-span-6 space-y-6">
            {/* System Solution Summary Card */}
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted">
                    Solution Analysis
                  </span>
                  <h3 className="text-lg font-bold text-fg">Final RREF &amp; System State</h3>
                </div>

                {analysis?.systemStatus === 'consistent_unique' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-live/10 px-2.5 py-1 text-xs font-semibold text-live border border-live/20">
                    <CheckCircle2 className="size-3.5" />
                    Unique Solution
                  </span>
                )}
                {analysis?.systemStatus === 'consistent_infinite' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-tip/10 px-2.5 py-1 text-xs font-semibold text-tip border border-tip/20">
                    <Sparkles className="size-3.5" />
                    Infinite Solutions (Free Var)
                  </span>
                )}
                {analysis?.systemStatus === 'inconsistent' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger border border-danger/20">
                    <AlertCircle className="size-3.5" />
                    Inconsistent (No Solution)
                  </span>
                )}
              </div>

              {/* RREF Display */}
              <div className="rounded-xl border border-line bg-surface-2/40 p-4 flex flex-col items-center justify-center my-4 overflow-x-auto">
                <div
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted internal KaTeX output
                  dangerouslySetInnerHTML={{
                    __html: renderDisplayLatex(
                      `\\operatorname{RREF}(A) = ${formatMatrixAsLatex(rrefMatrix, cols > rows)}`,
                    ),
                  }}
                />
              </div>

              {/* Solved Variable Equations if Augmented */}
              {analysis?.isAugmented && analysis.systemStatus === 'consistent_unique' && (
                <div className="mt-3 rounded-lg border border-line bg-surface p-3 text-xs space-y-1">
                  <div className="font-mono text-muted uppercase text-[10px] mb-1">
                    System Solution Coordinates:
                  </div>
                  <div className="flex flex-wrap gap-4 font-mono font-semibold text-fg">
                    {Array.from({ length: cols - 1 }, (_, i) => {
                      const val = rrefMatrix[i]?.[cols - 1] ?? Rational.ZERO;
                      return (
                        <div key={i} className="inline-flex items-center gap-1">
                          <span>x_{i + 1} =</span>
                          <span className="text-accent">{val.toFraction()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {analysis?.systemStatus === 'inconsistent' && (
                <div className="mt-3 rounded-lg border border-danger/20 bg-danger/5 p-3 text-xs text-danger">
                  <strong>Contradiction Found:</strong> The bottom row yields the impossible equation{' '}
                  <code className="font-mono font-bold">0 = 1</code>. Therefore, the linear system has no
                  solution.
                </div>
              )}
            </div>

            {/* Step-by-Step Gauss-Jordan Walkthrough */}
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
                <div>
                  <h3 className="text-base font-semibold text-fg flex items-center gap-2">
                    <span>Gauss-Jordan Step-by-Step</span>
                    <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-mono font-medium text-accent">
                      {steps.length} Steps
                    </span>
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Exact fractions with no decimal rounding errors.
                  </p>
                </div>

                {/* Step navigation controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveStepIndex((prev) => (prev === null ? 0 : Math.max(0, prev - 1)))}
                    className="p-1 rounded-md border border-line hover:bg-surface-2 transition-colors cursor-pointer text-muted hover:text-fg"
                    title="Previous step"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-xs font-mono px-1.5 text-muted">
                    {activeStepIndex !== null ? `${activeStepIndex + 1}/${steps.length}` : 'All'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveStepIndex((prev) => (prev === null ? 1 : Math.min(steps.length - 1, prev + 1)))
                    }
                    className="p-1 rounded-md border border-line hover:bg-surface-2 transition-colors cursor-pointer text-muted hover:text-fg"
                    title="Next step"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  {activeStepIndex !== null && (
                    <button
                      type="button"
                      onClick={() => setActiveStepIndex(null)}
                      className="ml-1 text-[11px] font-mono text-accent hover:underline cursor-pointer"
                    >
                      Show All
                    </button>
                  )}
                </div>
              </div>

              {/* Steps timeline list */}
              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                {steps
                  .filter((_, idx) => activeStepIndex === null || activeStepIndex === idx)
                  .map((st) => (
                    <div
                      key={st.stepIndex}
                      className={`rounded-xl border p-4 transition-all ${
                        activeStepIndex === st.stepIndex
                          ? 'border-accent bg-accent/5'
                          : 'border-line bg-surface-2/30 hover:border-line/90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-fg font-mono">
                            {st.stepIndex}
                          </span>
                          <span className="text-xs font-semibold text-fg">{st.title}</span>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-line text-muted">
                          {st.operationType}
                        </span>
                      </div>

                      {/* Operation LaTeX formula */}
                      <div className="my-2.5 rounded-lg border border-line/60 bg-surface px-3 py-2 text-xs overflow-x-auto text-center">
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderLatex(st.latexExplanation),
                          }}
                        />
                      </div>

                      {/* Intermediate Matrix State */}
                      <div className="overflow-x-auto py-1 flex justify-center">
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderDisplayLatex(formatMatrixAsLatex(st.matrix, cols > rows)),
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolsLayout>
  );
}
