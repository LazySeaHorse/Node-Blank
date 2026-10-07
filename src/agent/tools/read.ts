import { z } from 'zod';
import { boundsOf } from '@/lib/clusters';
import { loadEngine } from '@/lib/math/engine';
import type { AppNode, NodeKind } from '@/model/types';
import { nodeKinds } from '@/nodes/catalog';
import { searchTextOf } from '@/nodes/factory';
import { evaluateDocuments, type LineResult } from '@/nodes/mathPlus/evaluate';
import * as repo from '@/persistence/canvasRepo';
import { useCanvasStore } from '@/store/canvasStore';
import { nodeRect } from '@/store/groups';
import { useWorkspace } from '@/store/workspace';
import { alias, resolveAlias } from '../aliases';
import { defineTool } from '../defineTool';
import { nodeBody, nodeLine, oneLine, placement } from '../format';
import {
  canvasNodes,
  currentGroups,
  groupHandleSchema,
  handleSchema,
  plural,
  requireGroup,
  requireNode,
  viewportRect,
} from './shared';

const MAX_GROUPS_LISTED = 40;
const kindSchema = z.enum(nodeKinds as [NodeKind, ...NodeKind[]]);
const areaSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

const r = Math.round;
const rectLabel = (b: { x: number; y: number; width: number; height: number }) =>
  `${r(b.x)},${r(b.y)} ${r(b.width)}×${r(b.height)}`;

function kindCounts(nodes: AppNode[]): string {
  const counts = new Map<string, number>();
  for (const n of nodes) counts.set(n.type, (counts.get(n.type) ?? 0) + 1);
  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([kind, count]) => `${kind} ${count}`)
    .join(', ');
}

export const getOverview = defineTool({
  name: 'get_overview',
  title: 'Canvas overview',
  description:
    'Start here. Small, fixed-size summary of the open canvas: node counts by kind, groups of nearby nodes ' +
    '(handle, size, bounds, kinds, a preview of the first node), the visible area and the selection. ' +
    'Then use list_nodes on a group or area, and read_nodes for full content.',
  input: z.object({}),
  readOnly: true,
  handler: async () => {
    const nodes = canvasNodes();
    const id = useWorkspace.getState().currentId;
    const name = id ? ((await repo.getCanvas(id))?.name ?? 'Untitled') : 'Untitled';
    if (nodes.length === 0) return { text: `Canvas "${name}" is empty.`, summary: 'Read the overview' };

    const { groups } = currentGroups();
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const selected = nodes.filter((n) => n.selected).map((n) => alias(n.id));
    const view = viewportRect();
    const lines = [
      `Canvas "${name}": ${plural(nodes.length, 'node')} (${kindCounts(nodes)}), ${plural(groups.length, 'group')}.`,
      `Bounds ${rectLabel(boundsOf(nodes.map(nodeRect)))}. Visible ${rectLabel(view)} (zoom ${useCanvasStore.getState().viewport.zoom.toFixed(2)}).`,
      `Selected: ${selected.length ? selected.join(', ') : 'none'}.`,
      'Groups (reading order): handle, nodes, bounds, kinds, first node:',
    ];
    for (const g of groups.slice(0, MAX_GROUPS_LISTED)) {
      const members = g.nodeIds.map((nid) => byId.get(nid)).filter((n): n is AppNode => !!n);
      const lead = members.find((n) => n.type === 'text') ?? members[0];
      lines.push(
        `${alias(g.id, 'g')} ${members.length} ${rectLabel(boundsOf(members.map(nodeRect)))} ${kindCounts(members)} "${oneLine(searchTextOf(lead) || lead.type, 60)}"`,
      );
    }
    if (groups.length > MAX_GROUPS_LISTED) {
      const rest = groups.slice(MAX_GROUPS_LISTED);
      lines.push(
        `+${rest.length} more groups (${plural(
          rest.reduce((s, g) => s + g.nodeIds.length, 0),
          'node',
        )}); use list_nodes with an area.`,
      );
    }
    return { text: lines.join('\n'), summary: 'Read the overview' };
  },
});

export const listNodes = defineTool({
  name: 'list_nodes',
  title: 'List nodes',
  description:
    'One line per node: handle, kind, x,y w×h, group, a short preview and the length of long content. ' +
    'Filter by group, handles, area, kind, the selection or what is on screen. Paginated.',
  input: z.object({
    group: groupHandleSchema.optional(),
    ids: z.array(handleSchema).max(200).optional(),
    scope: z
      .enum(['all', 'selected', 'in_view'])
      .default('all')
      .describe('"selected": what the user selected.'),
    kind: kindSchema.optional(),
    area: areaSchema.optional().describe('Only nodes overlapping this canvas rectangle.'),
    offset: z.number().int().min(0).default(0),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  readOnly: true,
  handler: ({ group, ids, scope, kind, area, offset, limit }) => {
    const { groups, groupOf } = currentGroups();
    let nodes = canvasNodes();
    if (group) {
      const members = new Set(requireGroup(group, groups).nodeIds);
      nodes = nodes.filter((n) => members.has(n.id));
    }
    if (ids) {
      const wanted = new Set(ids.map(resolveAlias));
      nodes = nodes.filter((n) => wanted.has(n.id));
    }
    if (scope === 'selected') nodes = nodes.filter((n) => n.selected);
    const box = scope === 'in_view' ? viewportRect() : area;
    if (box)
      nodes = nodes.filter((n) => {
        const b = nodeRect(n);
        return (
          b.x < box.x + box.width &&
          box.x < b.x + b.width &&
          b.y < box.y + box.height &&
          box.y < b.y + b.height
        );
      });
    if (kind) nodes = nodes.filter((n) => n.type === kind);

    const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
    const page = sorted.slice(offset, offset + limit);
    const lines = page.map((n) => nodeLine(n, groupOf.get(n.id)));
    if (sorted.length === 0) lines.push('No matching nodes.');
    else if (offset + page.length < sorted.length)
      lines.push(
        `(${offset + 1}-${offset + page.length} of ${sorted.length}; pass offset=${offset + page.length} for more)`,
      );
    return { text: lines.join('\n'), summary: `Listed ${plural(page.length, 'node')}` };
  },
});

/** Math+ results for every Math+ node; they share variables, so all are evaluated together in reading order. */
async function mathPlusResults(): Promise<Record<string, LineResult[]>> {
  const docs = canvasNodes()
    .filter((n) => n.type === 'mathPlus')
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
    .map((n) => ({ id: n.id, latex: n.data.latex as string }));
  if (docs.length === 0) return {};
  const { ce } = await loadEngine();
  return evaluateDocuments(ce, docs);
}

export const readNodes = defineTool({
  name: 'read_nodes',
  title: 'Read nodes',
  description:
    'Full content of up to 20 nodes. Text is Markdown with $LaTeX$; math is LaTeX; Math+ lines show their ' +
    'computed result after ⟶; tables and sheets are grids with A1-style column letters and row numbers. ' +
    'Long content is cut at maxChars; pass offset to read further.',
  input: z.object({
    ids: z.array(handleSchema).min(1).max(20),
    offset: z.number().int().min(0).default(0).describe('Character offset into each node, for long content.'),
    maxChars: z.number().int().min(100).max(20000).default(4000).describe('Per node.'),
  }),
  readOnly: true,
  handler: async ({ ids, offset, maxChars }) => {
    const nodes = ids.map(requireNode);
    const { groupOf } = currentGroups();
    const results = nodes.some((n) => n.type === 'mathPlus') ? await mathPlusResults() : {};
    const blocks = nodes.map((node) => {
      const body = nodeBody(node, results[node.id]);
      const slice = body.slice(offset, offset + maxChars);
      const group = groupOf.get(node.id);
      const head = `## ${alias(node.id)} ${node.type} ${placement(node)}${group ? ` ${alias(group, 'g')}` : ''}`;
      const more =
        offset + maxChars < body.length
          ? `\n[chars ${offset}-${offset + slice.length} of ${body.length}; pass offset=${offset + slice.length} for more]`
          : '';
      return `${head}\n${slice}${more}`;
    });
    return { text: blocks.join('\n\n'), summary: `Read ${nodes.map((n) => alias(n.id)).join(', ')}` };
  },
});

export const searchNodes = defineTool({
  name: 'search_nodes',
  title: 'Search nodes',
  description:
    'Case-insensitive text search across node content. Returns handles with a snippet around the first match.',
  input: z.object({
    query: z.string().min(1).max(200),
    kind: kindSchema.optional(),
    limit: z.number().int().min(1).max(100).default(20),
  }),
  readOnly: true,
  handler: ({ query, kind, limit }) => {
    const { groupOf } = currentGroups();
    const q = query.toLowerCase();
    const hits: string[] = [];
    let total = 0;
    for (const node of canvasNodes()) {
      if (kind && node.type !== kind) continue;
      const text = searchTextOf(node);
      const at = text.toLowerCase().indexOf(q);
      if (at < 0) continue;
      total++;
      if (hits.length >= limit) continue;
      const start = Math.max(0, at - 40);
      const snippet = `${start > 0 ? '…' : ''}${oneLine(text.slice(start, at + q.length + 40), 200)}`;
      const group = groupOf.get(node.id);
      hits.push(`${alias(node.id)} ${node.type}${group ? ` ${alias(group, 'g')}` : ''}: ${snippet}`);
    }
    if (total === 0) return { text: `No nodes contain "${query}".`, summary: `Searched "${query}"` };
    if (total > hits.length) hits.push(`(${hits.length} of ${total} matches shown)`);
    return { text: hits.join('\n'), summary: `Searched "${query}"` };
  },
});
