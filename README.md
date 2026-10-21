# Node-Blank

A desktop-first spatial workbench for STEM study and technical problem solving. Keep textbook pages, math derivations, calculations, and graphs in one view.

<table>
  <tr>
    <td><img src="https://i.postimg.cc/BnDyN9Yw/dcfhtxfc.jpg" alt="Image 1" width="300"></td>
    <td><img src="https://i.postimg.cc/xd3ZDG2D/erhyxrftgc.jpg" alt="Image 2" width="300"></td>
  </tr>
</table>

### What is this?
Node-Blank is an offline spatial workspace optimized for mouse and keyboard users. It serves as a unified desktop workbench where you can place reference PDFs, Markdown explanations, evaluated LaTeX formulas, function graphs, and linear algebra spreadsheets side by side.

### Why did I make this?
Most digital study tools require a tablet and stylus. Computational notebooks hide reference text behind linear code cells. Node-Blank gives keyboard-driven desktop learners an open 2D space to work through derivations, check calculations, and consult textbook material at the same time.

### Features
- **Node types**: Text (Markdown + LaTeX), Math (LaTeX display), Math+ (evaluates expressions with exact fractions and decimal results; `a := 2` variables pass top-to-bottom, left-to-right), Graph (plot several functions of x), Table (math notation cells), Sheet (spreadsheet with formulas, exact fractions, and row/column operations), Script (sandboxed JavaScript with 5-second limit), Image, Video, Web, and PDF (link local files, pin pages, pop pages out as images).
- **Web node**: browse any site inside the canvas, with an address bar, back/forward/reload and Open in tab. Pages that forbid framing (Gemini, for one) need the companion Chrome extension. See [Web node](#web-node).
- **Multiple canvases**, autosaved to your browser's IndexedDB. Optional client-side AES-GCM encrypted cloud sync via JSONBin.
- **Undo/redo** for everything on the canvas. While you type in a cell or field, Ctrl+Z is that field's own history; otherwise it steps back through the canvas, so a spreadsheet cell reverts as a whole.
- **Titles**: right-click any node, Add title (headed nodes show their type until you name them; double-click a title to edit it).
- **Sheets**: formula bar in the header; right-click selected cells for a fill colour; select a row or column (click its number or letter) and right-click to type an operation on it: `-= 3*R2`, `*= 1/2`, `<-> R4`, `-= 2*C1` (rows `R1…`, columns `C1…`, counted from 1). Formula cells work too, and the result stays a live formula. Typed fractions such as `1/3` count as numbers in formulas; the `a/b` toggle shows results as fractions and makes row operations write fractions.
- **Smart notes**: a text node that is only a table or only maths offers to become a Table/Sheet or a Math node.
- **Import/export** selected nodes, a canvas, or everything as JSON.
- **Search** (Ctrl+F) dims non-matching nodes and flies to the matches.
- **Context menus**: right-click for add node, paste, copy, duplicate, delete, order, align and per-node actions; math nodes add insert, insert matrix, text colour and background (right-drag still pans).
- **Organise**: groups nearby nodes and spaces them evenly (one undo step).
- **AI control**: let a coding agent (Claude Code, Codex, Gemini CLI, …) read and edit the open canvas through a small local bridge, or a browser agent through WebMCP. See [AI control](#ai-control).
- **Dark mode**, **offline PWA**.
- **Mobile**: read-only viewer. Pan, zoom and switch canvases; editing is desktop-only.

### Controls
| Action | Input |
| --- | --- |
| Place a node | Pick a tool in the toolbar, then double-click the canvas |
| Pick a placement tool | 1-9, then 0 (same order as the toolbar) |
| Add or remove table rows and columns | Hover any gridline of a table (edges included): "+" inserts a row or column there, "−" removes the one before it |
| Text in a table cell | Press `"` in an empty cell, or use the button beside it |
| Pan | Scroll / trackpad, or drag with middle or right mouse button |
| Context menu | Right-click (without dragging) the canvas, a node, a section or a selection |
| Zoom | Pinch, or Ctrl/Cmd + scroll |
| Select | Click, Shift+click, or drag a box on empty canvas |
| Undo / redo | Ctrl+Z / Ctrl+Shift+Z |
| Duplicate / delete | Ctrl+D / Delete |
| Copy / paste nodes | Ctrl+C / Ctrl+V (with a node selected, not while typing in one) |
| Wrap selection in a section | Ctrl+G |
| Select all | Ctrl+A |
| New line in a math node | Shift+Enter |

### Tech Stack
- **App**: React 19, TypeScript, Vite, Tailwind CSS 4
- **Canvas**: React Flow
- **State & storage**: Zustand + zundo (undo), Dexie (IndexedDB), Zod (import validation)
- **Math**: MathLive, KaTeX, Cortex Compute Engine
- **Nodes**: react-markdown, Mafs, react-spreadsheet, CodeMirror 6
- **UI**: Radix UI, lucide icons, sonner

### Credits
The canvas is powered by [React Flow](https://reactflow.dev) ([xyflow](https://github.com/xyflow/xyflow), MIT). Math is rendered by [MathLive](https://cortexjs.io/mathlive/), [KaTeX](https://katex.org) and the [Compute Engine](https://cortexjs.io/compute-engine/).

### Getting Started
Requires Node.js 22+.

```bash
npm install
npm run dev        # dev server
npm test           # unit tests (Vitest)
npm run test:e2e   # browser tests (Playwright)
npm run lint       # Biome
npm run build      # typecheck + production build
```

### Web node
Insert a Web node from the toolbar and type an address (`example.com` is fine). The page runs live in the node: click the node to use it, drag its header to move it. Pages far off screen, or on a canvas zoomed far out, are unloaded and come back at the address you left them on.

Most big sites (Gemini, Google, GitHub, ...) send headers that forbid being shown in a frame. The [`extension/`](extension/README.md) folder holds a small Chrome extension that removes those headers, only in Node-Blank tabs, and lets the node follow the page's address and title. Load it unpacked (`chrome://extensions`, Developer mode, Load unpacked, pick `extension/`); the README there also covers using several Google accounts. Without it the node still shows sites that allow framing, and suggests the extension.

### AI control
Off on every page load. Open the AI panel (robot button in the toolbar) and turn it on; the canvas is organised first so agents can find their way around (undo reverts that).

1. Download and run the bridge for your OS from the latest `bridge-v*` [release](https://github.com/LazySeaHorse/Node-Blank/releases). See [`bridge/README.md`](bridge/README.md).
2. Add it to your agent once: `claude mcp add --transport http node-blank http://127.0.0.1:47801/mcp` (or `codex mcp add node-blank --url …`, `gemini mcp add --transport http node-blank …`).

Agents get a small fixed-size overview (counts, groups of nearby nodes, the selection), then list, search and read only what they need, using short handles (`n3`, `g2`) instead of ids. Edits are find/replace, cell updates or whole fields; each call is one undo step. While an agent is editing, the canvas is read-only for you (Take over turns AI control off), changed nodes flash, and the panel keeps the session's activity.

### Project Layout
```
src/
  model/        node and canvas types
  nodes/        one folder per node kind: spec (metadata, defaults, schema) + component + logic
  store/        canvas store (undo), UI store, workspace service (open/save/import/export)
  persistence/  Dexie database, repository, autosave, JSON format
  canvas/       React Flow canvas, shortcuts, search, insert actions
  chrome/       toolbar, canvas manager, search bar, zoom controls, mobile bar
  ui/           Radix-based primitives and prompt/confirm dialogs
  lib/          small shared helpers (MathField, Markdown, files, grid, clusters, …)
  agent/        AI tools (transport-agnostic), bridge client, WebMCP adapter, activity log
app/            HTML entry for the app, served at /app/
landing/        the marketing page served at / (its own entry, styles and static UI mocks)
extension/      Chrome extension that lets Web nodes frame sites that refuse it
bridge/         Go bridge between coding agents (MCP over HTTP) and the open tab (WebSocket)
```
Adding a node kind: add its data shape to `model/types.ts`, create `nodes/<kind>/spec.ts` and a component, then register it in `nodes/catalog.ts` and `nodes/nodeTypes.tsx`.

### Roadmap
- [x] **Rewrite on React + React Flow** (replaced the custom canvas, pan/zoom and touchpad handling)
- [x] **Text, Math, Math+, Graph, Table, Sheet, Script, Image, Video, Web, and PDF nodes**
- [x] **Multiple canvases**, with rename, export and delete
- [x] **Math+ with variables shared across nodes**
- [x] **Undo/redo for everything**
- [x] **Duplicate, select all and keyboard shortcuts**
- [x] **Resizable nodes**
- [x] **Validated JSON import** (Zod)
- [x] **Global search**
- [x] **Import/export nodes/canvases/everything**
- [x] **Dark mode**
- [x] **Offline PWA**
- [x] **Node groups and Organise**
- [x] **Mobile viewer**
- [x] **AI control** through the local Go bridge (MCP over HTTP) and WebMCP, with an activity feed and Take over
- [x] **PDF node**
- [x] **Encrypted cloud saves (JSONBin AES-GCM)**
- [ ] **Themes!**
- [ ] **Link 2+ nodes**
- [ ] **Import export via QR**
- [ ] **Drawings on canvas**
- [ ] **Export PDF**
