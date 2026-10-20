import { Calculator } from 'lucide-react';
import { z } from 'zod';
import { colorField, type NodeSpec, titleField } from '../spec';

export const mathPlusSpec: NodeSpec<'mathPlus'> = {
  kind: 'mathPlus',
  label: 'Math+',
  description: 'Evaluate expressions; variables (a := 2) are shared across Math+ nodes',
  icon: Calculator,
  placement: 'place',
  schema: z.object({ latex: z.string(), title: titleField, color: colorField }),
  defaults: () => ({ latex: '' }),
  searchText: (d) => d.latex,
};
