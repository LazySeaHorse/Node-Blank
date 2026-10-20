import { Globe } from 'lucide-react';
import { z } from 'zod';
import { colorField, type NodeSpec, titleField } from '../spec';

export const webSpec: NodeSpec<'web'> = {
  kind: 'web',
  label: 'Web',
  description:
    'Browse a website inside the canvas, e.g. Gemini (most sites need the Node-Blank Web extension)',
  icon: Globe,
  placement: 'insert',
  schema: z.object({
    url: z.string(),
    pageTitle: z.string().max(300).optional(),
    keepLoaded: z.boolean().optional(),
    title: titleField,
    color: colorField,
  }),
  defaults: () => ({ url: '' }),
  size: { width: 900, height: 640 },
  searchText: (d) => `${d.pageTitle ?? ''} ${d.url}`.trim(),
};
