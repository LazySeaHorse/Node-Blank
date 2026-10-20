import { APP_URL } from '@landing/components/Nav';
import katex from 'katex';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  LineChart,
  Sliders,
  Sparkles,
  SplitSquareVertical,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Tex } from '@/lib/math/Tex';
import { ToolsLayout } from './ToolsLayout';

function renderDisplayLatex(tex: string): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: true });
  } catch {
    return tex;
  }
}

type ProblemId = 'calculus' | 'statics' | 'physics';

interface ProblemPreset {
  id: ProblemId;
  title: string;
  source: string;
  chapter: string;
  summary: string;
}

const PROBLEMS: ProblemPreset[] = [
  {
    id: 'calculus',
    title: 'Optimal Box Volume',
    source: 'Stewart Calculus 9e',
    chapter: '§4.7 Applied Optimization',
    summary: 'Find cutout square size x to maximize volume of an open box made from 20×12 cm cardboard.',
  },
  {
    id: 'statics',
    title: 'Simply Supported Beam Equilibrium',
    source: 'Hibbeler Statics 14e',
    chapter: '§5.3 Equilibrium Equations',
    summary:
      'Solve reaction forces at pin A and roller B under combined uniform and concentrated point loads.',
  },
  {
    id: 'physics',
    title: 'Projectile Motion & Trajectory',
    source: 'Halliday & Resnick 11e',
    chapter: '§4.4 2D Kinematics',
    summary: 'Compute time-of-flight, peak vertex height, and horizontal landing range at angle θ.',
  },
];

export function SplitPdfDemoTool({ navigate }: { navigate: (to: string) => void }) {
  const [selectedProblem, setSelectedProblem] = useState<ProblemId>('calculus');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'derivation' | 'plot' | 'notes'>('derivation');

  // Interactive slider parameters
  const [cutoutX, setCutoutX] = useState(2.43); // cm
  const [pointLoadP, setPointLoadP] = useState(12); // kN
  const [launchAngleDeg, setLaunchAngleDeg] = useState(45); // degrees

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFileName(file.name);
    }
  };

  // Calculus Math calculations
  const calculusCalc = useMemo(() => {
    const x = cutoutX;
    const length = 20 - 2 * x;
    const width = 12 - 2 * x;
    const volume = Math.max(0, x * length * width);
    // V'(x) = 12x^2 - 128x + 240
    const derivative = 12 * x * x - 128 * x + 240;
    // Exact critical point: x* = (16 - 2*sqrt(19)) / 3 ≈ 2.4274
    const exactX = (16 - 2 * Math.sqrt(19)) / 3;
    const maxVolume = exactX * (20 - 2 * exactX) * (12 - 2 * exactX);

    return {
      x,
      length: Math.max(0, length),
      width: Math.max(0, width),
      volume,
      derivative,
      exactX,
      maxVolume,
      isNearOptimum: Math.abs(x - exactX) < 0.08,
    };
  }, [cutoutX]);

  // Statics Math calculations
  const staticsCalc = useMemo(() => {
    const L = 6; // beam length 6m
    const w = 4; // uniform load 4 kN/m
    const totalW = w * L; // 24 kN at centroid x = 3m
    const P = pointLoadP; // concentrated load at x = 2m
    const a = 2; // load position

    // Sum Moments about A = 0: By * 6 - P * 2 - (w * 6) * 3 = 0
    // By = (2*P + 72) / 6 = P/3 + 12
    const By = (P * a + totalW * (L / 2)) / L;
    // Sum Fy = 0: Ay + By - P - totalW = 0 -> Ay = P + 24 - By
    const Ay = P + totalW - By;
    const Ax = 0; // pin reaction in x

    return { L, w, P, a, Ax, Ay, By, totalW };
  }, [pointLoadP]);

  // Physics Math calculations
  const physicsCalc = useMemo(() => {
    const g = 9.81;
    const v0 = 28; // m/s
    const thetaRad = (launchAngleDeg * Math.PI) / 180;
    const v0x = v0 * Math.cos(thetaRad);
    const v0y = v0 * Math.sin(thetaRad);

    const flightTime = (2 * v0y) / g;
    const maxHeight = (v0y * v0y) / (2 * g);
    const totalRange = (v0 * v0 * Math.sin(2 * thetaRad)) / g;

    return { g, v0, thetaDeg: launchAngleDeg, v0x, v0y, flightTime, maxHeight, totalRange };
  }, [launchAngleDeg]);

  return (
    <ToolsLayout
      title="Split-Screen PDF Problem Helper"
      description="Simulate the modern STEM problem set workflow: textbook PDF problem on the left, reactive derivation and dynamic function plot on the right."
      badge="Spatial Canvas Demo"
      activeTool="split-pdf"
      navigate={navigate}
    >
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {/* Top Problem Selector Tabs */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-medium text-muted uppercase mr-1">Sample Problem:</span>
            {PROBLEMS.map((prob) => (
              <button
                key={prob.id}
                type="button"
                onClick={() => {
                  setSelectedProblem(prob.id);
                  setUploadedFileName(null);
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  selectedProblem === prob.id && !uploadedFileName
                    ? 'border-accent bg-accent/10 text-accent font-semibold shadow-xs'
                    : 'border-line bg-surface text-fg hover:bg-surface-2'
                }`}
              >
                <span>{prob.title}</span>
                <span className="ml-1.5 text-[10px] font-mono text-muted">({prob.source})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="application/pdf"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Upload className="size-3.5 text-muted" />
              <span>{uploadedFileName ? `Loaded: ${uploadedFileName.slice(0, 16)}...` : 'Drop Own PDF'}</span>
            </button>
          </div>
        </div>

        {/* Cognitive Context Banner: The Alt-Tab Tax */}
        <div className="mb-6 rounded-xl border border-line bg-surface p-3.5 sm:p-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="rounded-md bg-accent/10 p-1.5 text-accent font-mono font-bold">
                <SplitSquareVertical className="size-4" />
              </span>
              <div>
                <strong className="text-fg font-semibold">The Alt-Tab Tax:</strong>
                <span className="text-muted ml-1.5">
                  STEM students switch windows 40+ times per problem set. Node-Blank places the PDF diagram,
                  LaTeX derivation, and interactive graph in one visual coordinate space.
                </span>
              </div>
            </div>
            <a
              href={APP_URL}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              <span>Test on full canvas</span>
              <ArrowRight className="size-3" />
            </a>
          </div>
        </div>

        {/* Resizable Interactive Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl border border-line bg-surface shadow-md overflow-hidden min-h-[640px]">
          {/* LEFT PANE: Textbook Problem Document */}
          <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-line bg-canvas flex flex-col">
            {/* Document Header Controls */}
            <div className="flex items-center justify-between border-b border-line bg-surface/80 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2 font-mono text-muted text-[11px]">
                <BookOpen className="size-3.5 text-accent" />
                <span className="font-semibold text-fg">
                  {uploadedFileName ??
                    (selectedProblem === 'calculus'
                      ? 'Stewart_Calculus_Ch4.pdf'
                      : selectedProblem === 'statics'
                        ? 'Hibbeler_Statics_Ch5.pdf'
                        : 'Physics_Halliday_Ch4.pdf')}
                </span>
                <span>• Page 312</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                  className="p-1 rounded hover:bg-surface-2 text-muted hover:text-fg cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <span className="font-mono text-[11px] text-muted w-10 text-center">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                  className="p-1 rounded hover:bg-surface-2 text-muted hover:text-fg cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Document Page Content (Rendered Problem) */}
            <div className="flex-1 p-6 overflow-y-auto" style={{ fontSize: `${zoomLevel / 100}rem` }}>
              {uploadedFileName ? (
                <div className="rounded-xl border border-line bg-surface p-8 text-center space-y-4 my-8">
                  <FileText className="size-12 text-accent mx-auto opacity-70" />
                  <div>
                    <h3 className="font-semibold text-fg text-sm">{uploadedFileName}</h3>
                    <p className="text-xs text-muted mt-1">
                      PDF loaded successfully into client workspace memory.
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-2 p-3 text-xs text-muted text-left max-w-md mx-auto">
                    <p className="font-semibold text-fg mb-1">Canvas Split Screen Active</p>
                    Use the right scratchpad to derive equations, compute values, and graph the response
                    curves side by side!
                  </div>
                </div>
              ) : selectedProblem === 'calculus' ? (
                <div className="space-y-6">
                  {/* Stewart Problem Header */}
                  <div className="border-b border-line pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                      Stewart Calculus 9e • Applications of Differentiation
                    </span>
                    <h2 className="text-base font-bold text-fg mt-0.5">
                      Problem 14: Applied Optimization — Open Box Design
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-fg/90">
                    A cardboard sheet has dimensions <strong>20 cm by 12 cm</strong>. A manufacturer cuts out
                    equal squares of side length <em>x</em> from each of the four corners and bends up the
                    sides to construct an open-top rectangular shipping box.
                  </p>

                  <div className="rounded-lg bg-surface-2/60 p-3 text-xs space-y-1">
                    <div>
                      <strong>(a)</strong> Express the box volume <Tex latex="V(x)" /> as a function of the
                      corner cutout length <em>x</em>.
                    </div>
                    <div>
                      <strong>(b)</strong> Determine the feasible domain for <em>x</em>.
                    </div>
                    <div>
                      <strong>(c)</strong> Find the exact value of <em>x</em> that yields the maximum volume,
                      and find the maximum volume.
                    </div>
                  </div>

                  {/* SVG Diagram: Cardboard with Cutouts & Fold Lines */}
                  <div className="rounded-xl border border-line bg-surface p-4 flex flex-col items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
                      Figure 4.71 — Sheet Metal Net &amp; Cutout Geometry
                    </span>

                    <svg viewBox="0 0 320 200" className="w-full max-w-[340px] text-fg">
                      {/* Main rectangle 20 x 12 */}
                      <rect
                        x="40"
                        y="30"
                        width="240"
                        height="140"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        rx="2"
                      />

                      {/* 4 Corner Cutouts */}
                      {/* Top-Left */}
                      <rect
                        x="40"
                        y="30"
                        width="36"
                        height="36"
                        fill="var(--color-surface-2)"
                        stroke="var(--color-tip)"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      {/* Top-Right */}
                      <rect
                        x="244"
                        y="30"
                        width="36"
                        height="36"
                        fill="var(--color-surface-2)"
                        stroke="var(--color-tip)"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      {/* Bottom-Left */}
                      <rect
                        x="40"
                        y="134"
                        width="36"
                        height="36"
                        fill="var(--color-surface-2)"
                        stroke="var(--color-tip)"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      {/* Bottom-Right */}
                      <rect
                        x="244"
                        y="134"
                        width="36"
                        height="36"
                        fill="var(--color-surface-2)"
                        stroke="var(--color-tip)"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />

                      {/* Dashed fold lines */}
                      <line
                        x1="76"
                        y1="66"
                        x2="244"
                        y2="66"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.6"
                      />
                      <line
                        x1="76"
                        y1="134"
                        x2="244"
                        y2="134"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.6"
                      />
                      <line
                        x1="76"
                        y1="66"
                        x2="76"
                        y2="134"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.6"
                      />
                      <line
                        x1="244"
                        y1="66"
                        x2="244"
                        y2="134"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.6"
                      />

                      {/* Labels */}
                      <text
                        x="160"
                        y="20"
                        textAnchor="middle"
                        className="text-[11px] font-mono fill-current font-semibold"
                      >
                        20 cm
                      </text>
                      <text
                        x="20"
                        y="105"
                        textAnchor="middle"
                        className="text-[11px] font-mono fill-current font-semibold"
                        transform="rotate(-90 20 105)"
                      >
                        12 cm
                      </text>
                      <text
                        x="58"
                        y="52"
                        textAnchor="middle"
                        className="text-[11px] font-mono fill-tip font-bold"
                      >
                        x
                      </text>
                      <text
                        x="58"
                        y="156"
                        textAnchor="middle"
                        className="text-[11px] font-mono fill-tip font-bold"
                      >
                        x
                      </text>
                      <text x="160" y="105" textAnchor="middle" className="text-[11px] font-mono fill-muted">
                        Box Base: (20 - 2x) × (12 - 2x)
                      </text>
                    </svg>
                  </div>
                </div>
              ) : selectedProblem === 'statics' ? (
                <div className="space-y-6">
                  {/* Hibbeler Statics Header */}
                  <div className="border-b border-line pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                      Hibbeler Statics 14e • Equilibrium of Rigid Bodies
                    </span>
                    <h2 className="text-base font-bold text-fg mt-0.5">
                      Problem 23: Simply Supported Crane Beam
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-fg/90">
                    A steel W-beam of length <strong>L = 6 m</strong> is pinned at support <em>A</em> and
                    supported on a frictionless roller at <em>B</em>. It is subjected to a uniform distributed
                    load <strong>w = 4 kN/m</strong> over its entire span and a concentrated point load{' '}
                    <strong>P = {pointLoadP} kN</strong> applied at <em>x = 2 m</em> from support <em>A</em>.
                  </p>

                  {/* SVG Diagram: Statics Beam */}
                  <div className="rounded-xl border border-line bg-surface p-4 flex flex-col items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
                      Free-Body Diagram — Beam AB
                    </span>

                    <svg viewBox="0 0 340 180" className="w-full max-w-[360px] text-fg">
                      {/* Ground line */}
                      <line
                        x1="30"
                        y1="130"
                        x2="310"
                        y2="130"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity="0.3"
                      />

                      {/* Pin Support A (triangle) */}
                      <polygon
                        points="50,110 40,126 60,126"
                        fill="var(--color-surface-2)"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle cx="50" cy="110" r="3" fill="currentColor" />

                      {/* Roller Support B (circle on plate) */}
                      <circle
                        cx="290"
                        cy="116"
                        r="8"
                        fill="var(--color-surface-2)"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <line x1="280" y1="126" x2="300" y2="126" stroke="currentColor" strokeWidth="2" />

                      {/* Beam member */}
                      <rect
                        x="50"
                        y="104"
                        width="240"
                        height="12"
                        fill="var(--color-surface-2)"
                        stroke="currentColor"
                        strokeWidth="2"
                        rx="1"
                      />

                      {/* Distributed load w arrows */}
                      {Array.from({ length: 9 }).map((_, i) => {
                        const px = 55 + i * 28;
                        return (
                          <g key={i}>
                            <line
                              x1={px}
                              y1="65"
                              x2={px}
                              y2="100"
                              stroke="var(--color-accent)"
                              strokeWidth="1.5"
                            />
                            <polygon
                              points={`${px},100 ${px - 3},92 ${px + 3},92`}
                              fill="var(--color-accent)"
                            />
                          </g>
                        );
                      })}
                      <line x1="55" y1="65" x2="280" y2="65" stroke="var(--color-accent)" strokeWidth="1.5" />
                      <text
                        x="170"
                        y="56"
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-accent font-bold"
                      >
                        w = 4 kN/m
                      </text>

                      {/* Point load P at x = 2m (px = 130) */}
                      <line x1="130" y1="25" x2="130" y2="100" stroke="var(--color-tip)" strokeWidth="2.5" />
                      <polygon points="130,100 125,88 135,88" fill="var(--color-tip)" />
                      <text
                        x="130"
                        y="18"
                        textAnchor="middle"
                        className="text-[11px] font-mono fill-tip font-bold"
                      >
                        P = {pointLoadP} kN
                      </text>

                      {/* Reaction arrow labels */}
                      <text x="40" y="146" className="text-[11px] font-mono font-bold fill-current">
                        Ay = ?
                      </text>
                      <text x="280" y="146" className="text-[11px] font-mono font-bold fill-current">
                        By = ?
                      </text>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Physics Header */}
                  <div className="border-b border-line pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                      Halliday &amp; Resnick 11e • 2D Kinematics
                    </span>
                    <h2 className="text-base font-bold text-fg mt-0.5">
                      Problem 31: Projectile Trajectory &amp; Range Optimization
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-fg/90">
                    A projectile is launched from ground level with speed <strong>v₀ = 28 m/s</strong> at
                    launch angle <strong>θ = {launchAngleDeg}°</strong>. Assume flat terrain and negligible
                    air drag (g = 9.81 m/s²).
                  </p>

                  {/* SVG Diagram: Projectile Trajectory */}
                  <div className="rounded-xl border border-line bg-surface p-4 flex flex-col items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
                      Parabolic Flight Path &amp; Coordinate Frame
                    </span>

                    <svg viewBox="0 0 320 180" className="w-full max-w-[340px] text-fg">
                      {/* Axes */}
                      <line x1="30" y1="140" x2="300" y2="140" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="30" y1="140" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" />
                      <text x="305" y="144" className="text-[10px] font-mono fill-current">
                        x
                      </text>
                      <text x="25" y="15" className="text-[10px] font-mono fill-current">
                        y
                      </text>

                      {/* Parabola path */}
                      <path
                        d="M 30 140 Q 155 30 280 140"
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="2.5"
                      />

                      {/* Launch vector v0 */}
                      <line x1="30" y1="140" x2="70" y2="90" stroke="var(--color-tip)" strokeWidth="2" />
                      <polygon points="70,90 60,95 67,102" fill="var(--color-tip)" />
                      <text x="75" y="85" className="text-[11px] font-mono fill-tip font-bold">
                        v₀ = 28 m/s
                      </text>

                      {/* Angle arc */}
                      <path
                        d="M 50 140 A 20 20 0 0 0 45 125"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <text x="56" y="134" className="text-[10px] font-mono fill-current">
                        θ = {launchAngleDeg}°
                      </text>

                      {/* Peak vertex */}
                      <circle cx="155" cy="85" r="4" fill="var(--color-live)" />
                      <text
                        x="155"
                        y="75"
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-live font-semibold"
                      >
                        Vertex (H_max)
                      </text>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Spatial Canvas Scratchpad & Solver */}
          <div className="lg:col-span-6 bg-surface flex flex-col">
            {/* Tabs Bar */}
            <div className="flex items-center justify-between border-b border-line bg-surface-2/40 px-4 py-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveRightTab('derivation')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeRightTab === 'derivation'
                      ? 'bg-surface text-fg font-semibold shadow-xs'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-accent" />
                    <span>Live Derivation</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRightTab('plot')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeRightTab === 'plot'
                      ? 'bg-surface text-fg font-semibold shadow-xs'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LineChart className="size-3.5 text-accent" />
                    <span>Dynamic Plot</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRightTab('notes')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeRightTab === 'notes'
                      ? 'bg-surface text-fg font-semibold shadow-xs'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="size-3.5 text-accent" />
                    <span>Scratchpad Notes</span>
                  </span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-muted uppercase">Reactive Math+ Node</div>
            </div>

            {/* Right Pane Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {activeRightTab === 'derivation' && (
                <>
                  {/* Interactive Slider Bar */}
                  <div className="rounded-xl border border-line bg-surface-2/50 p-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-fg flex items-center gap-1.5">
                        <Sliders className="size-3.5 text-accent" />
                        <span>Interactive Parameter Test</span>
                      </span>
                      {selectedProblem === 'calculus' && (
                        <span className="font-mono text-accent font-bold">
                          x = {calculusCalc.x.toFixed(2)} cm
                        </span>
                      )}
                      {selectedProblem === 'statics' && (
                        <span className="font-mono text-accent font-bold">P = {staticsCalc.P} kN</span>
                      )}
                      {selectedProblem === 'physics' && (
                        <span className="font-mono text-accent font-bold">θ = {physicsCalc.thetaDeg}°</span>
                      )}
                    </div>

                    {selectedProblem === 'calculus' && (
                      <div>
                        <input
                          type="range"
                          min="0.2"
                          max="5.8"
                          step="0.05"
                          value={cutoutX}
                          onChange={(e) => setCutoutX(Number(e.target.value))}
                          className="w-full accent-accent cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-muted mt-1">
                          <span>0.2 cm</span>
                          <span className="text-accent font-semibold">
                            Peak ≈ {calculusCalc.exactX.toFixed(2)} cm
                          </span>
                          <span>5.8 cm</span>
                        </div>
                      </div>
                    )}

                    {selectedProblem === 'statics' && (
                      <div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="1"
                          value={pointLoadP}
                          onChange={(e) => setPointLoadP(Number(e.target.value))}
                          className="w-full accent-accent cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-muted mt-1">
                          <span>0 kN (Distributed only)</span>
                          <span>30 kN (Heavy crane load)</span>
                        </div>
                      </div>
                    )}

                    {selectedProblem === 'physics' && (
                      <div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          step="1"
                          value={launchAngleDeg}
                          onChange={(e) => setLaunchAngleDeg(Number(e.target.value))}
                          className="w-full accent-accent cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-muted mt-1">
                          <span>10°</span>
                          <span className="text-accent font-semibold">Max Range = 45°</span>
                          <span>80°</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reactive Step-by-Step LaTeX Derivation */}
                  {selectedProblem === 'calculus' && (
                    <div className="space-y-4 text-xs">
                      {/* Step 1: Volume function */}
                      <div className="rounded-xl border border-line bg-surface p-4">
                        <div className="text-[11px] font-mono text-muted uppercase font-semibold mb-1">
                          Step 1: Volume Formulation
                        </div>
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderDisplayLatex(
                              'V(x) = x \\cdot (20 - 2x) \\cdot (12 - 2x) = 4x^3 - 64x^2 + 240x',
                            ),
                          }}
                        />
                        <div className="mt-2 text-muted">
                          Physical domain constraint: <Tex latex="0 < x < 6\text{ cm}" />.
                        </div>
                      </div>

                      {/* Step 2: First Derivative & Critical Points */}
                      <div className="rounded-xl border border-line bg-surface p-4">
                        <div className="text-[11px] font-mono text-muted uppercase font-semibold mb-1">
                          Step 2: Critical Point Calculation (V&apos; = 0)
                        </div>
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderDisplayLatex(
                              "V'(x) = 12x^2 - 128x + 240 = 0 \\implies 3x^2 - 32x + 60 = 0",
                            ),
                          }}
                        />
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderDisplayLatex(
                              'x = \\frac{32 \\pm \\sqrt{1024 - 720}}{6} = \\frac{16 - 2\\sqrt{19}}{3} \\approx 2.4274\\text{ cm}',
                            ),
                          }}
                        />
                      </div>

                      {/* Step 3: Live Evaluation Card */}
                      <div
                        className={`rounded-xl border p-4 transition-all ${
                          calculusCalc.isNearOptimum ? 'border-live bg-live/5' : 'border-line bg-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-fg">
                            Current Evaluation at x = {calculusCalc.x.toFixed(2)} cm
                          </span>
                          {calculusCalc.isNearOptimum && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-live/10 px-2 py-0.5 text-[11px] font-semibold text-live">
                              <CheckCircle2 className="size-3" />
                              Optimal Peak Reached!
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                          <div className="rounded-lg bg-surface-2 p-2.5">
                            <div className="text-[10px] text-muted uppercase">Box Volume</div>
                            <div className="text-sm font-bold text-fg">
                              {calculusCalc.volume.toFixed(1)} cm³
                            </div>
                          </div>
                          <div className="rounded-lg bg-surface-2 p-2.5">
                            <div className="text-[10px] text-muted uppercase">Derivative V&apos;(x)</div>
                            <div className="text-sm font-bold text-accent">
                              {calculusCalc.derivative.toFixed(1)}
                            </div>
                          </div>
                          <div className="rounded-lg bg-surface-2 p-2.5">
                            <div className="text-[10px] text-muted uppercase">Max Volume</div>
                            <div className="text-sm font-bold text-live">
                              {calculusCalc.maxVolume.toFixed(1)} cm³
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProblem === 'statics' && (
                    <div className="space-y-4 text-xs">
                      {/* Statics Derivations */}
                      <div className="rounded-xl border border-line bg-surface p-4">
                        <div className="text-[11px] font-mono text-muted uppercase font-semibold mb-1">
                          Step 1: Moment Equilibrium about Pin A
                        </div>
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderDisplayLatex(
                              '\\sum M_A = 0 \\implies B_y \\cdot 6 - P \\cdot 2 - (4 \\cdot 6) \\cdot 3 = 0',
                            ),
                          }}
                        />
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderDisplayLatex(
                              `B_y = \\frac{2P + 72}{6} = \\frac{2(${staticsCalc.P}) + 72}{6} = ${staticsCalc.By.toFixed(2)}\\text{ kN}`,
                            ),
                          }}
                        />
                      </div>

                      <div className="rounded-xl border border-line bg-surface p-4">
                        <div className="text-[11px] font-mono text-muted uppercase font-semibold mb-1">
                          Step 2: Vertical Force Equilibrium
                        </div>
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderDisplayLatex(
                              `A_y = P + wL - B_y = ${staticsCalc.P} + 24 - ${staticsCalc.By.toFixed(2)} = ${staticsCalc.Ay.toFixed(2)}\\text{ kN}`,
                            ),
                          }}
                        />
                      </div>

                      {/* Statics Summary Cards */}
                      <div className="grid grid-cols-2 gap-3 font-mono">
                        <div className="rounded-xl border border-line bg-surface p-3">
                          <div className="text-[10px] text-muted uppercase">Reaction at Pin A (Ay)</div>
                          <div className="text-base font-bold text-accent">
                            {staticsCalc.Ay.toFixed(2)} kN
                          </div>
                        </div>
                        <div className="rounded-xl border border-line bg-surface p-3">
                          <div className="text-[10px] text-muted uppercase">Reaction at Roller B (By)</div>
                          <div className="text-base font-bold text-accent">
                            {staticsCalc.By.toFixed(2)} kN
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProblem === 'physics' && (
                    <div className="space-y-4 text-xs">
                      {/* Physics Derivations */}
                      <div className="rounded-xl border border-line bg-surface p-4">
                        <div className="text-[11px] font-mono text-muted uppercase font-semibold mb-1">
                          Kinematic Equations for Projectile
                        </div>
                        <div
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output
                          dangerouslySetInnerHTML={{
                            __html: renderDisplayLatex(
                              'v_{0x} = v_0 \\cos\\theta, \\quad v_{0y} = v_0 \\sin\\theta, \\quad t_{\\text{flight}} = \\frac{2v_{0y}}{g}',
                            ),
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3 font-mono">
                        <div className="rounded-xl border border-line bg-surface p-3">
                          <div className="text-[10px] text-muted uppercase">Flight Duration</div>
                          <div className="text-sm font-bold text-fg">
                            {physicsCalc.flightTime.toFixed(2)} s
                          </div>
                        </div>
                        <div className="rounded-xl border border-line bg-surface p-3">
                          <div className="text-[10px] text-muted uppercase">Max Height (H)</div>
                          <div className="text-sm font-bold text-live">
                            {physicsCalc.maxHeight.toFixed(2)} m
                          </div>
                        </div>
                        <div className="rounded-xl border border-line bg-surface p-3">
                          <div className="text-[10px] text-muted uppercase">Total Range (R)</div>
                          <div className="text-sm font-bold text-accent">
                            {physicsCalc.totalRange.toFixed(2)} m
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeRightTab === 'plot' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-fg">
                      {selectedProblem === 'calculus'
                        ? 'Volume Curve V(x) vs Cutout Size x'
                        : selectedProblem === 'statics'
                          ? 'Bending Moment Diagram M(x)'
                          : 'Trajectory Profile y(x)'}
                    </span>
                    <span className="text-[10px] font-mono text-muted">SVG Dynamic Plot</span>
                  </div>

                  {/* Calculus Volume Function Plot */}
                  {selectedProblem === 'calculus' && (
                    <div className="rounded-xl border border-line bg-canvas p-4 flex flex-col items-center">
                      <svg viewBox="0 0 400 240" className="w-full text-fg">
                        {/* Grid lines */}
                        <line x1="40" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="40" y1="20" x2="40" y2="200" stroke="currentColor" strokeWidth="1.5" />

                        {/* X-axis labels */}
                        <text x="40" y="215" textAnchor="middle" className="text-[10px] font-mono fill-muted">
                          0
                        </text>
                        <text
                          x="145"
                          y="215"
                          textAnchor="middle"
                          className="text-[10px] font-mono fill-muted"
                        >
                          2
                        </text>
                        <text
                          x="250"
                          y="215"
                          textAnchor="middle"
                          className="text-[10px] font-mono fill-muted"
                        >
                          4
                        </text>
                        <text
                          x="355"
                          y="215"
                          textAnchor="middle"
                          className="text-[10px] font-mono fill-muted"
                        >
                          6 cm
                        </text>

                        {/* Y-axis labels */}
                        <text x="32" y="204" textAnchor="end" className="text-[10px] font-mono fill-muted">
                          0
                        </text>
                        <text x="32" y="115" textAnchor="end" className="text-[10px] font-mono fill-muted">
                          150
                        </text>
                        <text x="32" y="35" textAnchor="end" className="text-[10px] font-mono fill-muted">
                          300
                        </text>

                        {/* Continuous curve V(x) = 4x^3 - 64x^2 + 240x */}
                        <path
                          d={(() => {
                            const points: string[] = [];
                            for (let i = 0; i <= 60; i++) {
                              const xVal = (i / 60) * 6;
                              const vVal = Math.max(0, xVal * (20 - 2 * xVal) * (12 - 2 * xVal));
                              const plotX = 40 + (xVal / 6) * 315;
                              const plotY = 200 - (vVal / 300) * 170;
                              points.push(`${i === 0 ? 'M' : 'L'} ${plotX.toFixed(1)} ${plotY.toFixed(1)}`);
                            }
                            return points.join(' ');
                          })()}
                          fill="none"
                          stroke="var(--color-accent)"
                          strokeWidth="2.5"
                        />

                        {/* Maximum Peak marker */}
                        {(() => {
                          const peakX = 40 + (calculusCalc.exactX / 6) * 315;
                          const peakY = 200 - (calculusCalc.maxVolume / 300) * 170;
                          return (
                            <g>
                              <circle cx={peakX} cy={peakY} r="5" fill="var(--color-live)" />
                              <line
                                x1={peakX - 25}
                                y1={peakY}
                                x2={peakX + 25}
                                y2={peakY}
                                stroke="var(--color-live)"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                              />
                              <text
                                x={peakX}
                                y={peakY - 10}
                                textAnchor="middle"
                                className="text-[10px] font-mono fill-live font-bold"
                              >
                                Max ({calculusCalc.exactX.toFixed(2)}, {calculusCalc.maxVolume.toFixed(0)})
                              </text>
                            </g>
                          );
                        })()}

                        {/* Active Slider Marker */}
                        {(() => {
                          const currX = 40 + (cutoutX / 6) * 315;
                          const currY = 200 - (calculusCalc.volume / 300) * 170;
                          return (
                            <g>
                              <circle
                                cx={currX}
                                cy={currY}
                                r="6"
                                fill="var(--color-tip)"
                                stroke="white"
                                strokeWidth="1.5"
                              />
                              <line
                                x1={currX}
                                y1={currY}
                                x2={currX}
                                y2="200"
                                stroke="var(--color-tip)"
                                strokeWidth="1"
                                strokeDasharray="2 2"
                              />
                            </g>
                          );
                        })()}
                      </svg>
                    </div>
                  )}

                  {selectedProblem !== 'calculus' && (
                    <div className="rounded-xl border border-line bg-canvas p-8 text-center text-xs text-muted">
                      Dynamic curve synchronized with parameters. Drag the sliders in the Derivation tab to
                      watch the function respond.
                    </div>
                  )}
                </div>
              )}

              {activeRightTab === 'notes' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-fg">Student Notes &amp; Working</span>
                  <textarea
                    defaultValue={`# Solution for ${selectedProblem === 'calculus' ? 'Problem 14 (Box Optimization)' : 'Problem Set'}
V(x) = 4x^3 - 64x^2 + 240x
Taking derivative: V'(x) = 12x^2 - 128x + 240 = 0
Solving quadratic: x = 2.427 cm
Dimensions of box: 15.15 cm x 7.15 cm x 2.43 cm
Maximum volume = 262.68 cm^3
Verified with second derivative test: V''(2.43) = 24(2.43) - 128 = -69.68 < 0 (Concave down, true maximum).`}
                    rows={12}
                    className="w-full rounded-xl border border-line bg-canvas p-3 font-mono text-xs text-fg leading-relaxed focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <div className="text-[11px] text-muted">
                    In Node-Blank, notes are markdown cards that link directly to math, code, and PDFs.
                  </div>
                </div>
              )}
            </div>

            {/* Split Screen Bottom Call to Action */}
            <div className="border-t border-line bg-surface-2/30 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-semibold text-fg">Want this on an infinite workspace?</span>
                <span className="text-muted ml-1">Drop unlimited PDFs and math nodes side by side.</span>
              </div>
              <a
                href={APP_URL}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-fg hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Launch Full Desktop Node-Blank Canvas</span>
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </ToolsLayout>
  );
}
