# Node Blank

A browser-based infinite canvas where users create, arrange, edit, search, and persist mixed-content nodes (math, text, graphs, tables, spreadsheets, code, images, and video) entirely on local storage.

## Primary personas

- **Individual thinker / student**
  - Goal: capture formulas, notes, and visual aids in one spatial workspace.
- **Researcher / analyst**
  - Goal: organize multiple topic-specific canvases and quickly retrieve content with search.
- **Technical user / developer**
  - Goal: run quick JavaScript snippets in-place and combine outputs with other notes.
- **Privacy-focused offline user**
  - Goal: keep all data local, export/import manually, and avoid account/cloud dependencies.

## Core user journeys

### Persona: Individual thinker / student

#### Journey 1: Create and edit math content

1. User opens the app.
2. System opens the most recently modified saved canvas; if none exist, it creates and opens a canvas named **"Untitled Canvas"**.
3. User double-clicks empty canvas space.
4. A new node is created at click position using the currently selected tool mode (default initial mode is math).
5. In math mode, node shows an editable math field immediately available for formula entry.
6. User types LaTeX-style math expressions.
7. On focus, the node becomes selected (selection styling visible).
8. User can add a new line inside math input with **Shift+Enter**.
9. User can drag selected node(s) by grabbing non-interactive node area.
10. User can select multiple nodes via drag-selection rectangle on empty canvas.
11. User can remove selected node(s) with **Delete** (unless focus is inside input/textarea/math field).
12. Save outcomes:
    - Automatic save occurs roughly every 60 seconds.
    - Manual save via top action button temporarily changes that button text to **"Saved!"** for ~1 second.

Validation and failure states:
- No blocking validation on math input text at entry time.
- Invalid math expressions are kept as entered; behavior depends on node type:
  - Math node: content is preserved as typed.
  - Math+ node: invalid lines show warning indicator (**⚠**) with error tooltip.

#### Journey 2: Write markdown notes with inline math

1. User switches mode to **Text**.
2. User double-clicks empty canvas to create text node.
3. Node initially displays sample helper text.
4. User double-clicks that node to enter edit mode.
5. Preview is replaced by textarea.
6. User enters markdown and math delimiters (`$...$` inline, `$$...$$` block).
7. User clicks outside (blur).
8. Textarea hides; rendered preview reappears.

Validation and failure states:
- Markdown is permissive (no hard validation errors shown).
- Math rendering errors inside markdown show visible inline text badge: **"Math Error"**.
- If user does not blur, edited content remains in textarea and is not committed to preview yet.

### Persona: Researcher / analyst

#### Journey 3: Manage multiple canvases

1. User clicks **Canvases** (folder icon) in header.
2. Modal opens titled **"My Canvases"**.
3. User sees list sorted by most recent modification time.
4. User actions per canvas:
   - **Load**: switches to that canvas and closes modal.
   - **Rename**: prompt **"New name:"** prefilled with current name.
   - **Delete**: confirmation **`Delete "<name>"? This cannot be undone.`**.
5. User may create new canvas using **"+ New Canvas"**.
6. Prompt appears: **"Canvas name:"** with default **"Untitled Canvas"**.
7. On confirm, current canvas is saved first, then new canvas is created and loaded.

Validation and failure states:
- Empty/Cancel on create prompt: no canvas created.
- Empty/Cancel on rename prompt: no rename.
- Rename to same value: no change.
- Delete only proceeds after explicit confirmation.

#### Journey 4: Search across nodes

1. User opens search via search icon (top-left) or **Ctrl/Cmd+F**.
2. Expanded search box shows placeholder **"Search..."**.
3. User types query.
4. System performs case-insensitive substring matching against each node’s textual content payload.
5. UI updates while typing:
   - Match counter appears as **"N found"**.
   - Non-matches visually dim (lower opacity + grayscale).
   - Matches stay full opacity and are visually prioritized.
   - Camera auto-animates (~1 second) to frame all matches with padding.
6. User clicks clear icon (X) to clear query and keep search open.
7. User presses **Escape** to close search and clear query.

Validation and failure states:
- Empty query: all nodes restore normal appearance; no auto-frame.
- No matches: counter shows **"0 found"**; no auto-frame animation.

### Persona: Technical user / developer

#### Journey 5: Run JavaScript in script node

1. User switches mode to **Script**.
2. User double-clicks empty canvas to create script node.
3. Node contains:
   - Header title **"JS SANDBOX"**
   - **Run** button
   - **Clear** button
   - Code editor area
   - Console output panel
4. User edits code.
5. User clicks **Run**.
6. Console logs line **"> Running script..."**.
7. Script executes in isolated worker context.
8. Console methods (`log`, `error`, `warn`, `info`) append formatted output lines.

Validation and failure states:
- Runtime errors show as console error lines (prefixed with `>`).
- `Clear` empties output and terminates running worker.
- Code text is persisted when editor loses focus (blur).

### Persona: Privacy-focused offline user

#### Journey 6: Export/import data

1. User opens **Export** dropdown.
2. Options:
   - **Selected Nodes**
   - **Current Canvas**
   - **All Canvases**
3. System downloads JSON file with timestamped filename.
4. User opens **Import** dropdown.
5. Options:
   - **Append Nodes**
   - **Single Canvas**
   - **All Canvases**
6. User selects `.json` file.
7. Import behaviors:
   - Append Nodes: nodes are added to current canvas and auto-selected.
   - Single Canvas: creates a new canvas from imported data and loads it.
   - All Canvases: imports library set, with conflict-resolution dialog if IDs collide.

Validation and failure states and exact messages:
- Single-canvas import invalid JSON: **"Invalid JSON file"**
- Single-canvas unsupported version: **"Unsupported file version"**
- Node import invalid structure/version: **"Invalid nodes export file"**
- Node import with no nodes: **"No nodes found in file"**
- All-canvases unsupported format: **"Unsupported export format"**
- All-canvases general failure: **"Failed to import canvases"**
- All-canvases export failure: **"Failed to export canvases"**
- On conflict cancellation: **"Import cancelled"**
- On successful all-canvas import: **`Import complete!\nImported: X canvas(es)`**

## Feature catalog

### Feature: Infinite canvas navigation and spatial editing

- **Purpose and value**
  - Lets users organize mixed content spatially with pan/zoom and free placement.

- **Inputs required**
  - Mouse interactions:
    - Double-click empty canvas: create node.
    - Wheel: zoom.
    - Middle mouse drag: pan.
    - Left drag on empty area: selection rectangle.
    - Left drag on node non-interactive area: move selected node(s).

- **Outputs and visible results**
  - Grid background scales and shifts with camera.
  - Zoom indicator updates as integer percent (e.g., `100%`).
  - Selected nodes show selection highlight.

- **Business rules / validations / edge cases**
  - Zoom limits for direct zoom interaction: minimum 10%, maximum 500%.
  - Search auto-frame zoom clamps between 10% and 200%.
  - Node drag delta is scale-adjusted (consistent world movement under zoom).
  - Selection rectangle intersects node visual bounds to build multi-selection.
  - Double-click zoom shortcut is disabled.
  - Browser context menu is suppressed on empty canvas background.

- **Permissions / access differences**
  - None; all users have full access.

### Feature: Tool modes and node creation

- **Purpose and value**
  - Enables quick creation of different node types from one workspace.

- **Inputs required**
  - Mode selection (toolbar or More menu) for: Math, Math+, Text, Graph, Table, Sheet, Script.
  - Action tools: Image upload and Video embed prompt.

- **Outputs and visible results**
  - Selected mode appears active in toolbar.
  - New node type created on canvas double-click.
  - Default starter content per node type:
    - Text: instructional markdown/math message.
    - Graph: `x^2`
    - Table: 3x3 empty grid.
    - Spreadsheet: empty grid (minimum 5x5).
    - Script: starter JavaScript sample.
    - Math+: empty expression.

- **Business rules / validations / edge cases**
  - Mode persists in session state; current mode determines double-click-created node type.
  - Image/video tools are immediate actions (not sticky modes).

- **Permissions / access differences**
  - On narrow/mobile layouts, primary mode selector and More menu are hidden; effective node creation may stay on current mode.

### Feature: Math node

- **Purpose and value**
  - Free-form math notation entry.

- **Inputs required**
  - Math text via math input field.

- **Outputs and visible results**
  - Equation content displayed in math field.

- **Business rules / validations / edge cases**
  - Shift+Enter inserts line break.
  - Focus selects node.
  - No explicit blocking errors shown.

- **Permissions / access differences**
  - None.

### Feature: Math+ node (evaluated math)

- **Purpose and value**
  - Evaluates expressions line-by-line and shows results alongside input.

- **Inputs required**
  - Math expression lines, including assignments.

- **Outputs and visible results**
  - Right-side result column with `=` prefixes.
  - Assignment lines show checkmark (`✓`) with tooltip **"Variable defined"**.
  - While compute engine unavailable: **"Loading..."**.
  - Invalid lines show warning symbol (**⚠**).

- **Business rules / validations / edge cases**
  - Multi-line input split on LaTeX line breaks (`\\`).
  - Empty line yields placeholder (`...`).
  - Assignment variables persist and are available to later evaluations globally.
  - Shift+Enter inserts line break.

- **Permissions / access differences**
  - None.

### Feature: Text node (markdown + math preview)

- **Purpose and value**
  - Mixed rich notes with markdown formatting and embedded math.

- **Inputs required**
  - Markdown text and optional LaTeX delimiters.

- **Outputs and visible results**
  - Read-mode rendered preview (headings, lists, code styles, blockquotes).
  - Edit-mode textarea on double-click.

- **Business rules / validations / edge cases**
  - Save occurs on blur, not per keystroke.
  - Render fallback for math parsing failure: visible **"Math Error"** badge.

- **Permissions / access differences**
  - None.

### Feature: Graph node

- **Purpose and value**
  - Visualizes 2D function expression quickly.

- **Inputs required**
  - Expression text in `f(x)=` input.

- **Outputs and visible results**
  - 2D graph panel updates shortly after typing.
  - Input placeholder: `x^2`.

- **Business rules / validations / edge cases**
  - Invalid expressions fail silently during typing (graph may not update).
  - Graph redraws after theme changes.
  - Mouse wheel over graph is isolated from canvas zoom.

- **Permissions / access differences**
  - None.

### Feature: Table node

- **Purpose and value**
  - Structured small data/matrix entry with per-cell math input.

- **Inputs required**
  - Cell values (math-capable entries).
  - Row/column adjustments via header controls.

- **Outputs and visible results**
  - Header title **TABLE** with controls:
    - `Row` with `−` and `+`
    - `Col` with `−` and `+`
  - Editable grid cells.

- **Business rules / validations / edge cases**
  - Minimum size is 1 row and 1 column.
  - Shift+Enter moves to next cell (or first cell of next row).
  - Tab and Shift+Tab move horizontally within current row.
  - Content persists as structured rows/cols/cells data.
  - Invalid stored table payload falls back to default 3x3 table.

- **Permissions / access differences**
  - None.

### Feature: Spreadsheet node

- **Purpose and value**
  - Larger spreadsheet-style editing with formulas and selections.

- **Inputs required**
  - Cell edits, row/column operations, formula entries via spreadsheet interactions.

- **Outputs and visible results**
  - Header title **SPREADSHEET** with formula display bar (`fx`).
  - Formula bar shows value/formula of selected cell.
  - Spreadsheet grid with row/column headers and selection highlight.

- **Business rules / validations / edge cases**
  - Minimum dimensions 5x5.
  - Data syncs after edits and structural actions (insert/delete/move/sort/undo/redo).
  - If stored content invalid, fallback to small empty matrix.

- **Permissions / access differences**
  - None.

### Feature: Script node

- **Purpose and value**
  - Local JavaScript experimentation inside canvas.

- **Inputs required**
  - JavaScript code in editor.
  - Buttons: **Run**, **Clear**.

- **Outputs and visible results**
  - Console panel with line-prefixed outputs (`> ...`).
  - Severity styling for errors/warnings.

- **Business rules / validations / edge cases**
  - New run terminates previous worker before executing.
  - `Clear` clears output and terminates worker.
  - Returned expression value is auto-logged if not `undefined`.
  - Runtime exceptions displayed as error strings.

- **Permissions / access differences**
  - None.

### Feature: Image node

- **Purpose and value**
  - Place uploaded images on canvas.

- **Inputs required**
  - File picker accepting `image/*`.

- **Outputs and visible results**
  - New resizable image node inserted near current viewport origin offset.

- **Business rules / validations / edge cases**
  - If no file selected, no action.
  - Image is scaled down proportionally if width or height exceeds 800px.
  - Initial node dimensions use processed image dimensions.

- **Permissions / access differences**
  - None.

### Feature: Video node

- **Purpose and value**
  - Embed videos from supported URLs or embed code.

- **Inputs required**
  - Prompt text:  
    **`Enter video URL:\n\n• YouTube: youtube.com/watch?v=...\n• Vimeo: vimeo.com/...\n• Or paste embed code`**

- **Outputs and visible results**
  - Resizable iframe video node.

- **Business rules / validations / edge cases**
  - Cancel/blank prompt => no node.
  - URL parsing rules:
    - YouTube watch/share/embed formats converted to embed URL.
    - Vimeo numeric URL converted to player URL.
    - If iframe HTML supplied, extracted `src` used.
    - If plain `http(s)` URL and not matched above, used directly.
    - Otherwise treated as YouTube video ID.
  - During drag/canvas-interaction, iframe pointer events are suppressed to prevent interaction conflicts.

- **Permissions / access differences**
  - None.

### Feature: Selection, duplication, deletion

- **Purpose and value**
  - Fast node manipulation and layout operations.

- **Inputs required**
  - Click, drag-select, keyboard shortcuts.

- **Outputs and visible results**
  - Selected node(s) highlighted.
  - Duplicate command creates offset copies (+30px x, +30px y) and selects new copies.

- **Business rules / validations / edge cases**
  - **Ctrl/Cmd+D** duplicates all selected nodes.
  - **Delete** removes selected nodes unless user is typing in input/textarea/math field.
  - **Escape** clears selection when search is not active.

- **Permissions / access differences**
  - None.

### Feature: Search overlay

- **Purpose and value**
  - Find and spatially focus relevant nodes quickly.

- **Inputs required**
  - Query string.

- **Outputs and visible results**
  - Search panel expands/collapses with animation.
  - Counter displays **"N found"** when query non-empty.

- **Business rules / validations / edge cases**
  - Match source is node content strings.
  - Query trim + lowercase used for matching.
  - Auto-focus behavior when search opens.
  - **Escape** closes and clears search.

- **Permissions / access differences**
  - On mobile with open search, header condenses to menu button so search can be exited.

### Feature: Canvas manager

- **Purpose and value**
  - Organize work into named canvases.

- **Inputs required**
  - Create name prompt, rename prompt, load/delete actions.

- **Outputs and visible results**
  - Modal with title **"My Canvases"**, list entries, relative timestamps:
    - **Just now**
    - **X min ago**
    - **X hour(s) ago**
    - **Yesterday**
    - **X days ago**
    - locale date for older entries

- **Business rules / validations / edge cases**
  - Loading one canvas saves current canvas first.
  - New canvas creation also saves current first.
  - Deleting is permanent and confirmed.

- **Permissions / access differences**
  - None.

### Feature: Import/export

- **Purpose and value**
  - Backup, transfer, and merge data.

- **Inputs required**
  - Import type and `.json` file.

- **Outputs and visible results**
  - Downloaded files with timestamp names:
    - Current canvas: `<canvas-name-sanitized>-<timestamp>.json`
    - Selected nodes: `nodes-<count>-<timestamp>.json`
    - All canvases: `all-canvases-<timestamp>.json`

- **Business rules / validations / edge cases**
  - Selected-node export does nothing if nothing selected.
  - Node import regenerates node IDs to avoid collisions on current canvas.
  - Single-canvas import creates a *new* canvas rather than overwriting current one.
  - All-canvases import conflict dialog offers:
    - **Replace Existing**
    - **Auto-Rename** (adds ` (imported)` suffix)
    - **Cancel**

- **Permissions / access differences**
  - None.

### Feature: Toolbar customization

- **Purpose and value**
  - User controls which tools appear in main toolbar vs More menu.

- **Inputs required**
  - **Configure Toolbar...** action.
  - Move controls between lists.
  - Footer actions: **Reset to Defaults**, **Cancel**, **Save Changes**.

- **Outputs and visible results**
  - Modal title **"Customize Toolbar"**.
  - Two columns: **Main Toolbar** and **More Menu**.
  - Changes reflected in header after save.

- **Business rules / validations / edge cases**
  - Cancel closes without applying pending list edits.
  - Reset reverts to default distribution before save.
  - Saved config persists across sessions.

- **Permissions / access differences**
  - None.

### Feature: Theme toggle

- **Purpose and value**
  - Switch between light and dark display styles.

- **Inputs required**
  - Toggle button (sun/moon icon), title **"Toggle Dark Mode"**.

- **Outputs and visible results**
  - Immediate visual theme change across canvas, nodes, controls, spreadsheet styling, and graph colors.

- **Business rules / validations / edge cases**
  - First load default is stored theme, else system preference.
  - Selection is persisted and reused on next visit.

- **Permissions / access differences**
  - None.

### Feature: Zoom controls

- **Purpose and value**
  - Precise zoom and quick view reset controls.

- **Inputs required**
  - `+` button: zoom in.
  - `-` button: zoom out.
  - Click zoom percentage once: reset zoom while preserving current center point.
  - Double-click zoom percentage: full view reset (zoom=100%, pan=0,0).

- **Outputs and visible results**
  - Zoom indicator text like `100%`.
  - Animated transitions for reset behaviors.

- **Business rules / validations / edge cases**
  - Zoom/pan animations are canceled on user interaction (e.g., mouse down).

- **Permissions / access differences**
  - None.

## Data interactions (user-facing)

### Data accepted

- Math expressions (math and math+ nodes).
- Markdown and plain text.
- Graph function expressions (e.g., `sin(x)`, `x^2+3*x`).
- Table/spreadsheet cell values and formulas.
- JavaScript code.
- Image files (`image/*`).
- Video URLs / embed snippets.
- JSON import files for nodes, single canvas, or full library.

### Data produced and displayed

- Visual nodes on canvas with position, stacking order, dimensions (where applicable), and content.
- Canvas metadata (name, last modified) in canvas manager.
- Search match count and filtered visual states.
- Script execution output log lines.
- Math+ evaluated result lines.

### Data exported

1. **Selected nodes export**
   - JSON contains version/type metadata and `fields` array.
   - Example shape:
     ```json
     {
       "version": 4,
       "type": "nodes",
       "exportedAt": 1760000000000,
       "nodeCount": 2,
       "fields": [{ "id": "...", "type": "text", "content": "..." }]
     }
     ```

2. **Current canvas export**
   - JSON includes view state and node list.
   - Example shape:
     ```json
     {
       "version": 4,
       "canvasName": "Physics Notes",
       "exportedAt": 1760000000000,
       "scale": 1,
       "pan": { "x": 0, "y": 0 },
       "fields": [],
       "zIndexCounter": 12
     }
     ```

3. **All canvases export**
   - JSON contains full library with metadata + data per canvas.
   - Example shape:
     ```json
     {
       "version": 1,
       "exportedAt": 1760000000000,
       "canvasCount": 2,
       "canvases": [
         {
           "metadata": { "id": "canvas-...", "name": "Work", "lastModified": 1760000000000 },
           "data": { "canvasId": "canvas-...", "pan": { "x": 0, "y": 0 }, "scale": 1, "fields": [], "zIndexCounter": 1 }
         }
       ]
     }
     ```

### Validation and user-visible errors

- Invalid JSON parse: **"Invalid JSON file"**.
- Unsupported single-canvas file version: **"Unsupported file version"**.
- Invalid node-export file: **"Invalid nodes export file"**.
- Nodes file with empty node list: **"No nodes found in file"**.
- Unsupported all-canvas format: **"Unsupported export format"**.
- Import failure: **"Failed to import canvases"**.
- Export failure: **"Failed to export canvases"**.

### Data persistence and presentation

- All app data is local to browser storage.
- Canvas state includes camera (pan/zoom), nodes, and stacking counter.
- Tool layout preferences and theme preference persist between sessions.

## External integrations (user-visible effects)

### Browser local storage and IndexedDB

- **What user experiences**: data remains available after reload on same browser/device profile.
- **Trigger**: startup load, auto-save, manual save, canvas operations.
- **Failure appearance**: operations may fail silently in some paths; import/export paths show explicit alerts on failures.

### Local file system (import/export)

- **What user experiences**: file download prompts on export; file picker on import.
- **Trigger**: Export/Import menu actions.
- **Failure appearance**: alert dialogs listed above.

### Embedded video providers (YouTube/Vimeo/custom URL)

- **What user experiences**: iframe-based video playback inside node.
- **Trigger**: adding video node via prompt.
- **Failure appearance**: if URL/provider blocks embedding, iframe may display provider-side error/blank player.

### JavaScript worker runtime

- **What user experiences**: script output appears in node console without freezing main editing experience.
- **Trigger**: Run button in script node.
- **Failure appearance**: error lines in output panel.

## Navigation and information architecture

### Main screens / regions

- **Canvas area**: infinite workspace with grid background.
- **Top-left**: Search overlay.
- **Top-right header panel**:
  - Canvases button
  - Main toolbar tools (desktop)
  - More tools menu (desktop)
  - Action buttons: Undo, Export, Import, Save
- **Bottom-right controls**:
  - Theme toggle
  - Zoom control
- **Modals**:
  - Canvas manager
  - Toolbar configuration
  - Conflict dialog (all-canvas import)

### Movement between areas

- User remains on single-page canvas experience.
- Context switches happen through overlays/modals rather than page navigation.

### Key action locations

- Node creation: canvas double-click.
- Canvas switching/management: folder button.
- Import/export/save: header action buttons.
- Search: top-left search icon or Ctrl/Cmd+F.
- View controls: bottom-right zoom and theme.

## States and flows matrix

| Area / feature | Empty state | Loading state | Success state | Error state |
|---|---|---|---|---|
| App startup | No canvases: auto-creates **Untitled Canvas** | Initial DB + canvas load | Most recent canvas rendered | If persistence fails, behavior is not clearly surfaced in main UI |
| Canvas manager list | **No canvases yet. Create one to get started.** | **Loading...** | Canvas cards with Load/Rename/Delete | No dedicated inline error UI |
| Search | Closed compact icon | N/A | Query filters nodes, shows **N found**, optional auto-frame | No explicit message for no results beyond `0 found` |
| Text node | Default sample text | N/A | Rendered markdown/math preview | Math parse issues render **Math Error** badges |
| Math+ node | Blank right panel when empty input | **Loading...** while compute engine unavailable | Evaluated results per line, assignments marked ✓ | Invalid lines show ⚠ |
| Graph node | Default `x^2` | Brief redraw lag (~50ms debounce) | Graph plotted in panel | Invalid input can produce no graph update and no explicit error text |
| Import nodes | N/A | File read parsing | Nodes appended + selected | Alerts: invalid file / no nodes / invalid JSON |
| Import single canvas | N/A | File read parsing | New canvas created and loaded | Alerts: unsupported version / invalid JSON |
| Import all canvases | N/A | Conflict check + import | Success alert with imported count | Alerts: unsupported format / cancelled / failed import |
| Export actions | No selected nodes -> no action for selected export | Data serialization | File download starts | All-canvas export failure alert |
| Script node run | Empty console | Run starts with `> Running script...` | Console output lines | Runtime errors shown in console output |

## Example sessions

### Session 1 (successful): Student builds mixed math/notes board

- **Persona**: Individual thinker / student
- **Starting state**: first app launch, no existing canvases
- **Steps and responses**:
  1. Open app.
     - System creates and opens **Untitled Canvas**.
  2. Double-click canvas.
     - Math node appears.
  3. Enter `E=mc^2`.
     - Content persists in node.
  4. Switch to **Text** mode.
  5. Double-click canvas to create text node.
  6. Double-click text node to edit; type markdown with `$a^2+b^2=c^2$`; click outside.
     - Node renders markdown and inline formula.
  7. Click **Save**.
     - Save button text becomes **"Saved!"** briefly.
- **Final state**: two nodes saved to local canvas.

### Session 2 (mixed success/failure): Analyst imports all canvases with conflicts

- **Persona**: Researcher / analyst
- **Starting state**: existing canvases already present
- **Steps and responses**:
  1. Click **Import** → **All Canvases**; choose JSON with overlapping canvas IDs.
  2. Conflict dialog appears titled **"Canvas Conflicts Detected"**, listing names and offering:
     - **Replace Existing**
     - **Auto-Rename**
     - **Cancel**
  3. User clicks **Cancel**.
     - Alert: **"Import cancelled"**.
  4. Repeat import; choose **Auto-Rename**.
     - Alert: **`Import complete!\nImported: X canvas(es)`**.
- **Final state**: imported canvases added with ` (imported)` suffix where conflicts existed.

### Session 3 (failure-focused): Invalid node import file

- **Persona**: Privacy-focused user
- **Starting state**: active canvas open
- **Steps and responses**:
  1. Click **Import** → **Append Nodes**.
  2. Select malformed JSON file.
  3. System attempts parse.
  4. Alert appears: **"Invalid JSON file"**.
- **Final state**: no nodes appended; canvas unchanged.

### Session 4 (successful with edge behavior): Developer uses script and duplicates nodes

- **Persona**: Technical user
- **Starting state**: canvas with one script node selected
- **Steps and responses**:
  1. In script node, type `console.log('ok'); 2+2`.
  2. Click **Run**.
     - Console shows `> Running script...`, `> ok`, `> 4`.
  3. Press **Ctrl/Cmd+D**.
     - Duplicate node appears offset by ~30px in both directions and is selected.
  4. Press **Delete** while not focused in an editor.
     - Selected duplicate is removed.
- **Final state**: original node remains; duplicate deleted.

## Acceptance criteria checklist

### App initialization and persistence

- [ ] On first launch with no saved canvases, app creates/open canvas named **Untitled Canvas**.
- [ ] On subsequent launches, app opens most recently modified canvas.
- [ ] Canvas content, camera state, and stacking persist across reloads in local browser storage.
- [ ] Auto-save occurs approximately every 60 seconds.
- [ ] Manual save visibly changes button text to **Saved!** temporarily.

### Canvas interactions

- [ ] Double-clicking empty canvas creates a node of current mode at clicked location.
- [ ] Middle mouse drag pans canvas.
- [ ] Wheel zoom works and updates zoom indicator.
- [ ] Selection rectangle selects intersecting nodes.
- [ ] Delete key removes selected nodes unless focus is in editable input/textarea/math field.
- [ ] Ctrl/Cmd+D duplicates selected nodes with offset.

### Tooling and node types

- [ ] All node types are creatable and editable: Math, Math+, Text, Graph, Table, Sheet, Script, Image, Video.
- [ ] Image upload inserts resizable image node and scales large images down proportionally to max 800px side.
- [ ] Video prompt accepts YouTube/Vimeo/embed input and creates resizable iframe node.
- [ ] Text node switches between preview and editor on double-click/blur.
- [ ] Graph node redraws based on input expression.
- [ ] Table node row/column controls enforce minimum 1x1.
- [ ] Spreadsheet node provides formula display (`fx`) for current selection.
- [ ] Script node Run/Clear behavior matches console expectations.

### Search

- [ ] Search overlay toggles open/closed from search icon.
- [ ] Ctrl/Cmd+F opens search and prevents browser find UI.
- [ ] Query filtering is case-insensitive substring match on node content.
- [ ] Query displays **N found** and visually dims non-matching nodes.
- [ ] Escape clears/closes search when search is active.

### Canvas manager

- [ ] Canvas manager modal title is **My Canvases**.
- [ ] List is sorted newest first and shows relative timestamps.
- [ ] Create canvas uses prompt **Canvas name:** with default **Untitled Canvas**.
- [ ] Rename uses prompt **New name:** prefilled current name.
- [ ] Delete uses confirmation with exact irreversible warning text.

### Import/export

- [ ] Export menu provides Selected Nodes / Current Canvas / All Canvases.
- [ ] Import menu provides Append Nodes / Single Canvas / All Canvases.
- [ ] Invalid import files show documented alert messages exactly.
- [ ] Single-canvas import creates and loads a new canvas.
- [ ] All-canvas conflicts show 3-choice dialog (Replace Existing, Auto-Rename, Cancel).

### Customization and theme

- [ ] Toolbar configuration modal supports moving tools between Main Toolbar and More Menu.
- [ ] Reset to defaults restores default layout before save.
- [ ] Saved toolbar config persists.
- [ ] Theme toggle persists and updates UI globally.

## Glossary

- **Canvas**: A named infinite workspace containing nodes plus camera state.
- **Node**: A draggable content block on the canvas.
- **Mode**: Current node type used when creating nodes via canvas double-click.
- **Action tool**: Non-mode toolbar action that immediately performs a task (e.g., image upload, video add).
- **Selected node(s)**: Node(s) currently highlighted and targeted by move/duplicate/delete operations.
- **Pan**: Camera translation offset on the canvas.
- **Scale / Zoom**: Camera magnification level.
- **Search overlay**: Expandable panel used to filter nodes by content.
- **Current canvas export**: JSON snapshot of one canvas.
- **Selected nodes export**: JSON containing only currently selected nodes.
- **All canvases export**: JSON backup of all stored canvases and metadata.
- **Conflict (import)**: Incoming all-canvas item with an ID matching an existing canvas.
- **Auto-Rename (import conflict strategy)**: Imports conflicting canvas under a new ID and name suffix ` (imported)`.
- **Replace Existing (import conflict strategy)**: Deletes existing conflicting canvas and imports replacement.
- **Tool configuration**: User-defined split of tools between visible toolbar and More menu.

## Assumptions

- The product is intended for desktop-first use; mobile is supported but has reduced header/tool visibility.
- Data persistence reliability depends on browser storage availability and permissions; where explicit failure UI is absent, user-visible outcome may be stale or missing saved data.
- Undo behavior is dependent on browser editing context and primarily affects focused editable content rather than full-canvas operation history.
- Provider-specific video playback restrictions (embedding disabled, geo restrictions, etc.) are treated as external provider behavior shown inside iframe.
- Search matches raw stored node content; for structured/binary-like payloads (for example images encoded as data URLs), matching behavior may not be practically meaningful to users.
