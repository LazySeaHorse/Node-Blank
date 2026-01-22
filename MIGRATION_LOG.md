# Migration Log: Vanilla JS -> Preact + Vite + Tailwind

**Objective**: Migrate the existing "Vanilla JS Component Factory" application to a modern **Preact + Vite + Tailwind CLI** stack to improve performance, code density, and AI-maintainability.

**Current Status**: Phase 2 (Core Application Shell) - **COMPLETE** ✅
**Last Updated**: 2026-01-22

---

## 📅 Master Plan

### Phase 1: Infrastructure & Build System 🚧 (Complete)
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

### Phase 3: Component Migration (The Big Shift) 🚧 (Next Up)
- [x] **Atoms**: Convert `components/atoms/*.js` -> `*.tsx` (Completed `Button.tsx`)
- [x] **Molecules**: Convert `components/molecules/*.js` -> `*.tsx` (All 6 molecules migrated + Icons lib)
- [ ] **Organisms**: Convert `components/organisms/*.js` -> `*.tsx`

### Phase 4: Library Replacement
- [ ] Uninstall/Delete `lib/` folder scripts
- [ ] Install NPM equivalents (`mathlive`, `d3`, `function-plot`, etc.)

---

## 🐛 Known Issues & Notes
- **Legacy imports**: We currently support legecy imports by exposing `window.process` in `index.html`.
- **CSS**: We are temporarily importing the legacy `main.css` inside `src/index.css`. This should be refactored as we move components.
- **Compute Engine**: The `compute-engine.js` file was moved to `src/lib/` to handle dynamic imports correctly in Vite. The `public/lib` folder still contains other legacy libs.
