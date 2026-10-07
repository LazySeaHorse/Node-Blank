# Node-Blank

A lightweight, in-browser personal canvas where you can throw down whatever you're working on. Math, markdown, videos, code, graphs... you name it!

<table>
  <tr>
    <td><img src="https://i.postimg.cc/BnDyN9Yw/dcfhtxfc.jpg" alt="Image 1" width="300"></td>
    <td><img src="https://i.postimg.cc/xd3ZDG2D/erhyxrftgc.jpg" alt="Image 2" width="300"></td>
  </tr>
</table>

### What is this?
Node-Blank is a desktop-first infinite canvas that focuses on a snappy, offline-first experience specifically optimized for mouse and keyboard users. It serves as a digital scratchpad where various types of content - from LaTeX formulas to interactive graphs - can be arranged freely in a 2D space.

### Why did I make this?
I wanted a LiquidText/Margin Note 4-like experience that didn't feel heavy and wasn't tethered to a specific ecosystem or tablet hardware. It started as a simple way to jot down math expressions and markdown side-by-side, but it has since matured into a robust tool with close to a dozen node types. The goal was to create something that stays out of your way and lets you think.

### Features
- **Node types**: Text (Markdown + LaTeX), Math, Math+ (evaluates expressions; `a := 2` variables are shared across Math+ nodes, top to bottom), Graph (plot several functions of x), Table (math cells), Sheet (spreadsheet with formulas), Script (sandboxed JavaScript), Image and Video.
- **Multiple canvases**, autosaved to your browser's IndexedDB. No accounts, no cloud.
- **Undo/redo** for everything on the canvas.
- **Import/export** selected nodes, a canvas, or everything as JSON.
- **Search** (Ctrl+F) dims non-matching nodes and flies to the matches.
- **Dark mode**, **offline PWA**.
- **Mobile**: read-only viewer. Pan, zoom and switch canvases; editing is desktop-only.

### Controls
| Action | Input |
| --- | --- |
| Place a node | Pick a tool in the toolbar, then double-click the canvas |
| Pan | Scroll / trackpad, or drag with middle or right mouse button |
| Zoom | Pinch, or Ctrl/Cmd + scroll |
| Select | Click, Shift+click, or drag a box on empty canvas |
| Undo / redo | Ctrl+Z / Ctrl+Shift+Z |
| Duplicate / delete | Ctrl+D / Delete |
| Select all | Ctrl+A |
| New line in a math node | Shift+Enter |

### Tech Stack
- **App**: React 19, TypeScript, Vite, Tailwind CSS 4
- **Canvas**: React Flow
- **State & storage**: Zustand + zundo (undo), Dexie (IndexedDB), Zod (import validation)
- **Math**: MathLive, KaTeX, Cortex Compute Engine
- **Nodes**: react-markdown, Mafs, react-spreadsheet, CodeMirror 6
- **UI**: Radix UI, lucide icons, sonner

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
  lib/          small shared helpers (MathField, Markdown, files, grid, …)
```
Adding a node kind: add its data shape to `model/types.ts`, create `nodes/<kind>/spec.ts` and a component, then register it in `nodes/catalog.ts` and `nodes/nodeTypes.tsx`.

### Roadmap
- [x] **Table node**
- [x] **Image node**
- [x] **Import/export nodes/canvases/everything**
- [x] **Multiple canvases**
- [x] **Code node**
- [x] **Video node**
- [x] **Add/Remove nodes from toolbar**
- [x] **Migrate to Tailwind**
- [x] **Dark mode**
- [x] **Migrate to Preact**
- [x] **Smoother navigation using D3**
- [x] **Spreadsheet node**
- [x] **Global search**
- [x] **Make it a PWA**
- [x] **Migrate to TypeScript**
- [x] **Rewrite on React + React Flow**
- [x] **Fix touchpad navigation**
- [ ] **Themes!**
- [ ] **PDF node**
- [ ] **Link 2+ nodes**
- [ ] **Node groups**
- [ ] **Import export via QR**
- [ ] **Encrypted saves**
- [ ] **Bring-your-own Firebase cloud saves**
- [ ] **Drawings on canvas**
- [ ] **Export PDF**
- [ ] **AI features? idk**