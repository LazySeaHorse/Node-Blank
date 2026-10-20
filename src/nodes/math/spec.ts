import { Sigma } from 'lucide-react';
import { z } from 'zod';
import { colorField, type NodeSpec, titleField } from '../spec';

export const mathSpec: NodeSpec<'math'> = {
  kind: 'math',
  label: 'Math',
  description: 'Typeset an equation',
  icon: Sigma,
  placement: 'place',
  schema: z.object({ latex: z.string(), title: titleField, color: colorField }),
  defaults: () => ({ latex: '' }),
  searchText: (d) => d.latex,
};
