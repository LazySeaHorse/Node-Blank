import { z } from 'zod';
import type { AppNode, CanvasContent } from '@/model/types';
import { nodeKinds, nodeSpecs } from '@/nodes/catalog';
import { stripTransient } from '@/nodes/factory';

/** JSON import/export format. Bump `version` (and add a migration) if the shape ever changes. */
const APP_TAG = 'node-blank';
const VERSION = 1;

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

const header = { app: z.literal(APP_TAG), version: z.literal(VERSION) };

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
      }),
    ),
  }),
  z.object({ ...header, kind: z.literal('nodes'), nodes: z.array(nodeSchema) }),
]);

export type ExportFile = z.infer<typeof exportFileSchema>;
export type CanvasesFile = Extract<ExportFile, { kind: 'canvases' }>;
export type NodesFile = Extract<ExportFile, { kind: 'nodes' }>;
export type NamedCanvas = { name: string } & CanvasContent;

export const exportCanvases = (canvases: NamedCanvas[]): CanvasesFile => ({
  app: APP_TAG,
  version: VERSION,
  kind: 'canvases',
  canvases: canvases.map((c) => ({
    name: c.name,
    nodes: c.nodes.map(stripTransient),
    viewport: c.viewport,
    ...(c.groups ? { groups: c.groups } : {}),
  })),
});

export const exportNodes = (nodes: AppNode[]): NodesFile => ({
  app: APP_TAG,
  version: VERSION,
  kind: 'nodes',
  nodes: nodes.map(stripTransient),
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
    throw new ImportError(`Not a Node-Blank export (${issue.path.join('.') || 'root'}: ${issue.message}).`);
  }
  return result.data;
}
