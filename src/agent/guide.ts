import { nodeKinds, nodeSpecs } from '@/nodes/catalog';

/** Primer returned by get_guide. One plain-text document. */
export function buildGuide(): string {
  const kinds = nodeKinds.map((k) => `- ${k}: ${nodeSpecs[k].description}.`).join('\n');
  return `Node-Blank guide for AI agents

WHAT IT IS
Node-Blank is an infinite canvas of free-floating nodes (no edges): notes, math, graphs, tables, spreadsheets,
scripts, images and videos. You work on the one canvas open in the user's tab.

NODE KINDS
${kinds}

FIELDS (create_nodes takes them flat next to "kind"; update_nodes "set" replaces them)
- text: markdown. Markdown with $inline$ and $$display$$ LaTeX.
- math: latex. Typeset only.
- mathPlus: latex. Each line (separated by \\\\) is evaluated; "a := 2" defines a variable that later Math+
  nodes can use. Math+ nodes are evaluated in reading order (top to bottom, then left to right), so position matters.
  read_nodes shows each line's result after ⟶.
- graph: functions, a list of functions of x such as "x^2" or "\\sin(x)".
- table: cells, rows of LaTeX math cells.
- sheet: cells, rows of spreadsheet cells; formulas start with "=" and use A1 references (=SUM(A1:A3)).
- code: source, JavaScript. run_code runs it in a sandbox and returns console output and the last value.
- video: url, a YouTube/Vimeo link or https embed URL.
- image: uploaded by the user; you can move, resize or delete images but not create them or see them.

LAYOUT
- Coordinates are canvas pixels; x grows right, y grows down. Positions are top-left corners.
- Groups are nearby nodes, recomputed from positions whenever you read. Handles like g2 stay stable while a group
  keeps most of its nodes. They are invisible to the user.
- Let the app place new nodes (near, group) unless you need an exact layout. Keep related nodes together.

HANDLES
Nodes are n1, n2, ... and groups g1, g2, ... for this session. Full ids also work.

WORKFLOW
1. get_overview (small, fixed size) for counts, groups and the selection. "This" or "these" usually means the selection.
2. list_nodes for a group, area, selection or what is on screen; search_nodes to find text.
3. read_nodes only for nodes you need in full.
4. Edit: prefer update_nodes edits (exact find/replace) or cells over resending whole fields.
   Batch related changes into one call: each write call is one undo step for the user.
5. focus_nodes to show the user what you changed. undo if a change was wrong.

The user sees your edits live and cannot edit while you are working. Read a failed call's error; it says what to change.`;
}
