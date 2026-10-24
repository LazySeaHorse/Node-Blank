import { Callout, CodeBlock, TexBlock, TexInline } from '@landing/blog/BlogComponents';
import type { BlogPost } from '@landing/blog/types';

export const whyJupyterFailsMathScratchpad: BlogPost = {
  slug: 'lightweight-jupyter-notebook-alternatives-math-scratchpad',
  title: 'Why Jupyter Notebooks Are Overkill for Math Scratchpads (And What to Use Instead)',
  subtitle:
    'Hidden kernel state, out-of-order execution, and setup overhead: why quick homework checks deserve a reactive desktop canvas.',
  description:
    'A technical analysis of why Jupyter notebooks and Python environments create unnecessary friction for quick math scratchwork, and how reactive desktop canvases provide instant symbolic evaluation without kernel bugs.',
  category: 'Workflows',
  geoRegion: 'Global',
  keywords: [
    'lightweight jupyter notebook alternative',
    'instant math scratchpad',
    'reactive math notebook',
    'scratchpad math calculations',
    'jupyter alternative for math homework',
    'mathcad alternative open source',
  ],
  readTime: '8 min read',
  publishedAt: 'October 20, 2026',
  author: {
    name: 'STEM Editorial Team',
    role: 'Computational Tools & Pedagogy',
  },
  tableOfContents: [
    { id: 'ghost-variable-trap', title: 'The "Ghost Variable" Trap: Out-of-Order Execution', level: 2 },
    { id: 'kernel-overhead', title: 'The Overhead of a 5-Line Derivation', level: 2 },
    { id: 'sympy-boilerplate', title: 'SymPy Boilerplate vs. Pure Math Thinking', level: 2 },
    { id: 'spatial-vs-linear', title: 'Spatial Derivations vs. Vertical Linear Scrolling', level: 2 },
    { id: 'reactive-math-plus', title: 'Instant Reactive Evaluation with Math+', level: 2 },
    { id: 'workflow-comparison', title: 'Jupyter vs. Unlined Math+ Comparison', level: 2 },
  ],
  relatedSlugs: [
    'best-note-taking-apps-for-engineering-students-without-ipad',
    'how-to-embed-live-graphs-in-math-notes',
    'matrix-row-operations-exact-fractions-rref-guide',
  ],
  content: (
    <article className="space-y-8 text-fg leading-relaxed">
      <section id="ghost-variable-trap" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          The "Ghost Variable" Trap: Out-of-Order Execution
        </h2>
        <p>
          Every STEM student who has relied on Jupyter notebooks or Google Colab for homework validation knows
          the 3:00 AM panic: your notebook executed smoothly when you tested each block individually, but
          clicking <em>Kernel &rarr; Restart &amp; Run All</em> before submitting produces a cascade of{' '}
          <code className="text-xs bg-surface-2 px-1 py-0.5 rounded border border-line text-red-500 font-mono">
            NameError: name 'k_eff' is not defined
          </code>{' '}
          or, worse, subtly altered numerical values.
        </p>
        <p>
          This is the fundamental design flaw of REPL-based linear notebooks:{' '}
          <strong>hidden mutable kernel state</strong>. Because Jupyter cells can be executed in arbitrary
          order (<code className="text-xs bg-surface-2 px-1 py-0.5 rounded border border-line">In [17]</code>{' '}
          followed by{' '}
          <code className="text-xs bg-surface-2 px-1 py-0.5 rounded border border-line">In [3]</code>), the
          visual sequence of code on your screen almost never corresponds to the internal memory state of the
          Python kernel.
        </p>

        <Callout type="info" title="The Subconscious Ghost Variable">
          If you define <TexInline math="k = 150" /> in cell 8, delete the cell, and later compute{' '}
          <TexInline math="\omega = \sqrt{k/m}" /> in cell 12, the calculation succeeds because{' '}
          <TexInline math="k" /> persists in Python’s global dictionary. You submit homework with an undefined
          variable, and your assignment fails the grader's clean-run test.
        </Callout>
      </section>

      <section id="kernel-overhead" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          The Overhead of a 5-Line Derivation
        </h2>
        <p>
          Suppose you are working on a simple Calculus III exercise: finding the critical points of a
          two-variable surface:
        </p>

        <TexBlock
          math="f(x, y) = x^3 + y^3 - 3xy"
          caption="Two-variable surface with saddle point at origin"
        />

        <p>
          To check your gradient <TexInline math="\nabla f = \mathbf{0}" /> and Hessian determinant in
          Jupyter, your workflow is disproportionately cumbersome:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-muted">
          <li>
            Open your terminal and check which virtual environment has your packages installed (
            <code className="text-xs bg-surface-2 px-1 py-0.5 rounded border border-line">
              conda activate psets
            </code>
            ).
          </li>
          <li>
            Launch{' '}
            <code className="text-xs bg-surface-2 px-1 py-0.5 rounded border border-line">jupyter lab</code>,
            waiting for the local HTTP daemon to spawn.
          </li>
          <li>
            Wait for the Chromium browser tab to connect to the IPython kernel (consuming ~350 MB to 600 MB of
            RAM).
          </li>
          <li>Type five lines of Python import statements before writing a single mathematical equation.</li>
        </ol>
        <p>
          Using an enterprise data-science environment to compute an intermediate derivative is like using a
          bulldozer to plant a flower bulb.
        </p>
      </section>

      <section id="sympy-boilerplate" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          SymPy Boilerplate vs. Pure Math Thinking
        </h2>
        <p>
          Python’s SymPy library is undeniably powerful, but its syntax forces you to think like a software
          engineer rather than a mathematician. Notice the cognitive overhead required just to take a partial
          derivative and solve for roots:
        </p>

        <CodeBlock
          language="python"
          filename="jupyter_derivation.py"
          code={`import sympy as sp

# 1. Boilerplate symbol declarations
x, y = sp.symbols('x y', real=True)
f = x**3 + y**3 - 3*x*y

# 2. Compute partials
fx = sp.diff(f, x)
fy = sp.diff(f, y)

# 3. Solve system
critical_pts = sp.solve([fx, fy], (x, y))
print(f"Critical Points: {critical_pts}")
# Output: [(0, 0), (1, 1)]`}
        />

        <p>
          Compare this with the natural mathematical notation you use on paper. You do not think in terms of{' '}
          <code className="text-xs bg-surface-2 px-1.5 py-0.5 rounded border border-line font-mono">**</code>{' '}
          exponents, string symbol definitions, or function wrapper calls. You want to write{' '}
          <TexInline math="f(x, y) := x^3 + y^3 - 3xy" /> and immediately see{' '}
          <TexInline math="\partial f / \partial x" /> evaluate.
        </p>
      </section>

      <section id="spatial-vs-linear" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          Spatial Derivations vs. Vertical Linear Scrolling
        </h2>
        <p>A Jupyter notebook forces all knowledge into a 1D vertical column:</p>
        <div className="rounded-xl border border-line bg-surface-2/60 p-5 space-y-3 font-mono text-xs text-muted">
          <div className="border border-line bg-surface p-2 rounded text-fg">
            [Cell 1: Markdown] Problem Statement from Textbook
          </div>
          <div className="border border-line bg-surface p-2 rounded text-fg">
            [Cell 2: Code] Parameter definitions (E, I, L)
          </div>
          <div className="border border-line bg-surface p-2 rounded text-fg">
            [Cell 3: Code] Sympy integration
          </div>
          <div className="border border-line bg-surface p-2 rounded text-fg">
            [Cell 4: Output] Matplotlib static PNG plot
          </div>
        </div>
        <p>
          By cell 15, you have scrolled three viewport heights below the original problem statement. When you
          want to verify whether your boundary conditions match the diagram, you are trapped in an endless
          vertical scroll cycle.
        </p>
        <p>
          Real mathematical thinking is inherently <strong>2-dimensional</strong>. When solving problems on a
          whiteboard, professors divide the board into columns: reference diagrams on the left, primary
          derivations in the center, and numerical checks or plots on the right.
        </p>
      </section>

      <section id="reactive-math-plus" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          Instant Reactive Evaluation with Math+
        </h2>
        <p>
          Unlined introduces the <strong>Math+ Node</strong>, an in-browser computational engine powered by
          Cortex Compute Engine that bridges the gap between pure LaTeX typography and live symbolic
          evaluation.
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-line bg-surface p-4 space-y-2">
            <h4 className="text-sm font-semibold text-fg">1. Pure Mathematical Syntax</h4>
            <p className="text-sm text-muted">
              Use standard assignment <TexInline math=":=" /> and natural mathematical expressions. No
              quotation marks, no library imports:
            </p>
            <CodeBlock
              language="math"
              filename="Unlined Math+ Canvas"
              code={`a := \\frac{3}{7}
b := \\frac{5}{14}
c := a + b  --> 11/14 (Exact Fraction)
approx(c)   --> 0.785714`}
            />
          </div>

          <div className="rounded-lg border border-line bg-surface p-4 space-y-2">
            <h4 className="text-sm font-semibold text-fg">2. Deterministic Spatial Reactivity</h4>
            <p className="text-sm text-muted">
              There is no invisible kernel state and no out-of-order execution bugs. Expressions evaluate
              strictly based on their 2D topological position on your canvas: top-to-bottom, left-to-right.
              Move a definition node up, and everything downstream updates instantaneously.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-4 space-y-2">
            <h4 className="text-sm font-semibold text-fg">3. Zero-Delay Startup</h4>
            <p className="text-sm text-muted">
              Because it runs entirely client-side via WebAssembly and modern JavaScript, opening a fresh
              scratchpad takes less than 80 milliseconds. No daemon, no conda environment, and zero internet
              connection required.
            </p>
          </div>
        </div>
      </section>

      <section id="workflow-comparison" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          Jupyter vs. Unlined Math+ Comparison
        </h2>

        <div className="overflow-x-auto rounded-xl border border-line bg-surface-2/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-line bg-surface text-fg font-semibold">
                <th className="p-3">Feature</th>
                <th className="p-3">Jupyter / IPython</th>
                <th className="p-3">Unlined Math+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-muted">
              <tr>
                <td className="p-3 font-medium text-fg">Execution Model</td>
                <td className="p-3 text-red-500">Arbitrary cell order (Ghost state)</td>
                <td className="p-3 text-emerald-500">Deterministic 2D canvas reactive</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-fg">Launch Time</td>
                <td className="p-3 text-amber-500">3–10 seconds (daemon + kernel)</td>
                <td className="p-3 text-emerald-500">&lt; 100 ms (instant browser tab)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-fg">Fraction Handling</td>
                <td className="p-3 text-amber-500">Requires `fractions.Fraction` or SymPy</td>
                <td className="p-3 text-emerald-500">Automatic exact rational arithmetic</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-fg">Spatial Arrangement</td>
                <td className="p-3 text-red-500">1D vertical scroll only</td>
                <td className="p-3 text-emerald-500">Free 2D placement beside PDFs & plots</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-fg">Memory Footprint</td>
                <td className="p-3 text-red-500">~300–600 MB (Python runtime)</td>
                <td className="p-3 text-emerald-500">~45 MB (client-side browser tab)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip" title="When to Use Which Tool">
          Keep Jupyter for training neural networks, running multi-gigabyte pandas datasets, or heavy
          numerical simulations. For the 90% of your coursework that involves calculus, matrix row reduction,
          and symbolic derivations, switch to a reactive desktop canvas that respects your flow.
        </Callout>
      </section>
    </article>
  ),
};
