import { TexBlock, TexInline } from '@landing/blog/BlogComponents';
import { navigate } from '@landing/router';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { MathReplTool } from './MathReplTool';
import { MatrixRrefTool } from './MatrixRrefTool';
import { SplitPdfDemoTool } from './SplitPdfDemoTool';
import type { ToolDefinition } from './types';

/* ── Tool 1: Interactive LaTeX Matrix Generator ── */
function LatexMatrixGenerator() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrixType, setMatrixType] = useState<'pmatrix' | 'bmatrix' | 'vmatrix' | 'Bmatrix'>('pmatrix');
  const [copied, setCopied] = useState(false);

  const [grid, setGrid] = useState<string[][]>(() =>
    Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => (r === c ? '1' : '0'))),
  );

  const updateCell = (r: number, c: number, val: string) => {
    setGrid((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = val;
      return copy;
    });
  };

  const latexCode =
    `\\begin{${matrixType}}\n` +
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => grid[r]?.[c] || '0').join(' & '),
    ).join(' \\\\\n') +
    `\n\\end{${matrixType}}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-muted">Dimensions:</span>
          <select
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="rounded border border-line bg-surface-2 px-2 py-1 text-fg"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} rows
              </option>
            ))}
          </select>
          <span className="text-muted">×</span>
          <select
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="rounded border border-line bg-surface-2 px-2 py-1 text-fg"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} cols
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-muted">Bracket:</span>
          <select
            value={matrixType}
            onChange={(e) => setMatrixType(e.target.value as 'pmatrix' | 'bmatrix' | 'vmatrix' | 'Bmatrix')}
            className="rounded border border-line bg-surface-2 px-2 py-1 text-fg font-mono"
          >
            <option value="pmatrix">( ) pmatrix</option>
            <option value="bmatrix">[ ] bmatrix</option>
            <option value="vmatrix">| | determinant</option>
            <option value="Bmatrix">&#123; &#125; Bmatrix</option>
          </select>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="overflow-x-auto rounded-xl border border-line bg-surface-2 p-6">
        <div
          className="grid gap-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(48px, 64px))`,
            width: 'fit-content',
          }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => (
              <input
                key={`${r}-${c}`}
                type="text"
                value={grid[r]?.[c] ?? '0'}
                onChange={(e) => updateCell(r, c, e.target.value)}
                className="h-10 text-center font-mono text-sm rounded border border-line bg-surface text-fg focus:border-accent focus:outline-none"
              />
            )),
          )}
        </div>
      </div>

      {/* Rendered Preview */}
      <div className="rounded-xl border border-line bg-surface p-6 text-center">
        <div className="text-xs font-mono text-muted uppercase tracking-wider mb-2">Live KaTeX Preview</div>
        <TexBlock math={latexCode} />
      </div>

      {/* LaTeX Code output */}
      <div className="rounded-xl border border-line bg-surface-2 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2">
          <span className="text-muted">LaTeX Syntax</span>
          <button
            type="button"
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface-2 cursor-pointer transition"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy LaTeX'}
          </button>
        </div>
        <pre className="p-4 text-fg overflow-x-auto whitespace-pre-wrap">{latexCode}</pre>
      </div>
    </div>
  );
}

/* ── Tool 2: 2x2 Eigenvalue & Characteristic Equation Calculator ── */
function EigenvalueCalculator() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(1);
  const [c, setC] = useState(2);
  const [d, setD] = useState(3);

  const tr = a + d;
  const det = a * d - b * c;
  const discriminant = tr * tr - 4 * det;

  let eigenResult = '';
  if (discriminant > 0) {
    const l1 = ((tr + Math.sqrt(discriminant)) / 2).toFixed(3);
    const l2 = ((tr - Math.sqrt(discriminant)) / 2).toFixed(3);
    eigenResult = `\\lambda_1 = ${l1}, \\quad \\lambda_2 = ${l2}`;
  } else if (discriminant === 0) {
    const l = (tr / 2).toFixed(3);
    eigenResult = `\\lambda_{1,2} = ${l} \\quad (\\text{repeated eigenvalue})`;
  } else {
    const real = (tr / 2).toFixed(3);
    const imag = (Math.sqrt(-discriminant) / 2).toFixed(3);
    eigenResult = `\\lambda_{1,2} = ${real} \\pm ${imag}i \\quad (\\text{complex conjugate})`;
  }

  const charPoly = `\\lambda^2 - (${tr})\\lambda + (${det}) = 0`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-line bg-surface">
        <label className="block text-xs font-mono text-muted mb-1">
          a (Row 1, Col 1)
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full rounded border border-line bg-surface-2 p-2 font-mono text-center text-sm text-fg mt-1"
          />
        </label>
        <label className="block text-xs font-mono text-muted mb-1">
          b (Row 1, Col 2)
          <input
            type="number"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full rounded border border-line bg-surface-2 p-2 font-mono text-center text-sm text-fg mt-1"
          />
        </label>
        <label className="block text-xs font-mono text-muted mb-1">
          c (Row 2, Col 1)
          <input
            type="number"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            className="w-full rounded border border-line bg-surface-2 p-2 font-mono text-center text-sm text-fg mt-1"
          />
        </label>
        <label className="block text-xs font-mono text-muted mb-1">
          d (Row 2, Col 2)
          <input
            type="number"
            value={d}
            onChange={(e) => setD(Number(e.target.value))}
            className="w-full rounded border border-line bg-surface-2 p-2 font-mono text-center text-sm text-fg mt-1"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-line bg-surface text-center">
          <div className="text-xs font-mono text-muted uppercase">Trace tr(A)</div>
          <div className="text-xl font-bold font-mono text-fg mt-1">{tr}</div>
        </div>
        <div className="p-4 rounded-xl border border-line bg-surface text-center">
          <div className="text-xs font-mono text-muted uppercase">Determinant det(A)</div>
          <div className="text-xl font-bold font-mono text-fg mt-1">{det}</div>
        </div>
        <div className="p-4 rounded-xl border border-line bg-surface text-center">
          <div className="text-xs font-mono text-muted uppercase">Discriminant Δ</div>
          <div className="text-xl font-bold font-mono text-fg mt-1">{discriminant}</div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-6 text-center space-y-4">
        <div>
          <span className="text-xs font-mono text-muted uppercase">Characteristic Equation</span>
          <TexBlock math={charPoly} />
        </div>
        <div>
          <span className="text-xs font-mono text-muted uppercase">Calculated Eigenvalues</span>
          <TexBlock math={eigenResult} />
        </div>
      </div>
    </div>
  );
}

/* ── Tool 3: STEM Unit & Dimension Converter ── */
function UnitConverter() {
  const [val, setVal] = useState(1);
  const [unitType, setUnitType] = useState<'pressure' | 'force' | 'energy'>('pressure');

  const conversions = {
    pressure: [
      { name: 'Pascal (Pa)', factor: 1, formula: '\\text{N/m}^2' },
      { name: 'Atmosphere (atm)', factor: 1 / 101325, formula: '101.325\\text{ kPa}' },
      { name: 'Bar', factor: 1e-5, formula: '10^5\\text{ Pa}' },
      { name: 'Pounds per sq inch (psi)', factor: 0.000145038, formula: '\\text{lbf/in}^2' },
      { name: 'Torr (mmHg)', factor: 760 / 101325, formula: '\\text{mmHg}' },
    ],
    force: [
      { name: 'Newton (N)', factor: 1, formula: '\\text{kg}\\cdot\\text{m/s}^2' },
      { name: 'Kilonewton (kN)', factor: 0.001, formula: '10^3\\text{ N}' },
      { name: 'Pound-force (lbf)', factor: 0.224809, formula: '4.448\\text{ N}' },
      { name: 'Dyne', factor: 1e5, formula: '10^{-5}\\text{ N}' },
    ],
    energy: [
      { name: 'Joule (J)', factor: 1, formula: '\\text{N}\\cdot\\text{m}' },
      { name: 'Kilowatt-hour (kWh)', factor: 2.77778e-7, formula: '3.6\\times 10^6\\text{ J}' },
      { name: 'Calorie (cal)', factor: 0.239006, formula: '4.184\\text{ J}' },
      { name: 'Electron-volt (eV)', factor: 6.242e18, formula: '1.602\\times 10^{-19}\\text{ J}' },
      { name: 'British Thermal Unit (BTU)', factor: 0.000947817, formula: '1055\\text{ J}' },
    ],
  }[unitType];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted">Physical Quantity:</span>
          <select
            value={unitType}
            onChange={(e) => setUnitType(e.target.value as 'pressure' | 'force' | 'energy')}
            className="rounded border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-fg"
          >
            <option value="pressure">Pressure / Stress (Pa)</option>
            <option value="force">Force (N)</option>
            <option value="energy">Energy / Work (J)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted">Input Base Value:</span>
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            className="w-32 rounded border border-line bg-surface-2 px-3 py-1 font-mono text-xs text-fg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {conversions.map((item) => (
          <div
            key={item.name}
            className="p-4 rounded-xl border border-line bg-surface flex justify-between items-center"
          >
            <div>
              <div className="text-xs font-medium text-fg">{item.name}</div>
              <div className="text-[11px] font-mono text-muted mt-0.5">
                <TexInline math={item.formula} />
              </div>
            </div>
            <div className="text-right font-mono text-sm font-semibold text-accent">
              {(val * item.factor).toExponential(4).replace('e+0', '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: 'matrix-rref',
    name: 'Matrix Row Reduction (RREF) Calculator',
    subtitle: 'Exact BigInt Fractions • Step-by-Step Gauss-Jordan • LaTeX Export',
    description:
      'Perform manual row operations or auto-solve with step-by-step elementary explanations. Zero decimal rounding errors, full rank analysis, and single-click LaTeX export.',
    category: 'Linear Algebra',
    keywords: ['rref calculator', 'row reduction', 'gauss jordan', 'reduced row echelon', 'matrix rref'],
    formulaNote: 'Computes exact rational transformations with BigInt fraction precision.',
    component: <MatrixRrefTool navigate={navigate} />,
  },
  {
    slug: 'split-pdf-scratchpad',
    name: 'Split-Screen PDF Problem Helper',
    subtitle: 'Side-by-Side Textbook PDF • Live Math+ Scratchpad • Dynamic Plot',
    description:
      'Experience the real STEM problem set workflow: textbook PDF problem on the left, reactive derivation and dynamic function plot on the right.',
    category: 'Calculus & Statics',
    keywords: [
      'split screen pdf',
      'homework helper',
      'stewart calculus',
      'engineering statics',
      'math scratchpad',
    ],
    formulaNote:
      'Eliminates window-switching cognitive load by placing notes directly adjacent to problem sheets.',
    component: <SplitPdfDemoTool navigate={navigate} />,
  },
  {
    slug: 'math-evaluator',
    name: 'Reactive Math REPL & Symbolic Evaluator',
    subtitle: 'Variables := • Exact Symbolic Simplification • Instant Cascades',
    description:
      'A clean multi-line mathematical scratchpad. Define variables and watch downstream formulas evaluate reactively in real time using Computer Algebra System (CAS) algorithms.',
    category: 'CAS & Scratchpad',
    keywords: ['math repl', 'cas evaluator', 'reactive math', 'symbolic calculator', 'fraction evaluator'],
    formulaNote: 'Downstream equations automatically recompute when upstream variables change.',
    component: <MathReplTool navigate={navigate} />,
  },
  {
    slug: 'latex-matrix-generator',
    name: 'LaTeX Matrix Generator',
    subtitle: 'Generate and customize LaTeX matrix syntax with live KaTeX preview.',
    description:
      'Interactively adjust matrix dimensions, fill entries, and copy clean pmatrix, bmatrix, or vmatrix LaTeX code directly into your problem set or Node-Blank canvas.',
    category: 'Linear Algebra',
    keywords: ['latex matrix', 'pmatrix', 'bmatrix', 'determinant', 'katex generator'],
    formulaNote: 'Generated matrices can be pasted directly into Math+ and Script nodes on Node-Blank.',
    component: <LatexMatrixGenerator />,
  },
  {
    slug: 'eigenvalue-calculator',
    name: '2x2 Matrix Eigenvalue & Trace Solver',
    subtitle: 'Compute characteristic polynomial, trace, determinant, and eigenvalues instantly.',
    description:
      'Explore how matrix parameters change eigenvalues, detect repeated roots or complex conjugates, and verify linear algebra derivations.',
    category: 'Linear Algebra',
    keywords: [
      'eigenvalue calculator',
      'characteristic polynomial',
      'trace',
      'determinant',
      'matrix eigenvalues',
    ],
    formulaNote: 'Characteristic equation: det(A - λI) = λ² - tr(A)λ + det(A) = 0',
    component: <EigenvalueCalculator />,
  },
  {
    slug: 'unit-converter',
    name: 'STEM Dimensional Analysis & Unit Converter',
    subtitle: 'Quickly convert between SI and Imperial units for pressure, force, and energy.',
    description:
      'Built for physics and engineering problem sets with clear dimensional formulas and high-precision scientific notation.',
    category: 'Engineering & Physics',
    keywords: [
      'unit converter',
      'dimensional analysis',
      'pascal to psi',
      'joules to btu',
      'engineering units',
    ],
    component: <UnitConverter />,
  },
];

export function getAllTools(): ToolDefinition[] {
  return TOOLS;
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
