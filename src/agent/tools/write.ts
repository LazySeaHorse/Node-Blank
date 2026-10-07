import { z } from 'zod';
import { besideCandidates, boundsOf, CLUSTER_PADDING, findFreeSpot, type Rect } from '@/lib/clusters';
import { setCell } from '@/lib/grid';
import type { AppNode, NodeDataMap, NodeKind } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { toEmbedUrl } from '@/nodes/video/embedUrl';
import { redo, undo, useCanvasStore } from '@/store/canvasStore';
import { nodeRect } from '@/store/groups';
import { alias } from '../aliases';
import { defineTool } from '../defineTool';
import { ToolError } from '../errors';
import { parseCellRef } from '../format';
import {
  canvasNodes,
  commitAiWrite,
  currentGroups,
  groupHandleSchema,
  handleSchema,
  plural,
  requireGroup,
  requireNode,
  viewportRect,
} from './shared';

const MAX_GRID = { rows: 200, cols: 52 };
/** Kinds whose size can be set; the others size to their content. */
const RESIZABLE = new Set<NodeKind>(['code', 'graph', 'video']);

const cellsSchema = z
  .array(z.array(z.string().max(2000)).max(MAX_GRID.cols))
  .min(1)
  .max(MAX_GRID.rows);
const content = {
  text: { markdown: z.string().max(100_000).describe('Markdown; $...$ and $$...$$ for LaTeX math.') },
  math: { latex: z.string().max(20_000).describe('LaTeX, typeset only.') },
  mathPlus: {
    latex: z
      .string()
      .max(20_000)
      .describe(
        'LaTeX evaluated line by line; separate lines with \\\\. "a := 2" defines a shared variable.',
      ),
  },
  graph: {
    functions: z
      .array(z.string().max(500))
      .min(1)
      .max(20)
      .describe('Functions of x, e.g. "x^2", "\\sin(x)".'),
  },
  table: { cells: cellsSchema.describe('Rows of cells, each a LaTeX math expression.') },
  sheet: { cells: cellsSchema.describe('Rows of cells; formulas start with "=" and use A1 references.') },
  code: { source: z.string().max(100_000).describe('JavaScript, run in a sandboxed worker.') },
  video: { url: z.string().max(2000).describe('YouTube or Vimeo link, or another https embed URL.') },
} satisfies { [K in Exclude<NodeKind, 'image'>]: Record<keyof NodeDataMap[K], z.ZodType> };

const placementShape = {
  near: handleSchema.optional().describe('Place next to this node (right of it, else below).'),
  group: groupHandleSchema.optional().describe('Place next to the nodes of this group.'),
  x: z.number().optional().describe('Exact position; omit to let the app find free space.'),
  y: z.number().optional(),
  width: z
    .number()
    .min(40)
    .max(4000)
    .optional()
    .describe('code, graph and video only; others size to content.'),
  height: z.number().min(40).max(4000).optional(),
};

const newNodeSchema = z.discriminatedUnion(
  'kind',
  (Object.keys(content) as (keyof typeof content)[]).map((kind) =>
    z.object({ kind: z.literal(kind), ...content[kind], ...placementShape }),
  ) as unknown as [z.ZodObject, ...z.ZodObject[]],
);
type NewNode = { kind: Exclude<NodeKind, 'image'> } & z.infer<z.ZodObject<typeof placementShape>> &
  Record<string, unknown>;

function checkVideo(url: unknown) {
  if (typeof url === 'string' && !toEmbedUrl(url))
    throw new ToolError('invalid_url', `"${url}" is not a video or embeddable https URL.`);
}

export const createNodes = defineTool({
  name: 'create_nodes',
  title: 'Create nodes',
  description:
    'Add up to 20 nodes. Each has a kind plus its content fields. Without x/y the app places it in free space: ' +
    'next to `near`, beside the nodes of `group`, or right of everything. Nodes created in one call are placed ' +
    'one after another, so a list with the same `near` forms a row. Returns the new handles.',
  input: z.object({ nodes: z.array(newNodeSchema).min(1).max(20) }),
  readOnly: false,
  handler: ({ nodes: specs }) => {
    const { groups } = currentGroups();
    const obstacles: Omit<Rect, 'id'>[] = canvasNodes().map(nodeRect);
    const created: AppNode[] = [];

    for (const spec of specs as NewNode[]) {
      const { kind, near, group, x, y, width, height, ...data } = spec;
      if (kind === 'video') checkVideo(data.url);
      if ((width || height) && !RESIZABLE.has(kind))
        throw new ToolError('not_resizable', `${kind} nodes size to their content; omit width and height.`);
      const draft = createNode(kind, { x: 0, y: 0 }, data as Partial<NodeDataMap[typeof kind]>);
      const size = { width: width ?? nodeRect(draft).width, height: height ?? nodeRect(draft).height };

      let position: { x: number; y: number };
      if (x !== undefined && y !== undefined) position = { x, y };
      else if (near) position = findFreeSpot(size, besideCandidates(nodeRect(requireNode(near))), obstacles);
      else if (group) {
        const members = requireGroup(group, groups).nodeIds.map((id) => nodeRect(requireNode(id)));
        const candidates = [...members].reverse().flatMap((m) => besideCandidates(m));
        position = findFreeSpot(size, candidates, obstacles);
      } else if (obstacles.length > 0) {
        const all = boundsOf(obstacles.map((o) => ({ id: '', ...o })));
        position = findFreeSpot(size, [{ x: all.x + all.width + CLUSTER_PADDING, y: all.y }], obstacles);
      } else {
        const view = viewportRect();
        position = { x: view.x + (view.width - size.width) / 2, y: view.y + (view.height - size.height) / 2 };
      }

      const node = { ...draft, position, ...(RESIZABLE.has(kind) ? size : {}) } as AppNode;
      created.push(node);
      obstacles.push({ ...position, ...size });
    }

    // Appended without touching the selection, which is the user's.
    commitAiWrite(() => useCanvasStore.setState((s) => ({ nodes: [...s.nodes, ...created] })));
    const handles = created.map(
      (n) => `${alias(n.id)} ${n.type} at ${Math.round(n.position.x)},${Math.round(n.position.y)}`,
    );
    return {
      text: `Created ${handles.join('; ')}.`,
      summary: `Created ${plural(created.length, 'node')}`,
      affectedNodeIds: created.map((n) => n.id),
    };
  },
});

/** The plain-text field that find/replace edits apply to, per kind. */
const TEXT_FIELD: Partial<Record<NodeKind, string>> = {
  text: 'markdown',
  math: 'latex',
  mathPlus: 'latex',
  code: 'source',
  video: 'url',
};

const updateSchema = z.object({
  id: handleSchema,
  set: z
    .object({
      markdown: z.string().max(100_000),
      latex: z.string().max(20_000),
      source: z.string().max(100_000),
      url: z.string().max(2000),
      functions: z.array(z.string().max(500)).min(1).max(20),
      cells: cellsSchema,
    })
    .partial()
    .optional()
    .describe("Replace whole fields. Only the node kind's own fields are allowed (see create_nodes)."),
  edits: z
    .array(
      z.object({
        find: z.string().min(1),
        replace: z.string(),
        all: z.boolean().default(false).describe('Replace every match instead of requiring exactly one.'),
      }),
    )
    .max(50)
    .optional()
    .describe(
      'Exact find/replace on the text of text, math, Math+, code and video nodes. Cheaper than set for small changes.',
    ),
  cells: z
    .array(
      z.object({ cell: z.string().describe('A1-style reference, e.g. "B3".'), value: z.string().max(2000) }),
    )
    .max(500)
    .optional()
    .describe('Set table or sheet cells; the grid grows to fit.'),
});

function applyEdits(text: string, edits: { find: string; replace: string; all: boolean }[], handle: string) {
  let out = text;
  for (const { find, replace, all } of edits) {
    const count = out.split(find).length - 1;
    if (count === 0)
      throw new ToolError(
        'edit_not_found',
        `${handle}: "${find}" not found. Read the node and copy the text exactly.`,
      );
    if (count > 1 && !all)
      throw new ToolError(
        'edit_ambiguous',
        `${handle}: "${find}" matches ${count} times. Add context or pass all: true.`,
      );
    out = all ? out.split(find).join(replace) : out.replace(find, () => replace);
  }
  return out;
}

function setCells(grid: string[][], cells: { cell: string; value: string }[], handle: string) {
  let out = grid;
  for (const { cell, value } of cells) {
    const ref = parseCellRef(cell);
    if (!ref || ref.row >= MAX_GRID.rows || ref.col >= MAX_GRID.cols)
      throw new ToolError(
        'invalid_cell',
        `${handle}: "${cell}" is not a cell reference within ${MAX_GRID.cols} columns × ${MAX_GRID.rows} rows.`,
      );
    const cols = Math.max(out[0]?.length ?? 0, ref.col + 1);
    out = out.map((row) => [...row, ...Array<string>(cols - row.length).fill('')]);
    while (out.length <= ref.row) out = [...out, Array<string>(cols).fill('')];
    out = setCell(out, ref.row, ref.col, value);
  }
  return out;
}

export const updateNodes = defineTool({
  name: 'update_nodes',
  title: 'Update nodes',
  description:
    'Change the content of up to 20 nodes in one undo step: `edits` (exact find/replace, best for small changes), ' +
    '`cells` (table/sheet cells by A1 reference) or `set` (replace whole fields). All updates are checked before any is applied.',
  input: z.object({ updates: z.array(updateSchema).min(1).max(20) }),
  readOnly: false,
  handler: ({ updates }) => {
    const patches = updates.map(({ id, set, edits, cells }) => {
      const node = requireNode(id);
      const data = { ...(node.data as Record<string, unknown>) };
      for (const [key, value] of Object.entries(set ?? {})) {
        if (!(key in data))
          throw new ToolError('invalid_field', `${id} is a ${node.type} node; it has no "${key}" field.`);
        data[key] = value;
      }
      if (edits?.length) {
        const field = TEXT_FIELD[node.type];
        if (!field)
          throw new ToolError(
            'invalid_edit',
            `${id} is a ${node.type} node; use set or cells instead of edits.`,
          );
        data[field] = applyEdits(String(data[field]), edits, id);
      }
      if (cells?.length) {
        if (node.type !== 'table' && node.type !== 'sheet')
          throw new ToolError(
            'invalid_edit',
            `${id} is a ${node.type} node; cells only apply to table and sheet nodes.`,
          );
        data.cells = setCells(data.cells as string[][], cells, id);
      }
      if (node.type === 'video') checkVideo(data.url);
      return { node, data };
    });

    commitAiWrite(() => {
      const store = useCanvasStore.getState();
      for (const { node, data } of patches) store.updateNodeData(node.id, data);
    });
    return {
      text: `Updated ${patches.map((p) => alias(p.node.id)).join(', ')}.`,
      summary: `Updated ${plural(patches.length, 'node')}`,
      affectedNodeIds: patches.map((p) => p.node.id),
    };
  },
});

export const moveNodes = defineTool({
  name: 'move_nodes',
  title: 'Move or resize nodes',
  description: 'Move nodes to x/y or by dx/dy, and resize code, graph, image and video nodes. One undo step.',
  input: z.object({
    moves: z
      .array(
        z.object({
          id: handleSchema,
          x: z.number().optional(),
          y: z.number().optional(),
          dx: z.number().optional(),
          dy: z.number().optional(),
          width: z.number().min(40).max(4000).optional(),
          height: z.number().min(40).max(4000).optional(),
        }),
      )
      .min(1)
      .max(200),
  }),
  readOnly: false,
  handler: ({ moves }) => {
    const changes = new Map(
      moves.map((m) => {
        const node = requireNode(m.id);
        if ((m.width || m.height) && !RESIZABLE.has(node.type) && node.type !== 'image')
          throw new ToolError('not_resizable', `${m.id} is a ${node.type} node, which sizes to its content.`);
        const position = {
          x: (m.x ?? node.position.x) + (m.dx ?? 0),
          y: (m.y ?? node.position.y) + (m.dy ?? 0),
        };
        return [node.id, { position, width: m.width, height: m.height }];
      }),
    );
    commitAiWrite(() =>
      useCanvasStore.setState((s) => ({
        nodes: s.nodes.map((n) => {
          const c = changes.get(n.id);
          if (!c) return n;
          return {
            ...n,
            position: c.position,
            ...(c.width ? { width: c.width } : {}),
            ...(c.height ? { height: c.height } : {}),
          };
        }),
      })),
    );
    return {
      text: `Moved ${plural(changes.size, 'node')}.`,
      summary: `Moved ${plural(changes.size, 'node')}`,
      affectedNodeIds: [...changes.keys()],
    };
  },
});

export const deleteNodes = defineTool({
  name: 'delete_nodes',
  title: 'Delete nodes',
  description: 'Delete nodes (one undo step; the user can undo it).',
  input: z.object({ ids: z.array(handleSchema).min(1).max(200) }),
  readOnly: false,
  destructive: true,
  handler: ({ ids }) => {
    const doomed = new Set(ids.map((id) => requireNode(id).id));
    commitAiWrite(() =>
      useCanvasStore.setState((s) => ({ nodes: s.nodes.filter((n) => !doomed.has(n.id)) })),
    );
    return {
      text: `Deleted ${plural(doomed.size, 'node')}.`,
      summary: `Deleted ${plural(doomed.size, 'node')}`,
    };
  },
});

const historyInput = z.object({ steps: z.number().int().min(1).max(20).default(1) });

export const undoTool = defineTool({
  name: 'undo',
  title: 'Undo',
  description: 'Undo the latest canvas changes. Each of your write calls is one step.',
  input: historyInput,
  readOnly: false,
  handler: ({ steps }) => {
    for (let i = 0; i < steps; i++) undo();
    return { text: `Undid ${plural(steps, 'step')}.`, summary: `Undid ${plural(steps, 'step')}` };
  },
});

export const redoTool = defineTool({
  name: 'redo',
  title: 'Redo',
  description: 'Redo changes reverted by undo.',
  input: historyInput,
  readOnly: false,
  handler: ({ steps }) => {
    for (let i = 0; i < steps; i++) redo();
    return { text: `Redid ${plural(steps, 'step')}.`, summary: `Redid ${plural(steps, 'step')}` };
  },
});
