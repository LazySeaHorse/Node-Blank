import { APP_URL } from '@landing/components/Nav';
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Grid3X3,
  Sparkles,
  SplitSquareVertical,
  Zap,
} from 'lucide-react';
import { ToolsLayout } from './ToolsLayout';

interface ToolCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  path: string;
  icon: typeof Grid3X3;
  badge: string;
  features: string[];
}

const TOOLS: ToolCard[] = [
  {
    id: 'matrix-rref',
    title: 'Matrix Row Reduction (RREF) Calculator',
    subtitle: 'Exact BigInt Fractions • Step-by-Step Gauss-Jordan • LaTeX Export',
    description:
      'Perform manual row operations or auto-solve with step-by-step elementary explanations. Zero decimal rounding errors, full rank analysis, and single-click LaTeX export.',
    path: '/tools/matrix-rref',
    icon: Grid3X3,
    badge: 'Linear Algebra',
    features: [
      'Exact fraction arithmetic (no 0.3333333333 rounding errors)',
      'Step-by-step Gauss-Jordan forward & backward passes',
      'Supports custom dimensions (2×2 up to 4×5)',
      'Copy matrix directly into LaTeX or course notes',
    ],
  },
  {
    id: 'split-pdf',
    title: 'Split-Screen PDF Homework Helper',
    subtitle: 'Side-by-Side Textbook PDF • Live Math+ Scratchpad • Dynamic Plot',
    description:
      'Experience the real STEM workflow without window juggling. View textbook problem diagrams on the left, derive LaTeX formulas in the middle, and inspect interactive response curves on the right.',
    path: '/tools/split-pdf-scratchpad',
    icon: SplitSquareVertical,
    badge: 'Calculus & Statics',
    features: [
      'Built-in Stewart Calculus & Hibbeler Statics problems',
      'Drop your own course PDF sets in seconds',
      'Interactive parameter sliders & derivative critical point solver',
      'Eliminates the 40+ Alt-Tab tax per homework problem',
    ],
  },
  {
    id: 'math-evaluator',
    title: 'Reactive Math REPL & Symbolic Evaluator',
    subtitle: 'Variables `:=` • Exact Symbolic Simplification • Instant Cascades',
    description:
      'A clean multi-line mathematical scratchpad. Define variables and watch downstream formulas evaluate reactively in real time using Computer Algebra System (CAS) algorithms.',
    path: '/tools/math-evaluator',
    icon: Calculator,
    badge: 'CAS & Scratchpad',
    features: [
      'Multi-line reactive dependency graph',
      'Symbolic simplification and exact radical roots',
      'Physics kinematics, vectors, and quadratic presets',
      'Instant export to Node-Blank desktop canvas',
    ],
  },
];

const COMPARISON_ROWS = [
  {
    feature: 'Ad-Free Experience',
    nodeBlank: '100% Free & Open Source, zero ads forever',
    competitors: 'Ad-heavy banners, popups, and click-walls',
  },
  {
    feature: 'Step-by-Step Solutions',
    nodeBlank: 'Free unlimited step-by-step walkthroughs',
    competitors: 'Paywalled behind $9.99/mo subscription',
  },
  {
    feature: 'Textbook PDF Integration',
    nodeBlank: 'Drop any course PDF side-by-side with math',
    competitors: 'No PDF capability — separate viewer needed',
  },
  {
    feature: 'Multi-Tool Synergy',
    nodeBlank: 'Math, Code, Plot, PDF, and Sheet on one canvas',
    competitors: 'Isolated single-purpose calculators',
  },
  {
    feature: 'Privacy & Offline Mode',
    nodeBlank: 'Runs 100% in your browser (IndexedDB)',
    competitors: 'Server logging and tracking telemetry',
  },
];

export function ToolsIndex({ navigate }: { navigate: (to: string) => void }) {
  return (
    <ToolsLayout
      title="Free Interactive STEM Tools"
      description="Zero ads. Zero logins. 100% client-side calculators designed for engineering and math students."
      badge="Node-Blank Labs"
      activeTool="index"
      navigate={navigate}
    >
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-mono font-medium text-accent mb-4">
            <Sparkles className="size-3.5" />
            <span>Built by the Node-Blank Team</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-fg">
            Interactive STEM Tools Built for Deep Focus.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
            Every semester, STEM students wrestle with clunky, ad-saturated online calculators. We created
            fast, elegant, client-side tools with exact arithmetic — and integrated them into an infinite
            spatial canvas.
          </p>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs hover:border-accent/40 hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:scale-105 transition-transform">
                      <Icon className="size-5" />
                    </span>
                    <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-mono font-medium text-muted border border-line">
                      {tool.badge}
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-bold text-fg group-hover:text-accent transition-colors">
                    {tool.title}
                  </h2>
                  <p className="font-mono text-xs text-tip font-medium mt-1">{tool.subtitle}</p>
                  <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed">{tool.description}</p>

                  <ul className="mt-5 space-y-2 border-t border-line/60 pt-4 text-xs text-fg/85">
                    {tool.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-live shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-line">
                  <button
                    type="button"
                    onClick={() => navigate(tool.path)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-surface-2 border border-line px-4 py-2.5 text-xs sm:text-sm font-semibold text-fg hover:bg-accent hover:text-accent-fg hover:border-accent transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Open Calculator</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-10 shadow-xs mb-20">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
              Why We Built This
            </span>
            <h2 className="font-display text-2xl font-bold text-fg mt-1">
              Single-Purpose Calculators vs Spatial Canvas
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2">
              Why settle for one-off tabs when you can solve entire problem sets in a unified visual canvas?
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line text-muted font-mono text-[11px] uppercase">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4 text-accent">Node-Blank Canvas &amp; Tools</th>
                  <th className="py-3 px-4">Legacy Math Sites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface-2/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-fg">{row.feature}</td>
                    <td className="py-3.5 px-4 text-fg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-live shrink-0" />
                      <span>{row.nodeBlank}</span>
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      <span>{row.competitors}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Canvas Call To Action */}
        <div className="relative isolate overflow-hidden rounded-3xl border border-line bg-canvas p-8 sm:p-12 text-center">
          <div className="mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-mono font-medium text-accent mb-4">
              <Zap className="size-3.5" />
              <span>Full Desktop Suite</span>
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-fg">
              Ready for the Full Infinite Canvas?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
              Open Node-Blank right in your browser. Double-click anywhere to place math formulas, PDFs,
              JavaScript and Python code sandboxes, interactive function graphs, and spreadsheets.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={APP_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <span>Launch Node-Blank Spatial Canvas</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </ToolsLayout>
  );
}
