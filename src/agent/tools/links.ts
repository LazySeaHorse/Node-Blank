import { z } from 'zod';
import { closesMathPlusLoop, linkDataSchema, normaliseLinkData } from '@/lib/links';
import { type AppEdge, LINK_ENDS, type LinkData, SECTION_COLORS } from '@/model/types';
import { newId } from '@/nodes/factory';
import { useCanvasStore } from '@/store/canvasStore';
import { alias } from '../aliases';
import { defineTool } from '../defineTool';
import { ToolError } from '../errors';
import { linkLine } from '../format';
import {
  canvasLinks,
  canvasNodes,
  commitAiWrite,
  handleSchema,
  linkHandleSchema,
  plural,
  requireLink,
  requireNode,
} from './shared';

const MAX_LINKS = 50;

/** `auto` is the automatic colour, which is stored as no colour at all. */
const COLOR = ['auto', ...SECTION_COLORS] as const;

/** How a link looks. Built from the format's own schema so the tools and the saved files agree on what is valid. */
const lookShape = {
  label: linkDataSchema.shape.label.describe(
    'Text along the link; $...$ is typeset as math. Empty clears it.',
  ),
  color: z.enum(COLOR).optional().describe('Line and label colour; "auto" (the default) is a neutral grey.'),
  dashed: linkDataSchema.shape.dashed.describe('Dashed line.'),
  head: z.enum(LINK_ENDS).optional().describe('End at the "to" node: arrow (default), dot, bar or none.'),
  tail: z.enum(LINK_ENDS).optional().describe('End at the "from" node: none (default), arrow, dot or bar.'),
} satisfies Record<keyof LinkData, z.ZodType>;

type Look = Omit<LinkData, 'color'> & { color?: LinkData['color'] | 'auto' };

/** A look as the store keeps it. A colour that is left out stays as it was; "auto" becomes no colour. */
function toPatch({ color, ...rest }: Look): Partial<LinkData> {
  return { ...rest, ...(color !== undefined ? { color: color === 'auto' ? undefined : color } : {}) };
}

const sameDirection = (links: Pick<AppEdge, 'source' | 'target'>[], source: string, target: string) =>
  links.some((e) => e.source === source && e.target === target);

export const linkNodesTool = defineTool({
  name: 'link_nodes',
  title: 'Link nodes',
  description:
    `Draw up to ${MAX_LINKS} links between nodes in one undo step. A link goes from one node to another (an arrow ` +
    'by default) and may carry a label, colour, dashed line and end shapes. Links between two Math+ nodes also pass a ' +
    'value, see get_guide. Sections can be linked too. Returns the new link handles.',
  input: z.object({
    links: z
      .array(z.object({ from: handleSchema, to: handleSchema, ...lookShape }))
      .min(1)
      .max(MAX_LINKS),
  }),
  readOnly: false,
  handler: ({ links: specs }) => {
    const nodes = canvasNodes();
    const existing = [...canvasLinks()];
    const created: AppEdge[] = [];
    const notes: string[] = [];
    for (const { from, to, ...look } of specs) {
      const source = requireNode(from).id;
      const target = requireNode(to).id;
      if (source === target) throw new ToolError('self_link', `${from} cannot be linked to itself.`);
      if (sameDirection(existing, source, target))
        throw new ToolError(
          'link_exists',
          `${from} is already linked to ${to}. Use update_links to change it, or link the other way round.`,
        );
      if (closesMathPlusLoop(nodes, existing, source, target))
        notes.push(`${from} -> ${to} closes a Math+ loop; one link in the loop is ignored when calculating.`);
      const data = normaliseLinkData(toPatch(look));
      const link: AppEdge = { id: newId(), source, target, ...(data ? { data } : {}) };
      created.push(link);
      existing.push(link);
    }
    commitAiWrite(() => useCanvasStore.setState((s) => ({ edges: [...s.edges, ...created] })));
    const lines = created.map(linkLine);
    return {
      text: `Linked ${lines.join('; ')}.${notes.length ? `\n${notes.join('\n')}` : ''}`,
      summary: `Linked ${plural(created.length, 'pair')} of nodes`,
      affectedNodeIds: [...new Set(created.flatMap((e) => [e.source, e.target]))],
    };
  },
});

export const listLinks = defineTool({
  name: 'list_links',
  title: 'List links',
  description:
    'One line per link: handle, from -> to, label and any non-default look. Optionally only the links of one node. Paginated.',
  input: z.object({
    node: handleSchema.optional().describe('Only links to or from this node.'),
    offset: z.number().int().min(0).default(0),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  readOnly: true,
  handler: ({ node, offset, limit }) => {
    const id = node ? requireNode(node).id : undefined;
    const all = canvasLinks().filter((e) => !id || e.source === id || e.target === id);
    const page = all.slice(offset, offset + limit);
    const lines = page.map(linkLine);
    if (all.length === 0) lines.push('No links.');
    else if (offset + page.length < all.length)
      lines.push(
        `(${offset + 1}-${offset + page.length} of ${all.length}; pass offset=${offset + page.length} for more)`,
      );
    return { text: lines.join('\n'), summary: `Listed ${plural(page.length, 'link')}` };
  },
});

const updateSchema = z.object({
  id: linkHandleSchema,
  set: z
    .object(lookShape)
    .partial()
    .optional()
    .describe('Fields to change; the rest stay. An empty label removes it, "auto" resets the colour.'),
  reverse: z.boolean().optional().describe('Swap the ends so the link runs the other way.'),
});

export const updateLinks = defineTool({
  name: 'update_links',
  title: 'Update links',
  description:
    'Change the look or direction of up to 50 links in one undo step. All updates are checked before any is applied.',
  input: z.object({ updates: z.array(updateSchema).min(1).max(MAX_LINKS) }),
  readOnly: false,
  handler: ({ updates }) => {
    const checked = updates.map(({ id, set, reverse }) => ({ link: requireLink(id), set, reverse }));
    const ids = new Set(checked.map((c) => c.link.id));
    if (ids.size !== checked.length)
      throw new ToolError('duplicate_update', 'Each link may appear once per call; merge its changes.');
    commitAiWrite(() => {
      const store = useCanvasStore.getState();
      for (const { link, set, reverse } of checked) {
        if (set) {
          const { label, ...rest } = set;
          // An empty label clears it; a label left out stays.
          store.updateEdgeData(link.id, {
            ...toPatch(rest),
            ...(label !== undefined ? { label: label || undefined } : {}),
          });
        }
        if (reverse) store.reverseEdge(link.id);
      }
    });
    const nodeIds = checked.flatMap(({ link }) => [link.source, link.target]);
    return {
      text: `Updated ${checked.map((c) => alias(c.link.id, 'l')).join(', ')}.`,
      summary: `Updated ${plural(checked.length, 'link')}`,
      affectedNodeIds: [...new Set(nodeIds)],
    };
  },
});

export const deleteLinks = defineTool({
  name: 'delete_links',
  title: 'Delete links',
  description: 'Remove links (one undo step; the user can undo it). The nodes they join stay.',
  input: z.object({ ids: z.array(linkHandleSchema).min(1).max(200) }),
  readOnly: false,
  destructive: true,
  handler: ({ ids }) => {
    const doomed = [...new Set(ids.map((id) => requireLink(id)))];
    commitAiWrite(() =>
      useCanvasStore.getState().deleteElements(
        [],
        doomed.map((e) => e.id),
      ),
    );
    return {
      text: `Deleted ${plural(doomed.length, 'link')}.`,
      summary: `Deleted ${plural(doomed.length, 'link')}`,
      affectedNodeIds: [...new Set(doomed.flatMap((e) => [e.source, e.target]))],
    };
  },
});
