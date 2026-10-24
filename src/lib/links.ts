import { z } from 'zod';
import {
  type AppEdge,
  type AppNode,
  type CanvasEdge,
  LINK_ENDS,
  type LinkData,
  SECTION_COLORS,
} from '@/model/types';
import { cloneNodes, newId } from '@/nodes/factory';

/** Longest link label. */
export const LABEL_MAX = 200;

/** Shared by the import format and the agent tools so both accept exactly the same link looks. */
export const linkDataSchema = z.object({
  label: z.string().max(LABEL_MAX).optional(),
  color: z.enum(SECTION_COLORS).optional(),
  dashed: z.boolean().optional(),
  head: z.enum(LINK_ENDS).optional(),
  tail: z.enum(LINK_ENDS).optional(),
});

export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: linkDataSchema.optional(),
});

/** Drops defaults and empty values, so equal-looking links store equal data. Returns undefined when nothing is left. */
export function normaliseLinkData(data: LinkData | undefined): LinkData | undefined {
  if (!data) return undefined;
  const out: LinkData = {};
  if (data.label) out.label = data.label;
  if (data.color) out.color = data.color;
  if (data.dashed) out.dashed = true;
  if (data.head && data.head !== 'arrow') out.head = data.head;
  if (data.tail && data.tail !== 'none') out.tail = data.tail;
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Drops React Flow's runtime-only fields so a link can be saved, exported, or diffed for undo. */
export function stripEdge(edge: AppEdge): CanvasEdge {
  const { id, source, target } = edge;
  const data = normaliseLinkData(edge.data);
  return { id, source, target, ...(data ? { data } : {}) };
}

/** Keeps the links whose two ends exist and differ. Duplicates stay: they are legal, if odd. */
export function sanitizeEdges<E extends CanvasEdge>(edges: E[], nodeIds: Iterable<string>): E[] {
  const ids = new Set(nodeIds);
  return edges.filter((e) => e.source !== e.target && ids.has(e.source) && ids.has(e.target));
}

/** The links with both ends in `ids`, never one that starts and ends on the same node. */
export function internalEdges<E extends CanvasEdge>(edges: E[], ids: ReadonlySet<string>): E[] {
  return edges.filter((e) => e.source !== e.target && ids.has(e.source) && ids.has(e.target));
}

/** The existing link from `source` to `target`, if any (the other direction does not count). */
export const findLink = <E extends CanvasEdge>(edges: E[], source: string, target: string): E | undefined =>
  edges.find((e) => e.source === source && e.target === target);

/** Copies nodes with fresh ids, shifted by `offset`, together with the links among them. */
export function cloneGraph(
  nodes: AppNode[],
  edges: CanvasEdge[],
  offset: { x: number; y: number },
): { nodes: AppNode[]; edges: AppEdge[] } {
  const copies = cloneNodes(nodes, offset);
  const remap = new Map(nodes.map((n, i) => [n.id, copies[i].id]));
  const inside = internalEdges(edges, new Set(remap.keys()));
  return {
    nodes: copies,
    edges: inside.map((e) => {
      const data = normaliseLinkData(structuredClone(e.data));
      return {
        id: newId(),
        source: remap.get(e.source) as string,
        target: remap.get(e.target) as string,
        ...(data ? { data } : {}),
      };
    }),
  };
}

/**
 * Whether linking `source` to `target` closes a loop of Math+ links: both are Math+ nodes and `target` already
 * feeds `source`, directly or through other Math+ nodes. Links that touch other kinds of node never carry a value.
 */
export function closesMathPlusLoop(
  nodes: AppNode[],
  edges: CanvasEdge[],
  source: string,
  target: string,
): boolean {
  const math = new Set(nodes.filter((n) => n.type === 'mathPlus').map((n) => n.id));
  if (!math.has(source) || !math.has(target)) return false;
  const seen = new Set([target]);
  const queue = [target];
  for (let id = queue.pop(); id !== undefined; id = queue.pop()) {
    if (id === source) return true;
    for (const e of edges)
      if (e.source === id && math.has(e.target) && !seen.has(e.target)) {
        seen.add(e.target);
        queue.push(e.target);
      }
  }
  return false;
}
