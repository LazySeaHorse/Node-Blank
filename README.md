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
- **Lots of Node Types**: Support for Math (LaTeX), Markdown, Images, Videos, Tables, Code (Script), Spreadsheets, and Dynamic Graphs.
- **Multiple Canvases**: Organize different projects or thoughts into separate infinite workspaces via the Canvas Manager.
- **Desktop Optimized**: Fine-tuned for keyboard shortcuts and precise mouse navigation using D3.js.
- **Privacy First**: All data is stored locally in your browser’s IndexedDB. No cloud sync means no one is looking at your data but you.
- **Import/Export**: Move your data in and out via JSON (supports single canvas, selected nodes, or your entire library).
- **Dark Mode**: Built-in dark mode support.
- **Modern Tech Stack**: Rebuilt with Preact, TypeScript, and Vite for high performance.
- **Always Free**: No subscriptions, no login walls.

### Tech Stack
- **Framework**: Preact + Vite
- **Language**: TypeScript
- **State Management**: Preact Signals
- **Styling**: Tailwind CSS v4
- **Math & Logic**: MathLive, KaTeX, CortexJS Compute Engine
- **Visualization**: D3.js, Function Plot
- **Data**: Jspreadsheet CE, Marked.js

### Getting Started

Prerequisites: Node.js installed.

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

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
- [ ] **Fix touchpad navigation**
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