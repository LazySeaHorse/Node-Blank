import { z } from 'zod';
import { edgeSchema, stripEdge } from '@/lib/links';
import type { AppNode, CanvasContent, CanvasEdge } from '@/model/types';
import { nodeKinds, nodeSpecs } from '@/nodes/catalog';
import { stripTransient } from '@/nodes/factory';

/**
 * JSON import/export format. Bump `version` (and add a migration) if the shape ever changes.
 * Version 2 added links; files without any are still written as version 1 so older builds can open them.
 */
const APP_TAG = 'unlined';
/** Files written before the rename carry this tag; they still import. */
const LEGACY_APP_TAG = 'node-blank';
const VERSION = 1;
const LINKS_VERSION = 2;

const point = z.object({ x: z.number(), y: z.number() });
const viewportSchema = z.object({ x: z.number(), y: z.number(), zoom: z.number().positive() });
const groupSchema = z.object({ id: z.string(), nodeIds: z.array(z.string()) });

const nodeSchema = z.discriminatedUnion(
  'type',
  nodeKinds.map((kind) =>
    z.object({
      id: z.string(),
      type: z.literal(kind),
      position: point,
      data: nodeSpecs[kind].schema,
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    }),
  ) as unknown as [z.ZodObject, ...z.ZodObject[]],
) as unknown as z.ZodType<AppNode>;

const header = {
  app: z.enum([APP_TAG, LEGACY_APP_TAG]),
  version: z.union([z.literal(VERSION), z.literal(LINKS_VERSION)]),
};

const exportFileSchema = z.discriminatedUnion('kind', [
  z.object({
    ...header,
    kind: z.literal('canvases'),
    canvases: z.array(
      z.object({
        name: z.string(),
        nodes: z.array(nodeSchema),
        viewport: viewportSchema,
        groups: z.array(groupSchema).optional(),
        edges: z.array(edgeSchema).optional(),
      }),
    ),
  }),
  z.object({
    ...header,
    kind: z.literal('nodes'),
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema).optional(),
  }),
]);

export type ExportFile = z.infer<typeof exportFileSchema>;
export type CanvasesFile = Extract<ExportFile, { kind: 'canvases' }>;
export type NodesFile = Extract<ExportFile, { kind: 'nodes' }>;
export type NamedCanvas = { name: string } & CanvasContent;

export const exportCanvases = (canvases: NamedCanvas[]): CanvasesFile => ({
  app: APP_TAG,
  version: canvases.some((c) => c.edges?.length) ? LINKS_VERSION : VERSION,
  kind: 'canvases',
  canvases: canvases.map((c) => ({
    name: c.name,
    nodes: c.nodes.map(stripTransient),
    viewport: c.viewport,
    ...(c.groups ? { groups: c.groups } : {}),
    ...(c.edges?.length ? { edges: c.edges.map(stripEdge) } : {}),
  })),
});

export const exportNodes = (nodes: AppNode[], edges: CanvasEdge[] = []): NodesFile => ({
  app: APP_TAG,
  version: edges.length > 0 ? LINKS_VERSION : VERSION,
  kind: 'nodes',
  nodes: nodes.map(stripTransient),
  ...(edges.length > 0 ? { edges: edges.map(stripEdge) } : {}),
});

export class ImportError extends Error {}

export function parseExportFile(text: string): ExportFile {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ImportError('File is not valid JSON.');
  }
  const result = exportFileSchema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ImportError(`Not an Unlined export (${issue.path.join('.') || 'root'}: ${issue.message}).`);
  }
  return result.data;
}
