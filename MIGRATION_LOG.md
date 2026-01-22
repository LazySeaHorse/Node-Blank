# Migration Log: Vanilla JS -> Preact + Vite + Tailwind

**Objective**: Migrate the existing "Vanilla JS Component Factory" application to a modern **Preact + Vite + Tailwind CLI** stack to improve performance, code density, and AI-maintainability.

**Current Status**: Phase 1 (Infrastructure & Build System) - **COMPLETE** ✅
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

### Phase 2: Core Application Shell (Next Up)
- [ ] Rename `index.html` -> `index.original.html` (Backup)
- [ ] Create new `index.html` (Vite entry point) - *Partially done in P1*
- [ ] Create `src/App.jsx` (Root Preact Component) - *Done in P1 (Wrapper)*
- [ ] Migrate `state/appState.js` to NPM imports (remove CDN) - *Done in P1*
- [ ] Convert `MathCanvasApp` class in `app.js` to a functional Component

### Phase 3: Component Migration (The Big Shift)
- [ ] **Atoms**: Convert `components/atoms/*.js` -> `*.jsx`
- [ ] **Molecules**: Convert `components/molecules/*.js` -> `*.jsx`
- [ ] **Organisms**: Convert `components/organisms/*.js` -> `*.jsx`

### Phase 4: Library Replacement
- [ ] Uninstall/Delete `lib/` folder scripts
- [ ] Install NPM equivalents (`mathlive`, `d3`, `function-plot`, etc.)

---

## 🐛 Known Issues & Notes
- **Legacy imports**: We currently support legecy imports by exposing `window.process` in `index.html`.
- **CSS**: We are temporarily importing the legacy `main.css` inside `src/index.css`. This should be refactored as we move components.
- **Compute Engine**: The `compute-engine.js` file was moved to `src/lib/` to handle dynamic imports correctly in Vite. The `public/lib` folder still contains other legacy libs.
