import { Callout, CodeBlock, TexBlock, TexInline } from '@landing/blog/BlogComponents';
import type { BlogPost } from '@landing/blog/types';

export const embedLiveGraphsInMathNotes: BlogPost = {
  slug: 'how-to-embed-live-graphs-in-math-notes',
  title: 'Escaping the Desmos Screenshot Loop: How to Embed Live Graphs Beside Your Derivations',
  subtitle:
    'Stop snipping static images. How to keep living, interactive function plots alongside your mathematical proofs.',
  description:
    'Why pasting static screenshot snips of Desmos or GeoGebra ruins math study notes, and how to use living, interactive function plots directly on an infinite desktop canvas.',
  category: 'Calculus',
  geoRegion: 'Global',
  keywords: [
    'note taking app with live graphing',
    'embed desmos in notes',
    'math notes with interactive graph',
    'plot function alongside notes',
    'desmos screenshot alternative',
    'interactive calculus notes',
  ],
  readTime: '7 min read',
  publishedAt: 'October 20, 2026',
  author: {
    name: 'STEM Editorial Team',
    role: 'Computational Tools & Pedagogy',
  },
  tableOfContents: [
    { id: 'screenshot-loop', title: 'The 7-Step Desmos Screenshot Loop', level: 2 },
    { id: 'why-static-images-fail', title: 'Why Static Screenshots Create "Dead Notes"', level: 2 },
    { id: 'live-canvas-paradigm', title: 'The Living Math Canvas Paradigm', level: 2 },
    { id: 'worked-example-taylor', title: 'Worked Example 1: Taylor Polynomial Convergence', level: 2 },
    { id: 'worked-example-oscillator', title: 'Worked Example 2: Damped Harmonic Oscillator', level: 2 },
    { id: 'node-blank-graph-guide', title: 'How to Plot Functions in Node-Blank', level: 2 },
  ],
  relatedSlugs: [
    'best-note-taking-apps-for-engineering-students-without-ipad',
    'lightweight-jupyter-notebook-alternatives-math-scratchpad',
    'matrix-row-operations-exact-fractions-rref-guide',
  ],
  content: (
    <article className="space-y-8 text-fg leading-relaxed">
      <section id="screenshot-loop" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          The 7-Step Desmos Screenshot Loop
        </h2>
        <p>
          Ask any STEM undergrad how they document a function graph in their notes, and they will describe the
          same exhausting ritual:
        </p>

        <div className="rounded-xl border border-line bg-surface-2/50 p-5 font-mono text-xs text-muted space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">1.</span> Open a new browser tab and navigate to Desmos or
            GeoGebra.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">2.</span> Type the function <TexInline math="f(x)" />,
            adjust window boundaries, and toggle gridlines.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">3.</span> Press{' '}
            <code className="bg-surface px-1.5 py-0.5 rounded border border-line">Win + Shift + S</code> (or{' '}
            <code className="bg-surface px-1.5 py-0.5 rounded border border-line">Cmd + Shift + 4</code>) to
            crop a snip.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">4.</span> Switch back to Notion, OneNote, or Word and
            paste the screenshot image.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">5.</span> Ten minutes later, discover a sign error in your
            derivation: the exponent should be <TexInline math="-2t" />, not <TexInline math="-t" />.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">6.</span> Delete the pasted PNG image from your document.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">7.</span> Return to Desmos, edit the equation, re-snip,
            and re-paste.
          </div>
        </div>

        <p>
          This friction compounds across a 5-problem assignment into dozens of tab switches, clipboard
          overwrites, and disrupted focus.
        </p>
      </section>

      <section id="why-static-images-fail" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          Why Static Screenshots Create "Dead Notes"
        </h2>
        <p>
          Beyond the initial typing friction, static screenshots severely damage the long-term utility of your
          study notes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted">
          <li>
            <strong className="text-fg">Un-interrogatable curves:</strong> During final exam revision, you
            cannot hover over the curve to inspect exact intersection points, local extrema, or asymptotic
            behavior. It is simply a grid of static pixels.
          </li>
          <li>
            <strong className="text-fg">Bloated document storage:</strong> Pasting dozens of high-DPI raster
            images bloats document size, causing cloud sync lag and slow search indexing.
          </li>
          <li>
            <strong className="text-fg">Broken visual hierarchy:</strong> Raster images scale poorly on
            varying screen resolutions, often appearing blurry on high-density external monitors or
            microscopic on laptops.
          </li>
        </ul>
      </section>

      <section id="live-canvas-paradigm" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          The Living Math Canvas Paradigm
        </h2>
        <p>
          In a modern STEM workspace, a mathematical graph should not be a static picture; it should be a{' '}
          <strong>reactive node</strong> that exists in the same coordinate space as your derivation.
        </p>
        <p>
          Node-Blank embeds an interactive 2D function plotter built directly on <strong>Mafs</strong>, a
          GPU-accelerated React mathematical visualization library. Curves render as vector paths with
          interactive coordinate controls, real-time slider scrubbing, and zero external network calls.
        </p>
      </section>

      <section id="worked-example-taylor" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          Worked Example 1: Taylor Polynomial Convergence
        </h2>
        <p>
          Consider the Maclaurin series expansion of <TexInline math="f(x) = \sin(x)" /> around{' '}
          <TexInline math="x = 0" />:
        </p>

        <TexBlock
          math="\sin(x) = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \frac{x^7}{7!} + \dots = \sum_{n=0}^{\infty} \frac{(-1)^n}{(2n+1)!} x^{2n+1}"
          caption="Maclaurin expansion of sin(x)"
        />

        <p>
          Understanding why higher-order polynomials provide broader radius of accurate approximation requires
          seeing the individual polynomial stages laid across the base function:
        </p>

        <div className="rounded-xl border border-line bg-surface p-5 space-y-3">
          <h4 className="text-sm font-semibold text-fg">Multi-Curve Representation in Node-Blank:</h4>
          <CodeBlock
            language="math"
            filename="Graph Node: Functions List"
            code={`f_0(x) = \\sin(x)                   (Base curve: Cyan)
P_1(x) = x                         (Tangent line: Amber)
P_3(x) = x - x^3 / 6               (Cubic approximation: Purple)
P_5(x) = x - x^3 / 6 + x^5 / 120   (Degree-5 Taylor: Emerald)`}
          />
          <p className="text-xs text-muted">
            All four curves render simultaneously inside a single Graph Node placed directly beside your
            theoretical derivation. You can pan across <TexInline math="x \in [-2\pi, 2\pi]" /> to inspect
            exactly where <TexInline math="P_3(x)" /> diverges from <TexInline math="\sin(x)" />.
          </p>
        </div>
      </section>

      <section id="worked-example-oscillator" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          Worked Example 2: Damped Harmonic Oscillator
        </h2>
        <p>
          In engineering physics and circuit analysis (RLC transients), the governing homogeneous 2nd-order
          ODE is:
        </p>

        <TexBlock
          math="\frac{d^2 x}{dt^2} + 2\gamma \frac{dx}{dt} + \omega_0^2 x = 0"
          caption="Characteristic equation: r^2 + 2\gamma r + \omega_0^2 = 0"
        />

        <p>
          For the underdamped case (<TexInline math="\gamma < \omega_0" />
          ), the physical position follows:
        </p>

        <TexBlock
          math="x(t) = A e^{-\gamma t} \cos(\omega_d t + \phi), \quad \text{where } \omega_d = \sqrt{\omega_0^2 - \gamma^2}"
          caption="Underdamped response with exponential decay envelope"
        />

        <p>
          On a static page, students frequently confuse the oscillatory frequency with the envelope decay. In
          Node-Blank, you plot both the oscillatory solution and the envelope boundaries:
        </p>

        <CodeBlock
          language="math"
          filename="Underdamped System with Envelope"
          code={`x(t) = e^{-0.4 t} \\cdot \\cos(3 t)
e_{+}(t) = e^{-0.4 t}
e_{-}(t) = -e^{-0.4 t}`}
        />

        <Callout type="formula" title="Interactive Sanity Check">
          Notice how the response curve touches the envelope curves <TexInline math="\pm e^{-0.4t}" />{' '}
          precisely when <TexInline math="\cos(3t) = \pm 1" />, confirming that the oscillation is strictly
          bounded.
        </Callout>
      </section>

      <section id="node-blank-graph-guide" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          How to Plot Functions in Node-Blank
        </h2>

        <div className="space-y-3">
          <div className="rounded-lg border border-line bg-surface p-4 space-y-1.5">
            <span className="font-semibold text-sm text-fg">1. Spawn a Graph Node</span>
            <p className="text-xs text-muted">
              Press{' '}
              <code className="bg-surface-2 px-1.5 py-0.5 rounded border border-line text-fg">
                N &rarr; Graph
              </code>{' '}
              or right-click anywhere on the canvas and choose <em>Add Graph</em>.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-4 space-y-1.5">
            <span className="font-semibold text-sm text-fg">2. Enter Functions in Natural Math</span>
            <p className="text-xs text-muted">
              Type expressions such as{' '}
              <code className="bg-surface-2 px-1.5 py-0.5 rounded border border-line text-fg">
                x^2 - 4*x + 3
              </code>{' '}
              or{' '}
              <code className="bg-surface-2 px-1.5 py-0.5 rounded border border-line text-fg">
                sin(x) / x
              </code>
              . Add multiple curves by clicking <em>Add Curve</em>.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-4 space-y-1.5">
            <span className="font-semibold text-sm text-fg">3. Position Beside Your Proof</span>
            <p className="text-xs text-muted">
              Drag the graph header to snap it alongside your Math derivations or textbook PDF problems. Group
              them with{' '}
              <code className="bg-surface-2 px-1.5 py-0.5 rounded border border-line text-fg">Ctrl + G</code>{' '}
              to preserve spatial alignment as your notes grow.
            </p>
          </div>
        </div>

        <Callout type="tip" title="No Snipping Ever Again">
          Because your graph is part of your living canvas, you never need to launch a separate browser tab,
          take a screen snip, or paste an outdated image ever again.
        </Callout>
      </section>
    </article>
  ),
};
