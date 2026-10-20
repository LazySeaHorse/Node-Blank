import { APP_URL } from '@landing/components/Nav';
import katex from 'katex';
import { ArrowRight, Check, Code2, Copy, Layers, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEngine } from '@/lib/math/engine';
import { ToolsLayout } from './ToolsLayout';

function renderLatex(tex: string): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: false });
  } catch {
    return tex;
  }
}

interface ReplLine {
  id: string;
  raw: string;
}

interface EvaluatedLine {
  id: string;
  raw: string;
  latexValue: string | null;
  approx: string | null;
  error: string | null;
  isAssignment: boolean;
  assignedVar?: string;
}

interface ReplPreset {
  name: string;
  description: string;
  lines: string[];
}

const PRESETS: ReplPreset[] = [
  {
    name: 'Right Triangle & Vectors',
    description: 'Pythagorean hypotenuse and vector angle.',
    lines: [
      'a := 12',
      'b := 5',
      'c := \\sqrt{a^2 + b^2}',
      '\\text{area} := \\frac{1}{2} \\cdot a \\cdot b',
      '\\sin(\\theta) := \\frac{b}{c}',
    ],
  },
  {
    name: 'Quadratic Formula & Roots',
    description: 'Exact roots of a quadratic polynomial.',
    lines: [
      'A := 2',
      'B := -7',
      'C := 3',
      'D := \\sqrt{B^2 - 4 \\cdot A \\cdot C}',
      'x_1 := \\frac{-B + D}{2 \\cdot A}',
      'x_2 := \\frac{-B - D}{2 \\cdot A}',
    ],
  },
  {
    name: 'Physics: Kinematics & Energy',
    description: 'Trajectory motion, kinetic energy and velocity.',
    lines: [
      'm := 4',
      'v_0 := 15',
      'g := 9.81',
      't := 2',
      'v := v_0 - g \\cdot t',
      'E_k := \\frac{1}{2} \\cdot m \\cdot v^2',
    ],
  },
  {
    name: 'Exact Fractions & Powers',
    description: 'Fractions simplified without decimal rounding errors.',
    lines: [
      '\\frac{2}{3} + \\frac{5}{6}',
      '\\frac{7}{12} \\cdot \\frac{4}{21}',
      '\\left(\\frac{3}{2}\\right)^3',
      '\\sqrt{50} + \\sqrt{18}',
    ],
  },
  {
    name: 'Geometry: Cone Volume',
    description: 'Volume and surface area of a 3D cone.',
    lines: [
      'r := 4',
      'h := 9',
      'V := \\frac{1}{3} \\cdot \\pi \\cdot r^2 \\cdot h',
      's := \\sqrt{r^2 + h^2}',
    ],
  },
];

const SYMBOLS = [
  { label: ':=', insert: ' := ' },
  { label: 'a/b', insert: '\\frac{a}{b}' },
  { label: '√x', insert: '\\sqrt{x}' },
  { label: 'x²', insert: '^2' },
  { label: 'π', insert: '\\pi' },
  { label: 'θ', insert: '\\theta' },
  { label: 'sin', insert: '\\sin(' },
  { label: 'cos', insert: '\\cos(' },
  { label: 'ln', insert: '\\ln(' },
  { label: '·', insert: ' \\cdot ' },
];

export function MathReplTool({ navigate }: { navigate: (to: string) => void }) {
  const engine = useEngine();

  const [lines, setLines] = useState<ReplLine[]>([
    { id: '1', raw: 'a := 12' },
    { id: '2', raw: 'b := 5' },
    { id: '3', raw: 'c := \\sqrt{a^2 + b^2}' },
    { id: '4', raw: '\\text{area} := \\frac{1}{2} \\cdot a \\cdot b' },
    { id: '5', raw: '\\sin(\\theta) := \\frac{b}{c}' },
  ]);

  const [copiedLatex, setCopiedLatex] = useState(false);
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);

  // Evaluate lines reactively in sequence using ComputeEngine scope
  const evaluatedLines: EvaluatedLine[] = useMemo(() => {
    if (!engine) {
      // Return un-evaluated fallback while ComputeEngine loads
      return lines.map((l) => ({
        id: l.id,
        raw: l.raw,
        latexValue: null,
        approx: null,
        error: null,
        isAssignment: l.raw.includes(':='),
      }));
    }

    const ce = engine.ce;
    const results: EvaluatedLine[] = [];

    ce.pushScope();
    try {
      for (const line of lines) {
        const trimmed = line.raw.trim();
        if (!trimmed) {
          results.push({
            id: line.id,
            raw: line.raw,
            latexValue: null,
            approx: null,
            error: null,
            isAssignment: false,
          });
          continue;
        }

        try {
          const expr = ce.parse(trimmed);
          if (!expr.isValid) {
            results.push({
              id: line.id,
              raw: line.raw,
              latexValue: null,
              approx: null,
              error: 'Invalid syntax',
              isAssignment: trimmed.includes(':='),
            });
            continue;
          }

          const evaluated = expr.evaluate();
          const latexValue = evaluated.latex;
          const numeric = evaluated.N().re;
          const approx =
            Number.isFinite(numeric) && !Number.isInteger(numeric)
              ? String(Number(numeric.toPrecision(8)))
              : null;

          const isAssignment = expr.operator === 'Assign' || trimmed.includes(':=');
          const assignedVar = isAssignment ? trimmed.split(':=')[0]?.trim() : undefined;

          results.push({
            id: line.id,
            raw: line.raw,
            latexValue,
            approx: approx === latexValue ? null : approx,
            error: null,
            isAssignment,
            assignedVar,
          });
        } catch (err) {
          results.push({
            id: line.id,
            raw: line.raw,
            latexValue: null,
            approx: null,
            error: err instanceof Error ? err.message : 'Evaluation error',
            isAssignment: trimmed.includes(':='),
          });
        }
      }
    } finally {
      ce.popScope();
    }

    return results;
  }, [lines, engine]);

  const handleUpdateLine = (id: string, text: string) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, raw: text } : l)));
  };

  const handleAddLine = () => {
    const nextId = String(Date.now());
    setLines((prev) => [...prev, { id: nextId, raw: '' }]);
  };

  const handleDeleteLine = (id: string) => {
    if (lines.length <= 1) {
      setLines([{ id: String(Date.now()), raw: '' }]);
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleClearAll = () => {
    setLines([{ id: String(Date.now()), raw: '' }]);
  };

  const loadPreset = (preset: ReplPreset) => {
    setLines(preset.lines.map((text, idx) => ({ id: String(idx + 1), raw: text })));
  };

  const insertSymbol = (symbolText: string) => {
    if (!focusedLineId) {
      if (lines.length > 0) {
        handleUpdateLine(lines[lines.length - 1].id, lines[lines.length - 1].raw + symbolText);
      }
      return;
    }
    const currentLine = lines.find((l) => l.id === focusedLineId);
    if (currentLine) {
      handleUpdateLine(focusedLineId, currentLine.raw + symbolText);
    }
  };

  const copyAllAsLatex = () => {
    const text = lines.map((l) => l.raw).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  const openInCanvas = () => {
    // Encodes the formulas into hash / storage and launches /app/
    window.location.href = APP_URL;
  };

  return (
    <ToolsLayout
      title="Reactive Math REPL & Symbolic Evaluator"
      description="Type formulas and definitions like a := 4, b := 3. Watch downstream equations update reactively in real time with exact fractions and CAS symbols."
      badge="Reactive CAS"
      activeTool="math-evaluator"
      navigate={navigate}
    >
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        {/* Presets Bar */}
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
          {/* Main REPL Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs">
              {/* Header and Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 mb-5">
                <div>
                  <h2 className="text-base font-semibold text-fg flex items-center gap-2">
                    <Code2 className="size-4 text-accent" />
                    <span>Reactive Math Editor</span>
                    {!engine && (
                      <span className="text-[10px] font-mono text-muted animate-pulse">(Loading CAS...)</span>
                    )}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Assign variables with <code className="font-mono text-fg font-bold">:=</code> and refer to
                    them downstream.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyAllAsLatex}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    {copiedLatex ? (
                      <>
                        <Check className="size-3.5 text-live" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-muted" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearAll}
                    title="Clear editor"
                    className="p-1.5 rounded-lg border border-line text-muted hover:text-danger hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Symbol Snippet Palette */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4 p-2 rounded-xl bg-surface-2/40 border border-line/60">
                <span className="text-[10px] font-mono uppercase text-muted mr-1.5">Insert:</span>
                {SYMBOLS.map((sym) => (
                  <button
                    key={sym.label}
                    type="button"
                    onClick={() => insertSymbol(sym.insert)}
                    className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-mono font-medium text-fg hover:border-accent hover:text-accent transition-colors cursor-pointer shadow-2xs"
                  >
                    {sym.label}
                  </button>
                ))}
              </div>

              {/* Interactive Lines List */}
              <div className="space-y-3">
                {evaluatedLines.map((line, idx) => (
                  <div
                    key={line.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-xl border border-line bg-canvas p-2.5 sm:p-3 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15"
                  >
                    {/* Line number badge */}
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-mono text-muted">
                        {idx + 1}
                      </span>

                      {/* Delete button on mobile */}
                      <button
                        type="button"
                        onClick={() => handleDeleteLine(line.id)}
                        className="sm:hidden text-muted hover:text-danger p-1"
                        title="Delete line"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* Input Field */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={line.raw}
                        onChange={(e) => handleUpdateLine(line.id, e.target.value)}
                        onFocus={() => setFocusedLineId(line.id)}
                        placeholder="e.g. a := 4 or \sqrt{a^2 + b^2}"
                        className="w-full bg-transparent font-mono text-xs sm:text-sm text-fg outline-none placeholder:text-muted/60"
                      />
                      {/* Live rendered preview of the expression if typed */}
                      {line.raw.trim().length > 0 && !line.raw.includes(':=') && (
                        <div className="text-[11px] text-muted/70 mt-0.5 overflow-x-auto">
                          <span
                            // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                            dangerouslySetInnerHTML={{
                              __html: renderLatex(line.raw),
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Evaluated Result Pill */}
                    <div className="shrink-0 flex items-center justify-end gap-2 border-t sm:border-t-0 sm:border-l border-line/60 pt-2 sm:pt-0 sm:pl-3">
                      {line.error ? (
                        <span className="rounded-md bg-danger/10 px-2 py-1 text-[11px] font-mono text-danger font-medium">
                          {line.error}
                        </span>
                      ) : line.latexValue ? (
                        <div className="flex items-center gap-2">
                          <span className="text-muted font-mono text-xs">=</span>
                          <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs sm:text-sm font-semibold text-fg border border-line">
                            <span
                              // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                              dangerouslySetInnerHTML={{
                                __html: renderLatex(line.latexValue),
                              }}
                            />
                          </span>
                          {line.approx && (
                            <span className="hidden md:inline rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono text-accent">
                              ≈ {line.approx}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-muted/50">—</span>
                      )}

                      {/* Desktop delete line button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteLine(line.id)}
                        className="hidden sm:grid size-7 place-items-center rounded hover:bg-surface-2 text-muted hover:text-danger transition-colors cursor-pointer"
                        title="Delete line"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Line Button */}
              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line bg-surface-2/40 px-3.5 py-2 text-xs font-medium text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <Plus className="size-3.5 text-accent" />
                  <span>Add Line / Variable</span>
                </button>

                <div className="text-xs font-mono text-muted">
                  {lines.length} statement{lines.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Active Variables & Spatial Canvas Launch */}
          <div className="lg:col-span-4 space-y-6">
            {/* Variable Inspector Card */}
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-semibold text-fg flex items-center gap-2 mb-3">
                <Layers className="size-4 text-accent" />
                <span>Scope &amp; Variables</span>
              </h3>

              <div className="space-y-2">
                {evaluatedLines
                  .filter((l) => l.isAssignment && l.latexValue)
                  .map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between rounded-lg border border-line bg-surface-2/50 px-3 py-2 text-xs font-mono"
                    >
                      <span className="font-bold text-accent">
                        {l.assignedVar || l.raw.split(':=')[0]?.trim()}
                      </span>
                      <span className="text-muted">:</span>
                      <span className="font-semibold text-fg">
                        <span
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderLatex(l.latexValue ?? ''),
                          }}
                        />
                      </span>
                    </div>
                  ))}

                {evaluatedLines.filter((l) => l.isAssignment).length === 0 && (
                  <div className="text-xs text-muted text-center py-4 border border-dashed border-line rounded-lg">
                    No variables assigned yet. Define one using{' '}
                    <code className="font-mono text-fg font-bold">x := 5</code>.
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Integration CTA Card */}
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-accent/10 p-2 text-accent">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-fg">Take these formulas to Node-Blank</h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Math+ nodes in Node-Blank link their variables directly to interactive graphs,
                    spreadsheets, and JavaScript sandbox nodes.
                  </p>
                  <a
                    href={APP_URL}
                    onClick={(e) => {
                      e.preventDefault();
                      openInCanvas();
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:brightness-110 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Launch Node-Blank Canvas</span>
                    <ArrowRight className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolsLayout>
  );
}
