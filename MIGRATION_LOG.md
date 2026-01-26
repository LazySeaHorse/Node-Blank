# Migration Log: Vanilla JS -> Preact + Vite + Tailwind

**Objective**: Migrate the existing "Vanilla JS Component Factory" application to a modern **Preact + Vite + Tailwind CLI** stack to improve performance, code density, and AI-maintainability.

**Current Status**: Phase 5 (Full TSX Migration) - **COMPLETE** ✅
**Last Updated**: 2026-01-26

**Next Steps**: Cleanup legacy files and remove `htm` dependency.

---

## 📅 Master Plan

### Phase 1: Infrastructure & Build System ✅ (Complete)
- [x] Initialize `package.json`
- [x] Install dependencies (`vite`, `preact`, `tailwindcss`, `postcss`, `autoprefixer`)
- [x] Create `vite.config.js`
- [x] Create `tailwind.config.js`
- [x] Create `src/index.css` & `src/index.jsx`
- [x] Verify local dev server / build
    - *Resolution*: Moved `compute-engine.js` to `src/lib/` to allow Vite to process/bundle it, resolving the dynamic import error.

### Phase 2: Core Application Shell ✅ (Complete)
- [x] **Adoption of TypeScript (TSX)**: Converted `App.jsx` -> `App.tsx` and configured `tsconfig.json`. Future components will be TSX.
- [x] Rename `index.html` -> `index.original.html` (Backup)
- [x] Create new `index.html` (Vite entry point) - *Done in P1*
- [x] Create `src/App.jsx` (Root Preact Component) - *Done in P1 (Wrapper)*
- [x] Migrate `state/appState.js` to NPM imports (remove CDN) - *Done in P1*
- [x] Convert `MathCanvasApp` class in `app.js` to a functional Component - *Done in P2*

### Phase 3: Component Migration (The Big Shift) ✅ (UI Complete)
- [x] **Atoms**: Convert `components/atoms/*.js` -> `*.tsx` (Completed `Button.tsx`)
- [x] **Molecules**: Convert `components/molecules/*.js` -> `*.tsx` (All 6 molecules migrated + Icons lib)
- [x] **Organisms**: Convert `components/organisms/*.js` -> `*.tsx`
    - [x] UI Components: `AppHeader`, `ActionBar`, `ModeSelector`, `MoreToolsMenu`
    - [x] Modals/Overlays: `CanvasManager`, `SearchOverlay`, `ToolConfigModal`
    - [⏸️] Canvas Core: `CanvasWorld` *(Deferred - now uses NPM D3)*
    - [⏸️] Node Types: `*Node.js` *(Now use NPM library imports)*

### Phase 4: Library Replacement ✅ (Complete)
- [x] Install NPM packages: `mathlive`, `marked`, `katex`, `d3`, `function-plot`, `mathjs`, `jspreadsheet-ce`, `jsuites`
- [x] Update imports in components:
    - [x] `mdRenderer.js` - Now imports `marked` and `katex` from NPM
    - [x] `CanvasWorld.js` - Now imports `d3` from NPM
    - [x] `GraphNode.js` - Now imports `function-plot` from NPM
    - [x] `SpreadsheetNode.js` - Now imports `jspreadsheet-ce` and `jsuites` from NPM
    - [x] `MathNode.js` - Now imports `mathlive` from NPM
    - [x] `MathPlusNode.js` - Now imports `mathlive` and `katex` from NPM
- [x] Update `src/index.css` - Added CSS imports for `katex`, `jspreadsheet-ce`, `jsuites`
- [x] Clean `index.html` - Removed all legacy CDN/script tags
- [x] Delete legacy files from `public/lib/` folder (mathlive, marked, katex, function-plot, jspreadsheet, jsuites, tailwind, fonts)

### Phase 5: Full TSX Migration ✅ (Complete)
- [x] Create Type Definitions (`src/types/index.ts`)
- [x] Update `declarations.d.ts` for custom elements
- [x] Convert Node Types to TSX (Files created and integrated):
    - [x] `ImageNode.tsx`
    - [x] `MathNode.tsx`
    - [x] `TextNode.tsx`
    - [x] `GraphNode.tsx`
    - [x] `VideoNode.tsx`
    - [x] `TableNode.tsx`
    - [x] `ScriptNode.tsx`
    - [x] `SpreadsheetNode.tsx`
    - [x] `MathPlusNode.tsx`
- [x] Create `nodeFactory.tsx` (TSX version of factory)
- [x] Convert `CanvasWorld.js` to TSX
- [x] **Integration Switch**: Update `App.tsx` and `CanvasWorld` to import from new `.tsx` files
- [x] Delete legacy `.js` node files
- [⏸️] Remove `htm` dependency *(Still needed for GraphNode and ThemeToggle components)*

---

## ✅ Migrated Components Summary

| Category | Component | Status |
|----------|-----------|--------|
| **Atoms** | Button | ✅ TSX |
| **Molecules** | ActionButton, Dropdown, ModeButton, ThemeToggle, ZoomControl, Icons | ✅ TSX |
| **Organisms** | AppHeader, ActionBar, ModeSelector, MoreToolsMenu | ✅ TSX |
| **Modals** | CanvasManager, SearchOverlay, ToolConfigModal | ✅ TSX |
| **Canvas Core** | CanvasWorld | 📦 NPM D3 (Legacy JS) |
| **Nodes** | MathNode, TextNode, GraphNode, SpreadsheetNode, etc. | 📦 NPM Libs (Legacy JS) |

---

## 📦 Library Migration Summary

| Library | NPM Package | Version | Usage |
|---------|------------|---------|-------|
| MathLive | `mathlive` | ^0.108.2 | Math editing (`<math-field>`) |
| Marked | `marked` | ^17.0.1 | Markdown parsing |
| KaTeX | `katex` | ^0.16.28 | LaTeX rendering |
| D3 | `d3` | ^7.9.0 | Zoom/pan, graph dependencies |
| Function-plot | `function-plot` | ^1.25.3 | Graph rendering |
| Math.js | `mathjs` | ^15.1.0 | Equation evaluation |
| jSpreadsheet CE | `jspreadsheet-ce` | ^5.0.4 | Spreadsheet component |
| jSuites | `jsuites` | ^6.1.1 | jSpreadsheet dependency |

---

## 🐛 Known Issues & Notes
- **Legacy imports**: We currently support legacy imports by exposing `window.process` in `index.html`.
- **Path Aliases**: Added `@state` and `@utils` aliases in both `vite.config.js` and `tsconfig.json` to resolve legacy JS imports from TSX files.
- **CSS**: We are temporarily importing the legacy `main.css` inside `src/index.css`. This should be refactored as we move components.
- **Compute Engine**: The `compute-engine.js` file was moved to `src/lib/` to handle dynamic imports correctly in Vite. The `public/lib` folder still contains legacy libs (pending cleanup).
- **Icon Stroke Width**: Increased default stroke width from 2 to 2.5 to match the legacy icon appearance.
- **Reactivity**: ModeSelector and MoreToolsMenu now properly subscribe to signals via `useEffect` + `effect()` pattern for toolbar config updates.
- **BABEL Warning**: Large files like `compute-engine.js` trigger BABEL deoptimization warnings - this is informational only and doesn't affect functionality.
- **HTM Dependency**: Still required for GraphNode and ThemeToggle components that use template literals. Future refactoring could convert these to pure TSX.

## ✅ Phase 5 Migration Success
**All node types have been successfully migrated to TSX!** The application now uses:
- Type-safe TSX components for all 9 node types
- Proper TypeScript interfaces and type checking
- Modern Preact patterns with hooks
- NPM-based library imports instead of CDN
- Unified component architecture

The migration maintains full backward compatibility while providing better developer experience and maintainability.
