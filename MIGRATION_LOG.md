# Migration Log: Vanilla JS -> Preact + Vite + Tailwind

**Objective**: Migrate the existing "Vanilla JS Component Factory" application to a modern **Preact + Vite + Tailwind CLI** stack to improve performance, code density, and AI-maintainability.

**Current Status**: Phase 3 (Component Migration) - **UI COMPLETE** ✅ / Canvas Core Deferred
**Last Updated**: 2026-01-26

**Next Steps**: Phase 4 (Library Replacement) or continue with Canvas/Node migration.

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

### Phase 3: Component Migration (The Big Shift) 🚧 (In Progress)
- [x] **Atoms**: Convert `components/atoms/*.js` -> `*.tsx` (Completed `Button.tsx`)
- [x] **Molecules**: Convert `components/molecules/*.js` -> `*.tsx` (All 6 molecules migrated + Icons lib)
- [ ] **Organisms**: Convert `components/organisms/*.js` -> `*.tsx`
    - [x] UI Components: `AppHeader`, `ActionBar`, `ModeSelector`, `MoreToolsMenu`
    - [x] Modals/Overlays: `CanvasManager`, `SearchOverlay`, `ToolConfigModal`
    - [⏸️] Canvas Core: `CanvasWorld` *(Deferred - tightly coupled with D3.js zoom/pan behavior)*
    - [⏸️] Node Types: `*Node.js` *(Deferred - complex external library integrations: MathLive, D3, jSpreadsheet)*

**Phase 3 Strategy Note**: The `CanvasWorld` and Node components (`GraphNode`, `ScriptNode`, `MathNode`, etc.) are deeply integrated with:
- D3.js for zoom/pan interactions
- MathLive for math editing (`<math-field>`)
- jSpreadsheet for spreadsheet functionality
- Function-plot for graph rendering
- Direct DOM manipulation patterns

These will remain as **legacy vanilla JS** for now and are successfully mounted into the Preact tree via the `App.tsx` wrapper. Migration of these would require significant refactoring and is better addressed as part of Phase 4 library replacements.

### Phase 4: Library Replacement
- [ ] Uninstall/Delete `lib/` folder scripts
- [ ] Install NPM equivalents (`mathlive`, `d3`, `function-plot`, etc.)
- [ ] Refactor Node types to use NPM-installed libraries

---

## ✅ Migrated Components Summary

| Category | Component | Status |
|----------|-----------|--------|
| **Atoms** | Button | ✅ TSX |
| **Molecules** | ActionButton, Dropdown, ModeButton, ThemeToggle, ZoomControl, Icons | ✅ TSX |
| **Organisms** | AppHeader, ActionBar, ModeSelector, MoreToolsMenu | ✅ TSX |
| **Modals** | CanvasManager, SearchOverlay, ToolConfigModal | ✅ TSX |
| **Canvas Core** | CanvasWorld | ⏸️ Deferred (Legacy JS) |
| **Nodes** | MathNode, TextNode, GraphNode, ImageNode, etc. | ⏸️ Deferred (Legacy JS) |

---

## 🐛 Known Issues & Notes
- **Legacy imports**: We currently support legacy imports by exposing `window.process` in `index.html`.
- **Path Aliases**: Added `@state` and `@utils` aliases in both `vite.config.js` and `tsconfig.json` to resolve legacy JS imports from TSX files.
- **CSS**: We are temporarily importing the legacy `main.css` inside `src/index.css`. This should be refactored as we move components.
- **Compute Engine**: The `compute-engine.js` file was moved to `src/lib/` to handle dynamic imports correctly in Vite. The `public/lib` folder still contains other legacy libs.
- **Icon Stroke Width**: Increased default stroke width from 2 to 2.5 to match the legacy icon appearance.
- **Reactivity**: ModeSelector and MoreToolsMenu now properly subscribe to signals via `useEffect` + `effect()` pattern for toolbar config updates.
