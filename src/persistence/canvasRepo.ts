import { flattenDisplaylines } from '@/lib/math/normalize';
import { type AppNode, type CanvasContent, type CanvasMeta, DEFAULT_VIEWPORT } from '@/model/types';
import { newId } from '@/nodes/factory';
import { db } from './db';

/** Older saves may hold LaTeX that crashes MathLive (nested \\displaylines); repair it as it loads. */
function repairNode(node: AppNode): AppNode {
  if (node.type !== 'math' && node.type !== 'mathPlus') return node;
  const latex = flattenDisplaylines(node.data.latex);
  return latex === node.data.latex ? node : ({ ...node, data: { ...node.data, latex } } as AppNode);
}

const EMPTY_CONTENT: CanvasContent = { nodes: [], viewport: DEFAULT_VIEWPORT };

/** All canvases, most recently modified first. */
export const listCanvases = (): Promise<CanvasMeta[]> => db.canvases.orderBy('updatedAt').reverse().toArray();

export const getCanvas = (id: string): Promise<CanvasMeta | undefined> => db.canvases.get(id);

export async function createCanvas(name: string, content: CanvasContent = EMPTY_CONTENT): Promise<string> {
  const id = newId();
  await db.transaction('rw', db.canvases, db.contents, async () => {
    await db.canvases.add({ id, name, updatedAt: Date.now() });
    await db.contents.add({ id, ...content });
  });
  return id;
}

export async function loadContent(id: string): Promise<CanvasContent> {
  const row = await db.contents.get(id);
  if (!row) return EMPTY_CONTENT;
  return {
    nodes: row.nodes.map(repairNode),
    viewport: row.viewport,
    ...(row.groups ? { groups: row.groups } : {}),
  };
}

export async function saveContent(id: string, content: CanvasContent): Promise<void> {
  await db.transaction('rw', db.canvases, db.contents, async () => {
    await db.contents.put({ id, ...content });
    await db.canvases.update(id, { updatedAt: Date.now() });
  });
}

export async function renameCanvas(id: string, name: string): Promise<void> {
  await db.canvases.update(id, { name, updatedAt: Date.now() });
}

export async function deleteCanvas(id: string): Promise<void> {
  await db.transaction('rw', db.canvases, db.contents, async () => {
    await db.canvases.delete(id);
    await db.contents.delete(id);
  });
}
