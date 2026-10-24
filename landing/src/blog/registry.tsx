import { Callout, CodeBlock, TexBlock, TexInline } from './BlogComponents';
import {
  bestNoteTakingAppsWithoutIpad,
  embedLiveGraphsInMathNotes,
  matrixRowOperationsExactFractions,
  whyJupyterFailsMathScratchpad,
} from './posts/editorial';
import {
  canadaWaterlooUoftPsets,
  germanyUebungsblattIngenieur,
  indiaGateEngineeringMath,
  ukUniversityProblemSheets,
  usEngineeringPsets,
} from './posts/geo';
import type { BlogCategory, BlogPost } from './types';

export const BLOG_POSTS: BlogPost[] = [
  bestNoteTakingAppsWithoutIpad,
  whyJupyterFailsMathScratchpad,
  embedLiveGraphsInMathNotes,
  matrixRowOperationsExactFractions,
  usEngineeringPsets,
  ukUniversityProblemSheets,
  canadaWaterlooUoftPsets,
  germanyUebungsblattIngenieur,
  indiaGateEngineeringMath,
  {
    slug: 'multivariable-calculus-infinite-canvas',
    title:
      'Visualizing Multivariable Calculus: Gradient Fields, Jacobians & Contour Plots on an Infinite Canvas',
    subtitle:
      'Moving past cramped notebook pages to map 3D surfaces, tangent planes, and vector fields side-by-side.',
    description:
      'Learn how to layout complex multivariable calculus derivations, plot 2D vector fields next to 3D surface projections, and verify critical points without losing context.',
    category: 'Calculus & Derivations',
    geoRegion: 'Global',
    keywords: [
      'multivariable calculus',
      'gradient field',
      'jacobian matrix',
      'contour plots',
      'latex editor',
      'stem canvas',
    ],
    readTime: '6 min read',
    publishedAt: 'Oct 18, 2026',
    author: {
      name: 'Elena Rostova',
      role: 'Applied Math & Systems',
    },
    tableOfContents: [
      { id: 'the-problem-with-linear-notebooks', title: 'The Problem with Linear Calculus Notes', level: 2 },
      {
        id: 'gradient-vectors-and-steepest-ascent',
        title: 'Gradient Vectors & Directional Derivatives',
        level: 2,
      },
      {
        id: 'jacobian-and-coordinate-transformations',
        title: 'The Jacobian in Coordinate Transforms',
        level: 2,
      },
      { id: 'infinite-canvas-layout-workflow', title: 'The Unlined Multi-Node Workflow', level: 2 },
    ],
    relatedSlugs: ['linear-algebra-eigenvalues-svd', 'mit-stanford-eecs-pset-workflow'],
    content: (
      <article className="space-y-6">
        <p className="lead text-lg leading-relaxed text-fg">
          Multivariable calculus is inherently multi-dimensional. Yet for decades, university mathematics
          departments have forced students to squash three-dimensional tangent planes, gradient flows, and
          Jacobian coordinate transformations onto linear, one-dimensional college-ruled paper or vertical
          scroll documents.
        </p>

        <h2 id="the-problem-with-linear-notebooks" className="text-2xl font-bold tracking-tight text-fg pt-4">
          The Problem with Linear Calculus Notes
        </h2>
        <p>
          When computing the gradient of a scalar field <TexInline math="f(x, y)" /> or finding local extrema
          with the second derivative test, you typically juggle four separate artifacts simultaneously:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-fg">
          <li>The textbook problem statement and domain constraints.</li>
          <li>
            The algebraic partial derivative calculations <TexInline math="\frac{\partial f}{\partial x}" />{' '}
            and <TexInline math="\frac{\partial f}{\partial y}" />.
          </li>
          <li>The 2D contour plot or level curves indicating gradient directions.</li>
          <li>The Hessian matrix evaluation to classify saddle points versus local extrema.</li>
        </ul>
        <p>
          In a physical notebook, step 4 is often on page 3, severed from the contour diagram on page 1. When
          you hit a sign error, diagnosing whether it originated in the partial differentiation or in the
          coordinate substitution requires endless page flipping.
        </p>

        <h2
          id="gradient-vectors-and-steepest-ascent"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          Gradient Vectors &amp; Directional Derivatives
        </h2>
        <p>
          Recall the fundamental definition of the gradient vector for a continuously differentiable function{' '}
          <TexInline math="f: \mathbb{R}^n \to \mathbb{R}" />:
        </p>

        <TexBlock
          math="\nabla f(\mathbf{x}) = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\ \frac{\partial f}{\partial x_2} \\ \vdots \\ \frac{\partial f}{\partial x_n} \end{bmatrix}"
          caption="The gradient vector points in the direction of greatest rate of increase of the scalar function."
        />

        <p>
          The directional derivative along any unit vector <TexInline math="\mathbf{u}" /> is given by the
          inner product:
        </p>

        <TexBlock
          math="D_{\mathbf{u}} f(\mathbf{x}) = \nabla f(\mathbf{x}) \cdot \mathbf{u} = \|\nabla f(\mathbf{x})\| \cos(\theta)"
          caption="Directional derivative reaches its maximum when u is aligned with the gradient (cos θ = 1)."
        />

        <Callout type="formula" title="Geometric Property of Level Sets">
          At any point <TexInline math="\mathbf{x}_0" />, the gradient vector{' '}
          <TexInline math="\nabla f(\mathbf{x}_0)" /> is strictly perpendicular to the tangent hyperplane of
          the level set <TexInline math="f(\mathbf{x}) = c" /> passing through{' '}
          <TexInline math="\mathbf{x}_0" />.
        </Callout>

        <h2
          id="jacobian-and-coordinate-transformations"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          The Jacobian in Coordinate Transforms
        </h2>
        <p>
          When switching between Cartesian, polar, or spherical coordinates, the change of variables formula
          requires tracking the local volume distortion factor captured by the determinant of the Jacobian
          matrix <TexInline math="\mathbf{J}" />:
        </p>

        <TexBlock
          math="\mathbf{J} = \frac{\partial(x, y)}{\partial(u, v)} = \begin{vmatrix} \frac{\partial x}{\partial u} & \frac{\partial x}{\partial v} \\ \frac{\partial y}{\partial u} & \frac{\partial y}{\partial v} \end{vmatrix} = \frac{\partial x}{\partial u}\frac{\partial y}{\partial v} - \frac{\partial x}{\partial v}\frac{\partial y}{\partial u}"
          caption="The 2x2 Jacobian determinant representing differential area scaling dx dy = |det(J)| du dv."
        />

        <p>
          For spherical coordinates <TexInline math="(r, \theta, \phi)" /> where{' '}
          <TexInline math="x = r \sin\phi \cos\theta" />, <TexInline math="y = r \sin\phi \sin\theta" />, and{' '}
          <TexInline math="z = r \cos\phi" />, computing this determinant involves substantial trigonometric
          simplification:
        </p>

        <TexBlock
          math="dV = dx\,dy\,dz = r^2 \sin\phi\,dr\,d\theta\,d\phi"
          caption="Volume element in spherical coordinates derived from the 3x3 Jacobian determinant."
        />

        <h2 id="infinite-canvas-layout-workflow" className="text-2xl font-bold tracking-tight text-fg pt-4">
          The Unlined Multi-Node Workflow
        </h2>
        <p>
          Here is how modern STEM students lay out this exact problem set in Unlined without mental
          friction:
        </p>

        <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-line bg-surface p-5">
            <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
              Node 1: PDF Viewer
            </span>
            <h4 className="font-medium text-fg mt-1">Textbook / Problem Set Sheet</h4>
            <p className="text-sm text-muted mt-2">
              Drop the course assignment PDF directly onto the canvas. Pin the exact problem page right beside
              your workspace.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <span className="font-mono text-xs uppercase tracking-wider text-tip font-semibold">
              Node 2: Math+ Block
            </span>
            <h4 className="font-medium text-fg mt-1">Live Symbolic Derivation</h4>
            <p className="text-sm text-muted mt-2">
              Type LaTeX equations with instant feedback. Use MathLive and Cortex Compute Engine to calculate
              derivatives symbolically.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-500 font-semibold">
              Node 3: Graph Node
            </span>
            <h4 className="font-medium text-fg mt-1">Interactive 2D/3D Plot</h4>
            <p className="text-sm text-muted mt-2">
              Graph the level curves or parametric surface. Move sliders in real time to visually confirm
              gradient orthogonality.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <span className="font-mono text-xs uppercase tracking-wider text-purple-500 font-semibold">
              Node 4: Python Script
            </span>
            <h4 className="font-medium text-fg mt-1">Numerical Double Check</h4>
            <p className="text-sm text-muted mt-2">
              Run an in-browser script to numerically integrate or verify matrix rank before turning in your
              homework.
            </p>
          </div>
        </div>

        <CodeBlock
          filename="verify_jacobian.py"
          language="python"
          code={`import numpy as np

# Verify Jacobian determinant for polar transformation at r=2.5, theta=pi/4
def jacobian_polar(r, theta):
    J = np.array([
        [np.cos(theta), -r * np.sin(theta)],
        [np.sin(theta),  r * np.cos(theta)]
    ])
    return np.linalg.det(J)

r_val = 2.5
det = jacobian_polar(r_val, np.pi / 4)
print(f"det(J) = {det:.4f} (Expected: {r_val})")
assert np.isclose(det, r_val)`}
        />

        <Callout type="pset" title="Pset Tip: Grouping with Canvas Sections">
          In Unlined, wrap related nodes into a named Section box (e.g. "Problem 3: Flux Through
          Paraboloid"). Dragging the section moves your textbook snippet, derivation, and graph together
          without disturbing the rest of your canvas.
        </Callout>
      </article>
    ),
  },
  {
    slug: 'linear-algebra-eigenvalues-svd',
    title: 'Intuitive Linear Algebra: Eigenvectors, Singular Value Decomposition & Transformations',
    subtitle: 'From matrix multiplication as geometric warping to low-rank compression on a single screen.',
    description:
      'Demystifying eigenvalues, eigenvectors, and SVD. See how linear transformations distort space and how to verify decompositions alongside your homework.',
    category: 'Linear Algebra',
    geoRegion: 'Global',
    keywords: [
      'linear algebra',
      'eigenvalues',
      'eigenvectors',
      'singular value decomposition',
      'SVD',
      'matrix transformation',
      'math pset',
    ],
    readTime: '8 min read',
    publishedAt: 'Oct 17, 2026',
    author: {
      name: 'Marcus Vance',
      role: 'Robotics & Control Systems',
    },
    tableOfContents: [
      { id: 'matrices-as-linear-operators', title: 'Matrices as Geometric Deformations', level: 2 },
      { id: 'the-eigenvalue-equation', title: 'The Characteristic Equation & Eigenspaces', level: 2 },
      { id: 'svd-the-swiss-army-knife', title: 'Singular Value Decomposition (SVD)', level: 2 },
      { id: 'organizing-linear-algebra-psets', title: 'Organizing Matrix Proofs on Unlined', level: 2 },
    ],
    relatedSlugs: ['multivariable-calculus-infinite-canvas', 'mit-stanford-eecs-pset-workflow'],
    content: (
      <article className="space-y-6">
        <p className="lead text-lg leading-relaxed text-fg">
          Linear algebra is frequently taught backwards: students spend weeks memorizing row reduction
          algorithms by rote before ever realizing that an <TexInline math="n \times n" /> matrix is simply a
          machine that stretches, shears, and rotates vector space.
        </p>

        <h2 id="matrices-as-linear-operators" className="text-2xl font-bold tracking-tight text-fg pt-4">
          Matrices as Geometric Deformations
        </h2>
        <p>
          Consider a matrix <TexInline math="\mathbf{A} \in \mathbb{R}^{2 \times 2}" /> acting on the standard
          basis vectors <TexInline math="\mathbf{i} = \begin{bmatrix}1 \\ 0\end{bmatrix}" /> and{' '}
          <TexInline math="\mathbf{j} = \begin{bmatrix}0 \\ 1\end{bmatrix}" />. The columns of{' '}
          <TexInline math="\mathbf{A}" /> are nothing more than where the grid unit vectors land after the
          transformation:
        </p>

        <TexBlock
          math="\mathbf{A} = \begin{bmatrix} a & b \\ c & d \end{bmatrix} \implies \mathbf{A}\mathbf{i} = \begin{bmatrix}a \\ c\end{bmatrix}, \quad \mathbf{A}\mathbf{j} = \begin{bmatrix}b \\ d\end{bmatrix}"
          caption="The columns of A tell you where basis vectors land."
        />

        <h2 id="the-eigenvalue-equation" className="text-2xl font-bold tracking-tight text-fg pt-4">
          The Characteristic Equation &amp; Eigenspaces
        </h2>
        <p>
          Most vectors get knocked off their original span when transformed by <TexInline math="\mathbf{A}" />
          . Eigenvectors are the rare, privileged directions that maintain their line of action, only
          experiencing scaling by a scalar factor <TexInline math="\lambda" />:
        </p>

        <TexBlock
          math="\mathbf{A}\mathbf{v} = \lambda\mathbf{v} \iff (\mathbf{A} - \lambda\mathbf{I})\mathbf{v} = \mathbf{0}"
          caption="The fundamental eigenvalue equation for non-trivial eigenvector v ≠ 0."
        />

        <p>
          For a non-zero solution <TexInline math="\mathbf{v} \neq \mathbf{0}" /> to exist, the operator{' '}
          <TexInline math="(\mathbf{A} - \lambda\mathbf{I})" /> must squash space into a lower dimension,
          which implies its determinant vanishes:
        </p>

        <TexBlock
          math="p(\lambda) = \det(\mathbf{A} - \lambda\mathbf{I}) = 0"
          caption="The characteristic polynomial whose roots are the eigenvalues of A."
        />

        <Callout type="formula" title="Trace and Determinant Invariants">
          For any <TexInline math="2 \times 2" /> matrix, the characteristic equation reduces cleanly to:
          <div className="my-2 text-center">
            <TexInline math="\lambda^2 - \operatorname{tr}(\mathbf{A})\lambda + \det(\mathbf{A}) = 0" />
          </div>
          Where the sum of eigenvalues equals <TexInline math="\operatorname{tr}(\mathbf{A})" /> and their
          product equals <TexInline math="\det(\mathbf{A})" />.
        </Callout>

        <h2 id="svd-the-swiss-army-knife" className="text-2xl font-bold tracking-tight text-fg pt-4">
          Singular Value Decomposition (SVD)
        </h2>
        <p>
          Eigendecomposition requires square, diagonalizable matrices. SVD generalizes this concept to{' '}
          <em>any</em> matrix <TexInline math="\mathbf{A} \in \mathbb{R}^{m \times n}" />:
        </p>

        <TexBlock
          math="\mathbf{A} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T = \sum_{i=1}^r \sigma_i \mathbf{u}_i \mathbf{v}_i^T"
          caption="SVD factorizes A into orthogonal rotation U, singular scaling Σ, and orthogonal rotation V^T."
        />

        <p>
          The singular values <TexInline math="\sigma_1 \ge \sigma_2 \ge \dots \ge \sigma_r > 0" /> represent
          the lengths of the semi-axes of the hyper-ellipsoid obtained by mapping the unit sphere through{' '}
          <TexInline math="\mathbf{A}" />.
        </p>

        <h2 id="organizing-linear-algebra-psets" className="text-2xl font-bold tracking-tight text-fg pt-4">
          Organizing Matrix Proofs on Unlined
        </h2>
        <p>
          When completing problem sets in linear algebra, proofs require transitioning between algebraic
          expressions and numerical verification:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-fg">
          <li>
            <strong>Step 1:</strong> Keep the theorem statement in a sticky Markdown card.
          </li>
          <li>
            <strong>Step 2:</strong> Use Math+ nodes to write clean LaTeX matrices with brackets and
            subindices.
          </li>
          <li>
            <strong>Step 3:</strong> Drop an interactive Script node right under the proof to test edge cases
            (e.g. defective matrices with repeated eigenvalues).
          </li>
        </ul>

        <CodeBlock
          filename="svd_low_rank.py"
          language="python"
          code={`import numpy as np

# Construct rank-2 matrix
A = np.array([
    [1.0, 2.0, 3.0],
    [2.0, 4.0, 6.0],
    [1.0, 0.0, 1.0]
])

U, S, Vt = np.linalg.svd(A)
print(f"Singular values: {S.round(4)}")
# S[2] should be ~0 because row 2 is 2x row 1`}
        />
      </article>
    ),
  },
  {
    slug: 'mit-stanford-eecs-pset-workflow',
    title: 'The MIT & Stanford EECS Problem Set Setup: Canvas-Based Derivations & Live Verification',
    subtitle:
      'How computer science and electrical engineering students conquer 6.006, 6.036, CS109, and EE263 without context switching.',
    description:
      'A deep dive into setting up an end-to-end homework workflow for rigorous university STEM courses. Pin course notes, write LaTeX, and execute code in one local-first canvas.',
    category: 'University Hubs (US/UK/Canada/DACH/India)',
    geoRegion: 'US',
    keywords: [
      'MIT EECS',
      'Stanford CS',
      'problem sets',
      '6.006 algorithms',
      'CS109 probability',
      'latex canvas',
      'local-first',
    ],
    readTime: '7 min read',
    publishedAt: 'Oct 16, 2026',
    author: {
      name: 'Alex Chen',
      role: 'EECS Alum & Systems Engineer',
    },
    tableOfContents: [
      { id: 'the-modern-engineering-pset-trap', title: 'The Modern Engineering Pset Trap', level: 2 },
      { id: 'the-three-column-canvas-architecture', title: 'The 3-Column Canvas Architecture', level: 2 },
      { id: 'mit-algorithms-and-master-theorem', title: 'Case Study: MIT 6.006 Master Theorem', level: 2 },
      {
        id: 'stanford-cs109-bayesian-models',
        title: 'Case Study: Stanford CS109 Probabilistic Derivation',
        level: 2,
      },
    ],
    relatedSlugs: ['cambridge-imperial-oxford-tripos', 'multivariable-calculus-infinite-canvas'],
    content: (
      <article className="space-y-6">
        <p className="lead text-lg leading-relaxed text-fg">
          At top engineering institutions like MIT, Stanford, Berkeley, and CMU, problem sets (psets) are
          notorious not just for their intellectual rigor, but for the sheer friction of tooling. A single
          assignment often demands reading a 12-page PDF, doing handwritten scratch derivations, writing
          formal LaTeX in Overleaf, and submitting a Python Jupyter notebook to an autograder.
        </p>

        <h2 id="the-modern-engineering-pset-trap" className="text-2xl font-bold tracking-tight text-fg pt-4">
          The Modern Engineering Pset Trap
        </h2>
        <p>
          Every time you switch between your PDF viewer, your scratchpad, Overleaf, and VS Code, you incur
          cognitive switching penalties. Studies in engineering pedagogy demonstrate that students spend up to
          25% of their working time simply hunting down parameters across open tabs.
        </p>

        <Callout type="tip" title="Zero Context Switching">
          Unlined lets you run the entire pipeline inside a single browser tab: the assignment PDF sits on
          the left, your derivations sit in the middle, and an in-browser script runner or graph sits on the
          right.
        </Callout>

        <h2
          id="the-three-column-canvas-architecture"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          The 3-Column Canvas Architecture
        </h2>
        <p>
          Students at MIT EECS frequently structure their Unlined workspace into three distinct functional
          lanes:
        </p>

        <ol className="list-decimal pl-6 space-y-3 text-fg">
          <li>
            <strong>Source Column (X: 0 to 450px):</strong> PDF Node displaying the official assignment rubric
            and lecture slides.
          </li>
          <li>
            <strong>Derivation Column (X: 500 to 1100px):</strong> Math+ nodes containing formulas,
            intermediate steps, and reasoning.
          </li>
          <li>
            <strong>Verification Column (X: 1150 to 1700px):</strong> Script node with Python / JavaScript
            checking base cases or plotting numerical curves.
          </li>
        </ol>

        <h2 id="mit-algorithms-and-master-theorem" className="text-2xl font-bold tracking-tight text-fg pt-4">
          Case Study: MIT 6.006 Master Theorem
        </h2>
        <p>
          Analyzing recurrence relations for divide-and-conquer algorithms like Karatsuba multiplication or
          Strassen's matrix multiplication involves applying the Master Theorem:
        </p>

        <TexBlock
          math="T(n) = a\,T\left(\frac{n}{b}\right) + f(n), \quad \text{where } a \ge 1, b > 1"
          caption="General divide-and-conquer recurrence relation."
        />

        <p>
          By comparing <TexInline math="f(n)" /> with <TexInline math="n^{\log_b a}" />, you classify the
          recurrence into one of three asymptotic cases:
        </p>

        <TexBlock
          math="T(n) = \begin{cases} \Theta\left(n^{\log_b a}\right) & \text{if } f(n) = \mathcal{O}\left(n^{\log_b a - \epsilon}\right) \\ \Theta\left(n^{\log_b a} \log^{k+1} n\right) & \text{if } f(n) = \Theta\left(n^{\log_b a} \log^k n\right) \\ \Theta(f(n)) & \text{if } f(n) = \Omega\left(n^{\log_b a + \epsilon}\right) \end{cases}"
          caption="The Master Theorem solution branches."
        />

        <h2 id="stanford-cs109-bayesian-models" className="text-2xl font-bold tracking-tight text-fg pt-4">
          Case Study: Stanford CS109 Probabilistic Derivation
        </h2>
        <p>
          When working with continuous Bayes rule and conjugate priors, keeping your probability density
          equations intact while tracking normalization constants is critical:
        </p>

        <TexBlock
          math="f_{\Theta|X}(\theta | x) = \frac{f_{X|\Theta}(x | \theta) f_\Theta(\theta)}{\int_{-\infty}^\infty f_{X|\Theta}(x | t) f_\Theta(t)\,dt} \propto \mathcal{L}(\theta; x)\,\pi(\theta)"
          caption="Posterior distribution proportional to likelihood times prior."
        />

        <p>
          With Unlined, everything is saved locally in IndexedDB. Even when campus Wi-Fi drops in the
          basement of Stata or Gates, your calculations and scratchpad remain 100% accessible.
        </p>
      </article>
    ),
  },
  {
    slug: 'cambridge-imperial-oxford-tripos',
    title: 'Cambridge Mathematical Tripos & Imperial Engineering: Deriving Faster Without Paper Waste',
    subtitle:
      'Structuring Part IA/IB Tripos revisions, fluid dynamics, and mechanics on a continuous spatial canvas.',
    description:
      'How UK university mathematics and engineering students organize rigorous Tripos problems, vector calculus proofs, and structural analysis without reams of scrap paper.',
    category: 'University Hubs (US/UK/Canada/DACH/India)',
    geoRegion: 'UK',
    keywords: [
      'Cambridge Tripos',
      'Imperial College London',
      'Oxford Mathematics',
      'Fluid Dynamics',
      'Navier Stokes',
      'Vector Calculus',
    ],
    readTime: '6 min read',
    publishedAt: 'Oct 15, 2026',
    author: {
      name: 'Oliver Thorne',
      role: 'DAMTP Cambridge Researcher',
    },
    tableOfContents: [
      {
        id: 'the-tripos-tradition-vs-screen-friction',
        title: 'The Tripos Tradition vs Screen Friction',
        level: 2,
      },
      {
        id: 'fluid-mechanics-and-navier-stokes',
        title: 'Deriving the Incompressible Navier-Stokes',
        level: 2,
      },
      {
        id: 'spatial-organization-for-exam-revision',
        title: 'Spatial Organization for Exam Revisions',
        level: 2,
      },
    ],
    relatedSlugs: ['mit-stanford-eecs-pset-workflow', 'multivariable-calculus-infinite-canvas'],
    content: (
      <article className="space-y-6">
        <p className="lead text-lg leading-relaxed text-fg">
          The Cambridge Mathematical Tripos is among the oldest and most demanding examinations in the world.
          For over a century, students in Cambridge and Oxford colleges have worked through endless past exam
          papers (known as 'Tripos papers') using fountain pens and legal pads.
        </p>

        <h2
          id="the-tripos-tradition-vs-screen-friction"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          The Tripos Tradition vs Screen Friction
        </h2>
        <p>
          Why do mathematics scholars still rely on physical paper? Because traditional digital note-taking
          tools enforce rigid vertical A4 page breaks right through the middle of multi-line tensor
          derivations.
        </p>

        <p>
          Unlined removes these artificial boundaries. The canvas is infinite, meaning your derivations can
          expand horizontally as naturally as they expand vertically.
        </p>

        <h2 id="fluid-mechanics-and-navier-stokes" className="text-2xl font-bold tracking-tight text-fg pt-4">
          Deriving the Incompressible Navier-Stokes
        </h2>
        <p>
          In Part IB Fluid Dynamics at Cambridge or Aeronautical Engineering at Imperial, the momentum
          equation for a Newtonian fluid is derived from Cauchy stress principles:
        </p>

        <TexBlock
          math="\rho \left( \frac{\partial \mathbf{u}}{\partial t} + (\mathbf{u} \cdot \nabla)\mathbf{u} \right) = -\nabla p + \mu \nabla^2 \mathbf{u} + \rho \mathbf{g}"
          caption="The Navier-Stokes momentum equation for incompressible flow with constant viscosity."
        />

        <p>Coupled with the incompressibility constraint:</p>

        <TexBlock
          math="\nabla \cdot \mathbf{u} = 0"
          caption="Conservation of mass for constant density fluid."
        />

        <Callout type="formula" title="Reynolds Number Dimensional Grouping">
          Non-dimensionalizing the momentum equation yields the governing Reynolds number:
          <div className="my-2 text-center">
            <TexInline math="\operatorname{Re} = \frac{\rho U L}{\mu} = \frac{U L}{\nu}" />
          </div>
          Dictating whether inertial or viscous forces dominate the flow regime.
        </Callout>

        <h2
          id="spatial-organization-for-exam-revision"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          Spatial Organization for Exam Revisions
        </h2>
        <p>
          When revising 5 years of past Tripos papers, create one Section per question year. Position the
          question statement, standard bookwork proof, and part (b) rider on a clean timeline from left to
          right.
        </p>
      </article>
    ),
  },
  {
    slug: 'iit-jee-gate-engineering-pset-mastery',
    title: 'IIT Bombay & Delhi Engineering Playbook: Complex Circuit Analysis & Thermal Systems',
    subtitle:
      'From state space control models to thermodynamic cycles: mastering problem sets with high computational density.',
    description:
      'Techniques used by top Indian Institutes of Technology students to tackle heavy analytical homework in electrical circuits, heat transfer, and control theory.',
    category: 'University Hubs (US/UK/Canada/DACH/India)',
    geoRegion: 'India',
    keywords: [
      'IIT Bombay',
      'IIT Delhi',
      'GATE exam',
      'Circuit Analysis',
      'State Space',
      'Control Systems',
      'Thermodynamics',
    ],
    readTime: '7 min read',
    publishedAt: 'Oct 14, 2026',
    author: {
      name: 'Priya Sharma',
      role: 'IITB EE / Systems & Automation',
    },
    tableOfContents: [
      {
        id: 'computational-density-in-indian-stem',
        title: 'High Computational Density in Indian STEM',
        level: 2,
      },
      {
        id: 'state-space-representation-of-circuits',
        title: 'State-Space Representation of Circuits',
        level: 2,
      },
      {
        id: 'laplace-transforms-and-transfer-functions',
        title: 'Laplace Transforms & Stability Criteria',
        level: 2,
      },
    ],
    relatedSlugs: ['engineering-psets-finite-element-nodal', 'linear-algebra-eigenvalues-svd'],
    content: (
      <article className="space-y-6">
        <p className="lead text-lg leading-relaxed text-fg">
          Engineering students across IITs and NITs face curricula characterized by massive algebraic and
          numerical density. Whether preparing for semester psets or the national GATE examination, deriving
          coupled differential equations requires flawless tracking of intermediate coefficients.
        </p>

        <h2
          id="computational-density-in-indian-stem"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          High Computational Density in Indian STEM
        </h2>
        <p>
          In classical electrical network theory, solving an RLC circuit with mutual inductance requires
          setting up Kirchhoff's Voltage Laws (KVL) in the s-domain and inverting high-order polynomials.
        </p>

        <h2
          id="state-space-representation-of-circuits"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          State-Space Representation of Circuits
        </h2>
        <p>
          Modern control systems convert higher-order ODEs into a system of first-order vector differential
          equations:
        </p>

        <TexBlock
          math="\begin{aligned} \mathbf{\dot{x}}(t) &= \mathbf{A}\mathbf{x}(t) + \mathbf{B}\mathbf{u}(t) \\ \mathbf{y}(t) &= \mathbf{C}\mathbf{x}(t) + \mathbf{D}\mathbf{u}(t) \end{aligned}"
          caption="Standard continuous-time linear time-invariant (LTI) state-space representation."
        />

        <p>
          The state transition matrix <TexInline math="\mathbf{\Phi}(t) = e^{\mathbf{A}t}" /> governs
          autonomous system evolution, calculated via inverse Laplace transform:
        </p>

        <TexBlock
          math="\mathbf{\Phi}(t) = \mathcal{L}^{-1}\left\{ (s\mathbf{I} - \mathbf{A})^{-1} \right\}"
          caption="Computing the matrix exponential via the resolvent matrix."
        />

        <h2
          id="laplace-transforms-and-transfer-functions"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          Laplace Transforms &amp; Stability Criteria
        </h2>
        <p>
          Determining bounded-input bounded-output (BIBO) stability requires investigating the roots of the
          characteristic polynomial using the Routh-Hurwitz criterion or root locus plots:
        </p>

        <TexBlock
          math="G(s) = \frac{Y(s)}{U(s)} = \mathbf{C}(s\mathbf{I} - \mathbf{A})^{-1}\mathbf{B} + \mathbf{D}"
          caption="Transfer function matrix derived directly from state matrices."
        />

        <Callout type="pset" title="Quick Formula Sheet Node">
          Create a pinned 'Cheat Sheet' node on the corner of your Unlined canvas with common Laplace
          transform pairs (<TexInline math="\sin\omega t \leftrightarrow \frac{\omega}{s^2+\omega^2}" />) so
          you never need to look away from your active derivation.
        </Callout>
      </article>
    ),
  },
  {
    slug: 'tum-eth-zurich-mechanical-systems',
    title: 'TUM & ETH Zürich Mechanics: Kinematics, Euler-Lagrange & Matrix Equations',
    subtitle:
      'From generalized coordinates to equations of motion: European engineering rigor on an open workspace.',
    description:
      'How students at ETH Zürich, TU Munich, and RWTH Aachen formulate multi-body dynamic systems using energy methods, virtual work, and Lagrange multipliers.',
    category: 'University Hubs (US/UK/Canada/DACH/India)',
    geoRegion: 'DACH',
    keywords: [
      'ETH Zurich',
      'TU Munich',
      'Euler Lagrange',
      'Robotics Dynamics',
      'Rigid Body Mechanics',
      'DACH engineering',
    ],
    readTime: '6 min read',
    publishedAt: 'Oct 13, 2026',
    author: {
      name: 'Lukas Weber',
      role: 'ETH Zürich Mechanical Engineering',
    },
    tableOfContents: [
      { id: 'the-analytical-mechanics-approach', title: 'The Analytical Mechanics Approach', level: 2 },
      { id: 'lagrangian-formulation', title: 'The Euler-Lagrange Equations', level: 2 },
      { id: 'double-pendulum-example', title: 'Non-Linear Coupled Case: Double Pendulum', level: 2 },
    ],
    relatedSlugs: ['engineering-psets-finite-element-nodal', 'linear-algebra-eigenvalues-svd'],
    content: (
      <article className="space-y-6">
        <p className="lead text-lg leading-relaxed text-fg">
          At institutions like ETH Zürich and Technical University of Munich (TUM), engineering mechanics
          transitions early from Newtonian vector diagrams to analytical Lagrangian and Hamiltonian mechanics.
        </p>

        <h2 id="the-analytical-mechanics-approach" className="text-2xl font-bold tracking-tight text-fg pt-4">
          The Analytical Mechanics Approach
        </h2>
        <p>
          Newtonian mechanics requires isolating every single body, drawing free-body diagrams, and solving
          for constraint forces that do no work. Analytical mechanics eliminates constraint forces entirely by
          adopting generalized coordinates <TexInline math="q_1, \dots, q_n" /> that match the degrees of
          freedom of the mechanism.
        </p>

        <h2 id="lagrangian-formulation" className="text-2xl font-bold tracking-tight text-fg pt-4">
          The Euler-Lagrange Equations
        </h2>
        <p>
          We construct the Lagrangian <TexInline math="L = T - V" /> as the difference between kinetic energy{' '}
          <TexInline math="T(\mathbf{q}, \mathbf{\dot{q}})" /> and potential energy{' '}
          <TexInline math="V(\mathbf{q})" />. Hamilton's principle of stationary action yields:
        </p>

        <TexBlock
          math="\frac{d}{dt}\left( \frac{\partial L}{\partial \dot{q}_i} \right) - \frac{\partial L}{\partial q_i} = Q_i^{\text{non-cons}}"
          caption="The Euler-Lagrange equation for the i-th generalized coordinate."
        />

        <h2 id="double-pendulum-example" className="text-2xl font-bold tracking-tight text-fg pt-4">
          Non-Linear Coupled Case: Double Pendulum
        </h2>
        <p>
          For a planar double pendulum with link lengths <TexInline math="l_1, l_2" /> and point masses{' '}
          <TexInline math="m_1, m_2" />, the equations of motion form a heavily non-linear symmetric mass
          matrix:
        </p>

        <TexBlock
          math="\mathbf{M}(\mathbf{q})\mathbf{\ddot{q}} + \mathbf{C}(\mathbf{q}, \mathbf{\dot{q}})\mathbf{\dot{q}} + \mathbf{G}(\mathbf{q}) = \mathbf{0}"
          caption="Standard manipulator equation for robotic and multi-body kinematic chains."
        />

        <p>
          Because these matrix components span dozens of terms, working on a constrained 13-inch document
          makes checking Coriolis terms <TexInline math="\mathbf{C}" /> exhausting. In Unlined, you can lay
          out the Kinetic energy expansion, Potential energy, and partial derivatives in parallel columns.
        </p>
      </article>
    ),
  },
  {
    slug: 'engineering-psets-finite-element-nodal',
    title: 'Engineering Problem Sets: Nodal Circuit Analysis & Beam Deflection on a Single Surface',
    subtitle: 'Unifying matrix structural mechanics, circuit KCL equations, and spreadsheet validation.',
    description:
      'Step-by-step methods to solve complex civil, mechanical, and electrical engineering problems with side-by-side matrices, code validation, and clean diagrams.',
    category: 'Engineering & Psets',
    geoRegion: 'Global',
    keywords: [
      'engineering pset',
      'nodal analysis',
      'beam deflection',
      'finite element method',
      'structural mechanics',
      'sheet node',
    ],
    readTime: '7 min read',
    publishedAt: 'Oct 12, 2026',
    author: {
      name: 'David O’Reilly',
      role: 'Structural Engineering Educator',
    },
    tableOfContents: [
      {
        id: 'why-engineering-students-struggle-with-handouts',
        title: 'Why Multi-Step Engineering Psets Fail in Notebooks',
        level: 2,
      },
      { id: 'nodal-admittance-matrix-derivation', title: 'Nodal Admittance Matrix Equations', level: 2 },
      { id: 'euler-bernoulli-beam-deflection', title: 'Euler-Bernoulli Beam Bending Equations', level: 2 },
      { id: 'using-sheet-and-script-nodes', title: 'Spreadsheet & Script Nodes in Unlined', level: 2 },
    ],
    relatedSlugs: ['multivariable-calculus-infinite-canvas', 'tum-eth-zurich-mechanical-systems'],
    content: (
      <article className="space-y-6">
        <p className="lead text-lg leading-relaxed text-fg">
          Whether you are calculating node voltages in an EE class or solving for bending moments and slope
          deflections in structural mechanics, modern engineering problem sets require rigorous algebraic
          modeling backed by numerical calculation.
        </p>

        <h2
          id="why-engineering-students-struggle-with-handouts"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          Why Multi-Step Engineering Psets Fail in Notebooks
        </h2>
        <p>
          Consider a 4-node bridge truss or electrical circuit. A simple sign error in node 2 invalidates
          every downstream calculation. When you detect the mistake on the final page, correcting it requires
          erasing pages of dependent arithmetic.
        </p>

        <h2
          id="nodal-admittance-matrix-derivation"
          className="text-2xl font-bold tracking-tight text-fg pt-4"
        >
          Nodal Admittance Matrix Equations
        </h2>
        <p>
          Applying Kirchhoff's Current Law (KCL) to an <TexInline math="n" />
          -bus electrical network yields the linear matrix relationship:
        </p>

        <TexBlock
          math="\mathbf{Y}_{\text{bus}} \mathbf{V} = \mathbf{I}"
          caption="The nodal admittance matrix equation relating bus voltages to injected currents."
        />

        <p>
          Where diagonal elements <TexInline math="Y_{ii}" /> are the sum of all admittances connected to node{' '}
          <TexInline math="i" />, and off-diagonal elements <TexInline math="Y_{ij} = -y_{ij}" /> are the
          negative of the branch admittance between nodes <TexInline math="i" /> and <TexInline math="j" />.
        </p>

        <h2 id="euler-bernoulli-beam-deflection" className="text-2xl font-bold tracking-tight text-fg pt-4">
          Euler-Bernoulli Beam Bending Equations
        </h2>
        <p>
          For linear elastic beams subjected to transverse load <TexInline math="q(x)" />, the governing
          fourth-order differential equation for deflection <TexInline math="w(x)" /> is:
        </p>

        <TexBlock
          math="EI \frac{d^4 w}{dx^4} = q(x)"
          caption="Euler-Bernoulli beam differential equation relating flexural rigidity EI to load distribution."
        />

        <p>
          Successive integration yields shear force <TexInline math="V(x)" />, bending moment{' '}
          <TexInline math="M(x)" />, and slope <TexInline math="\theta(x)" />:
        </p>

        <TexBlock
          math="M(x) = -EI \frac{d^2 w}{dx^2}, \quad V(x) = -EI \frac{d^3 w}{dx^3}"
          caption="Internal moment and shear force relationships."
        />

        <h2 id="using-sheet-and-script-nodes" className="text-2xl font-bold tracking-tight text-fg pt-4">
          Spreadsheet &amp; Script Nodes in Unlined
        </h2>
        <p>
          In Unlined, you can drop a <strong>Sheet Node</strong> right beside your beam formula. Enter your
          segment boundaries, load values, and integration constants in the spreadsheet, and watch your moment
          diagram update dynamically.
        </p>

        <Callout type="tip" title="Combining Sheet + Graph Nodes">
          You can reference data from Sheet nodes or Python Script nodes directly on the canvas, eliminating
          the need to retype numbers between software packages.
        </Callout>
      </article>
    ),
  },
];

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return BLOG_POSTS.slice(0, limit);

  // If explicit relatedSlugs provided
  if (current.relatedSlugs?.length) {
    const explicit = current.relatedSlugs
      .map((s) => getPostBySlug(s))
      .filter((p): p is BlogPost => Boolean(p));
    if (explicit.length >= limit) return explicit.slice(0, limit);
  }

  // Fallback to same category or other posts
  return BLOG_POSTS.filter((p) => p.slug !== currentSlug)
    .sort((a) => (a.category === current.category ? -1 : 1))
    .slice(0, limit);
}

export function getCategories(): BlogCategory[] {
  return [
    'Guides',
    'Workflows',
    'Calculus',
    'Engineering & Psets',
    'Linear Algebra',
    'Calculus & Derivations',
    'University Hubs (US/UK/Canada/DACH/India)',
  ];
}

export function getGeoRegions(): string[] {
  return ['All', 'US', 'UK', 'Canada', 'DACH', 'India', 'Global'];
}
