import { Callout, CodeBlock, TexBlock, TexInline } from '../../BlogComponents';
import type { BlogPost } from '../../types';

export const usEngineeringPsets: BlogPost = {
  slug: 'engineering-pset-workflow-laptop',
  title: 'How to Solve Multi-Page Engineering Psets on a Laptop (Stewart Calculus & Hibbeler Statics)',
  subtitle:
    'Eliminating split-screen eye strain: pinning textbook exercises, LaTeX derivations, and free-body diagrams in one desktop view.',
  description:
    'A battle-tested desktop workflow for engineering undergrads solving Stewart Calculus and Hibbeler Statics problem sets on a laptop without an iPad.',
  category: 'University Hubs',
  geoRegion: 'US',
  keywords: [
    'how to write engineering psets on laptop',
    'calc 3 multivariable scratchpad app',
    'stewart calculus homework side by side pdf',
    'mit 18.06 pset helper',
    'purdue me 270 statics notes',
  ],
  readTime: '8 min read',
  publishedAt: 'Oct 20, 2026',
  author: {
    name: 'Marcus Chen',
    role: 'Mechanical Engineering & Applied Mechanics, Purdue alumnus',
  },
  tableOfContents: [
    { id: 'anatomy-of-a-modern-pset', title: 'The Anatomy of a Modern US Engineering Pset', level: 2 },
    {
      id: 'the-multi-document-juggle',
      title: 'The Multi-Document Juggle: Stewart, Hibbeler & Formula Sheets',
      level: 2,
    },
    { id: 'split-screen-bottleneck', title: 'The Split-Screen Bottleneck on 13" and 15" Laptops', level: 2 },
    {
      id: 'pinning-and-extracting-fbd',
      title: 'Pinning Problem Statements & Free-Body Diagrams Side-by-Side',
      level: 2,
    },
    {
      id: 'derivation-exact-fractions',
      title: 'Writing Derivations with Math+ Exact Rational Arithmetic',
      level: 2,
    },
    {
      id: 'verifying-vectors-and-moments',
      title: 'Verifying 3D Vector Cross Products & Equilibrium Moments',
      level: 2,
    },
    { id: 'pset-workflow-checklist', title: 'Step-by-Step Problem-Set Submission Workflow', level: 2 },
  ],
  relatedSlugs: [
    'university-math-problem-sheets-guide',
    'waterloo-uoft-stem-laptop-notes',
    'best-note-taking-apps-for-engineering-students-without-ipad',
  ],
  content: (
    <article className="space-y-8 text-fg leading-relaxed">
      <section className="space-y-4">
        <p className="lead text-lg leading-relaxed text-muted font-normal">
          If you are an engineering student at Purdue, UIUC, Georgia Tech, Michigan, or Texas A&amp;M, your
          week is governed by the rhythm of the problem set—colloquially, the{' '}
          <strong className="text-fg font-semibold">pset</strong>. Every Sunday evening begins identically:
          you crack open James Stewart&apos;s <em>Multivariable Calculus</em> or Russell C. Hibbeler&apos;s{' '}
          <em>Engineering Mechanics: Statics</em>, stare at four 1,000-page PDF textbooks, and try to balance
          seven floating windows on a single laptop screen.
        </p>
        <p>
          While classmates who bought $1,200 iPads with Apple Pencils scribble handwritten notes that end up
          trapped in proprietary cloud backups, laptop users have traditionally faced an infuriating
          split-screen compromise: squished textbook text on the left, an unresponsive PDF reader on the
          right, and an open calculator window blocking the formula sheet. Here is how to configure a spatial
          desktop workbench that solves multi-page psets with zero stylus requirement, exact algebraic
          tracking, and zero window juggling.
        </p>
      </section>

      <section id="anatomy-of-a-modern-pset" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          1. The Anatomy of a Modern US Engineering Pset
        </h2>
        <p>
          A standard sophomore problem set in engineering mechanics (such as Purdue&apos;s ME 270 or
          Berkeley&apos;s Engin 7) is not a simple list of math exercises. Each multi-part problem requires
          four concurrent artifacts:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-fg">
          <li>
            <strong className="text-fg">The Authoritative Problem Statement:</strong> High-resolution diagrams
            showing trusses, distributed beam loads, or 3D coordinate frames with cable tensions anchored at
            non-orthogonal angles.
          </li>
          <li>
            <strong className="text-fg">The Free-Body Diagram (FBD):</strong> An isolated schematic showing
            all reaction forces (<TexInline math="\mathbf{R}_x, \mathbf{R}_y, \mathbf{R}_z" />) and applied
            couples (<TexInline math="\mathbf{M}_O" />
            ). In ABET-accredited programs, omitting or botching the FBD immediately docks 40% to 50% of the
            question&apos;s credit.
          </li>
          <li>
            <strong className="text-fg">The Symbolic Vector Equations:</strong> The equilibrium balance
            conditions governing particle or rigid-body static balance:
          </li>
        </ol>

        <TexBlock
          math="\sum \mathbf{F} = \mathbf{0} \iff \begin{cases} \sum F_x = 0 \\ \sum F_y = 0 \\ \sum F_z = 0 \end{cases}, \qquad \sum \mathbf{M}_O = \sum (\mathbf{r}_i \times \mathbf{F}_i) + \sum \mathbf{M}_C = \mathbf{0}"
          caption="General static equilibrium conditions in three dimensions for rigid systems."
        />

        <ol start={4} className="list-decimal pl-6 space-y-2 text-fg">
          <li>
            <strong className="text-fg">Exact Algebraic &amp; Numerical Reduction:</strong> Inverting a{' '}
            <TexInline math="3 \times 3" /> or <TexInline math="6 \times 6" /> matrix to isolate cable
            tensions <TexInline math="T_{AB}, T_{AC}, T_{AD}" /> without floating-point rounding errors
            compounding down three pages of dependent work.
          </li>
        </ol>
      </section>

      <section id="the-multi-document-juggle" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          2. The Multi-Document Juggle: Stewart, Hibbeler &amp; Formula Sheets
        </h2>
        <p>
          In courses like Calculus III (Multivariable / Vector Calculus), problems from Stewart Chapter 16
          require continuous reference to vector theorems. Consider evaluating the surface flux of a curl
          vector field using Stokes&apos; Theorem:
        </p>

        <TexBlock
          math="\iint_S (\nabla \times \mathbf{F}) \cdot d\mathbf{S} = \oint_{\partial S} \mathbf{F} \cdot d\mathbf{r}"
          caption="Stokes' Theorem relating surface curl integrals to line integrals along boundary curve C."
        />

        <p>
          To compute this, you need the parameterization{' '}
          <TexInline math="\mathbf{r}(t) = \langle x(t), y(t), z(t) \rangle" />
          for the boundary curve <TexInline math="C = \partial S" />, the derivative vector{' '}
          <TexInline math="\mathbf{r}'(t)" />, and the composition{' '}
          <TexInline math="\mathbf{F}(\mathbf{r}(t))" />.
        </p>
        <p>
          In a physical binder or a linear Google Doc, you write step 1 at the top of the page. By the time
          you compute the cross product for the normal vector{' '}
          <TexInline math="\mathbf{n} = \mathbf{r}_u \times \mathbf{r}_v" />, your reference equations are
          hidden under another tab. You flip back to verify whether the orientation of the surface is upward
          or outward, and you lose five minutes re-checking your signs.
        </p>

        <Callout type="info" title="The Cognitive Overhead of Context Switching">
          Human working memory can store roughly four chunks of novel technical information simultaneously.
          Each time you switch OS windows between Adobe Reader, an equation editor, and a calculator, you
          flush that working cache. Statics errors are rarely conceptual; they are sign slips caused by
          fragmented workspace views.
        </Callout>
      </section>

      <section id="split-screen-bottleneck" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          3. The Split-Screen Bottleneck on 13&quot; and 15&quot; Laptops
        </h2>
        <p>
          The standard operating system split-screen (Windows Snap Assist or macOS Split View) cuts your
          display into two tall, narrow rectangles of roughly 700 to 900 horizontal pixels each.
        </p>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-left text-sm border-collapse border border-line">
            <thead>
              <tr className="bg-surface-2 text-fg border-b border-line">
                <th className="p-3 font-semibold">Workspace Element</th>
                <th className="p-3 font-semibold">Standard Split-Screen Frustration</th>
                <th className="p-3 font-semibold">Unlined Spatial Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-muted">
              <tr>
                <td className="p-3 font-medium text-fg">Textbook PDF (Stewart/Hibbeler)</td>
                <td className="p-3">
                  Requires horizontal scroll bars; figures are shrunk to unreadable thumbnails.
                </td>
                <td className="p-3">
                  Pin only the active assignment page as a zoomable PDF tile directly on the 2D canvas.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-fg">Equation Derivations</td>
                <td className="p-3">
                  Long equations wrap onto three lines in Word, destroying mathematical structure.
                </td>
                <td className="p-3">
                  Math+ nodes scale horizontally without truncation, preserving wide matrix brackets.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-fg">Scratch Calculations</td>
                <td className="p-3">
                  Separate TI-84 or Desmos window hides underlying formulas and variables.
                </td>
                <td className="p-3">
                  Reactive evaluation computes exact rational results inline with LaTeX typography.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-fg">Free-Body Diagrams</td>
                <td className="p-3">
                  Must be drawn on loose scratch paper or painfully mocked in paint apps.
                </td>
                <td className="p-3">
                  Drop high-res problem snips, annotate directly, and place alongside equilibrium equations.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="pinning-and-extracting-fbd" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          4. Pinning Problem Statements &amp; Free-Body Diagrams Side-by-Side
        </h2>
        <p>
          Unlined approaches engineering problem sets as an unbounded two-dimensional canvas rather than an
          endless vertical scroll. Instead of keeping a 50-megabyte PDF reader open in another virtual
          desktop, you drop your course textbook or assignment PDF directly onto the canvas via the{' '}
          <strong>PDF Node</strong>.
        </p>
        <p>Here is how to set up an individual problem workstation in less than 30 seconds:</p>
        <ul className="list-disc pl-6 space-y-2 text-fg">
          <li>
            <strong className="text-fg">Step 1 (Anchor):</strong> Add a PDF Node and point it to your local
            file (e.g.,
            <code className="text-accent bg-surface-2 px-1 py-0.5 rounded text-xs ml-1 font-mono">
              Hibbeler_Statics_14th_Ed.pdf
            </code>
            ). Turn to page 214 and lock the view to Problem 5-28.
          </li>
          <li>
            <strong className="text-fg">Step 2 (Bento Framing):</strong> Draw a <strong>Section Node</strong>{' '}
            named &ldquo;Problem 3: 3D Cable Equilibrium&rdquo;. Drag the PDF node inside.
          </li>
          <li>
            <strong className="text-fg">Step 3 (Free-Body Diagram Placement):</strong> Place an annotated
            image or quick diagram node directly adjacent to the textbook prompt. Label your coordinate axes:{' '}
            <TexInline math="x" /> (east),
            <TexInline math="y" /> (north), <TexInline math="z" /> (vertical elevation).
          </li>
          <li>
            <strong className="text-fg">Step 4 (Derivation Column):</strong> Place a{' '}
            <strong>Math+ Node</strong> immediately to the right of the diagram. As you write your equations,
            your eyes move 3 inches left-to-right rather than tabbing between applications.
          </li>
        </ul>
      </section>

      <section id="derivation-exact-fractions" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          5. Writing Derivations with Math+ Exact Rational Arithmetic
        </h2>
        <p>
          The fatal flaw with using generic spreadsheet software or standard graphing calculators during
          statics homework is floating-point rounding. When finding position unit vectors for cables spanning
          irregular coordinates, you inevitably run into square roots:
        </p>

        <TexBlock
          math="\mathbf{u}_{AB} = \frac{\mathbf{r}_B - \mathbf{r}_A}{\|\mathbf{r}_B - \mathbf{r}_A\|} = \frac{-2\mathbf{i} + 3\mathbf{j} - 6\mathbf{k}}{\sqrt{(-2)^2 + 3^2 + (-6)^2}} = \frac{-2\mathbf{i} + 3\mathbf{j} - 6\mathbf{k}}{\sqrt{49}} = -\frac{2}{7}\mathbf{i} + \frac{3}{7}\mathbf{j} - \frac{6}{7}\mathbf{k}"
          caption="Calculating exact rational direction cosines along cable AB."
        />

        <p>
          If your tool converts <TexInline math="-\frac{2}{7}" /> into{' '}
          <code className="text-xs font-mono">-0.2857</code>, and cable <TexInline math="AC" /> introduces{' '}
          <TexInline math="\frac{4}{9} \approx 0.4444" />, your final equilibrium reaction force will miss the
          textbook&apos;s answer key by several pounds or newtons. Teaching assistants grading on Gradescope
          or Canvas often penalize rounding errors that occur prior to the final line.
        </p>
        <p>
          In Unlined&apos;s Math+ engine (powered by Cortex Compute Engine), exact fractions are first-class
          citizens. When you declare:
        </p>

        <CodeBlock
          filename="Math+ Statics Setup"
          language="latex"
          code={`% Unit vector components for Cable AB
r_AB := [-2, 3, -6]
d_AB := sqrt((-2)^2 + 3^2 + (-6)^2)  % Evaluates strictly to 7
u_AB := r_AB / d_AB                 % Evaluates to [-2/7, 3/7, -6/7]

% Weight of suspended crate (mass = 350 kg, g = 9.81 m/s^2)
W := 350 * 981/100                  % Evaluates to 34335/10 N exact`}
        />

        <Callout type="pset" title="Preserving Purity Throughout the Derivation">
          Notice how <TexInline math="g" /> is represented as <TexInline math="\frac{981}{100}" />. By keeping
          rational values throughout the derivation, you can solve for cable tensions symbolically. When your
          TA reviews your work, every intermediate numerator and denominator matches the official instructor
          manual.
        </Callout>
      </section>

      <section id="verifying-vectors-and-moments" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          6. Verifying 3D Vector Cross Products &amp; Equilibrium Moments
        </h2>
        <p>
          When moving from 2D coplanar systems to 3D rigid bodies (such as a crane boom supported by
          ball-and-socket joints and guy wires), manual cross products become a major source of computational
          fatigue:
        </p>

        <TexBlock
          math="\mathbf{M}_O = \mathbf{r} \times \mathbf{F} = \det \begin{bmatrix} \mathbf{i} & \mathbf{j} & \mathbf{k} \\ r_x & r_y & r_z \\ F_x & F_y & F_z \end{bmatrix} = (r_y F_z - r_z F_y)\mathbf{i} - (r_x F_z - r_z F_x)\mathbf{j} + (r_x F_y - r_y F_x)\mathbf{k}"
          caption="Determinant expansion for the moment of a force about the origin."
        />

        <p>
          A single forgotten negative sign on the <TexInline math="\mathbf{j}" /> component inverts your
          moment direction. In Unlined, you verify your vector math by chaining your derivation into a
          lightweight evaluation node:
        </p>

        <CodeBlock
          filename="Vector Verification in Unlined"
          language="javascript"
          code={`// Verify equilibrium moments around pivot point A
const r_B = [-1.5, 2.0, 4.0];
const F_cable = [120, -240, 360];

// Cross product calculation
const M_x = r_B[1] * F_cable[2] - r_B[2] * F_cable[1]; // 2.0 * 360 - 4.0 * (-240) = 720 + 960 = 1680 N*m
const M_y = -(r_B[0] * F_cable[2] - r_B[2] * F_cable[0]); // -(-1.5 * 360 - 4.0 * 120) = -(-540 - 480) = 1020 N*m
const M_z = r_B[0] * F_cable[1] - r_B[1] * F_cable[0]; // -1.5 * (-240) - 2.0 * 120 = 360 - 240 = 120 N*m

console.log({ M_x, M_y, M_z }); // Direct verification against your symbolic steps`}
        />

        <p>
          Because Unlined supports native JavaScript code execution alongside Math+ and LaTeX blocks, you can
          check complex arithmetic without running an external Python terminal or opening MATLAB.
        </p>
      </section>

      <section id="pset-workflow-checklist" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg border-b border-line pb-2">
          7. Step-by-Step Problem-Set Submission Workflow
        </h2>
        <p>
          Here is the step-by-step procedure followed by engineering undergrads who maintain a 4.0 in
          upper-division mechanics:
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h4 className="font-semibold text-fg flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-accent text-canvas text-xs font-bold">
                1
              </span>
              Ingest the Assignment PDF
            </h4>
            <p className="mt-2 text-sm text-muted">
              Download your weekly assignment from Canvas or Blackboard. Drag the PDF onto your Unlined board.
              Use the page selector to navigate to the current problem without opening Adobe Acrobat.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h4 className="font-semibold text-fg flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-accent text-canvas text-xs font-bold">
                2
              </span>
              Establish the Spatial Bento Section
            </h4>
            <p className="mt-2 text-sm text-muted">
              Press{' '}
              <kbd className="px-1.5 py-0.5 rounded border border-line bg-surface-2 font-mono text-xs text-fg">
                S
              </kbd>{' '}
              to create a Section node. Name it clearly (e.g., &ldquo;Pset 4 - Question 2: Hibbeler
              5-42&rdquo;). This keeps all related diagrams, formulas, and verification scripts cleanly
              grouped.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h4 className="font-semibold text-fg flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-accent text-canvas text-xs font-bold">
                3
              </span>
              Derive Symbolically First, Then Evaluate
            </h4>
            <p className="mt-2 text-sm text-muted">
              Type your equilibrium equations in LaTeX within a Math+ node. Never plug in numbers on line one.
              Isolate your target unknowns (e.g.,{' '}
              <TexInline math="T_{BC} = \frac{W \cdot d_1}{d_2 \sin(\theta)}" />) symbolically before binding
              numeric parameters.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h4 className="font-semibold text-fg flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-accent text-canvas text-xs font-bold">
                4
              </span>
              Export Cleanly for Gradescope
            </h4>
            <p className="mt-2 text-sm text-muted">
              Once verified, copy the rendered LaTeX output or export the high-contrast board section as a
              PDF. Your submission reads like a polished technical publication rather than unreadable pencil
              scratches.
            </p>
          </div>
        </div>

        <Callout type="tip" title="No Cloud Lock-in When Midterms Hit">
          Unlined stores your full canvas locally in IndexedDB inside your browser. When campus Wi-Fi
          throttles in the library basement at 11:30 PM on submission night, your pset board remains 100%
          accessible and responsive.
        </Callout>
      </section>
    </article>
  ),
};
