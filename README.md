# Node-Blank

A lightweight, in-browser personal canvas where you can throw down whatever you're working on. Math, markdown, videos, code, graphs... you name it!

[![fgjnhfgcv.jpg](https://i.postimg.cc/br5WzVbH/fgjnhfgcv.jpg)](https://postimg.cc/JHbPxqpG)

### What is this?
Node-Blank is a desktop-first infinite canvas that focuses on a snappy, offline-first experience specifically optimized for mouse and keyboard users. It serves as a digital scratchpad where various types of content—from LaTeX formulas to interactive graphs—can be arranged freely in a 2D space.

### Why did I make this?
I wanted a LiquidText/Margin Note 4-like experience that didn't feel heavy and wasn't tethered to a specific ecosystem or tablet hardware (I'm a mouse and keyboard guy). It started as a simple way to jot down math expressions and markdown side-by-side, but it has since matured into a robust tool with close to a dozen node types. The goal was to create something that stays out of your way and lets you think.

### Features
- **Lots of Node Types**: Support for Math (LaTeX), Markdown, Images, Videos, Tables, Code (Script), and Dynamic Graphs.
- **Multiple Canvases**: Organize different projects or thoughts into separate infinite workspaces via the Canvas Manager.
- **Desktop Optimized**: Fine-tuned for keyboard shortcuts and precise mouse navigation using D3.js.
- **Muh Privacy!!!**: All data is stored locally in your browser’s IndexedDB. No cloud sync means no one is looking at your data but you.
- **Import/Export**: Move your data in and out via JSON (supports single canvas, selected nodes, or your entire library).
- **Dark Mode**: Because what self-respecting dev tool doesn't have a dark mode?
- **Lightweight Build**: Just Preact Signals for state management and vanilla JS for the canvas.
- **Always Free**: This will always be free. Unless a miracle happens, there will be no real-time collaborative features or centralized sign-ins.

### Tech Stack
- **State Management**: Preact Signals for reactive, high-performance UI updates.
- **Styling**: Tailwind CSS for consistent, modern design.
- **Math & Rendering**: MathLive (editing), KaTeX (rendering), and Marked.js (markdown).
- **Navigation**: D3.js for smooth infinite canvas zooming and panning.
- **Graphing**: Function Plot + D3 for interactive mathematical visualizations.

### Roadmap
- [x] **Code node**
- [x] **Video node**
- [x] **Add/Remove nodes from toolbar**
- [x] **Migrate to Tailwind**
- [x] **Dark mode**
- [x] **Migrate to Preact**
- [x] **Smoother navigation using D3**
- [ ] **Fix touchpad navigation**
- [ ] **Global search**
- [ ] **Themes!**
- [ ] **PDF node**
- [ ] **Link 2+ nodes**
- [ ] **Node groups**
- [ ] **Make it a PWA**
- [ ] **Stop using Tailwind via CSS**
- [ ] **Import export via QR**
- [ ] **Encrypted saves**
- [ ] **Bring-your-own Firebase cloud saves**
- [ ] **Drawings on canvas**
- [ ] **Export PDF**
- [ ] **AI features? idk**