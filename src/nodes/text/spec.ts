import { Type } from 'lucide-react';
import { z } from 'zod';
import { colorField, type NodeSpec, titleField } from '../spec';

export const textSpec: NodeSpec<'text'> = {
  kind: 'text',
  label: 'Text',
  description: 'Markdown with $LaTeX$ math',
  icon: Type,
  placement: 'place',
  schema: z.object({
    markdown: z.string(),
    title: titleField,
    color: colorField,
    suggestionDismissed: z.boolean().optional(),
  }),
  defaults: () => ({ markdown: 'Double-click to edit.\n\nSupports **Markdown** and math like $E=mc^2$.' }),
  searchText: (d) => d.markdown,
};
