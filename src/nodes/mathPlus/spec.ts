import { Calculator } from 'lucide-react';
import { z } from 'zod';
import { SECTION_COLORS } from '@/model/types';
import type { NodeSpec } from '../spec';

export const mathPlusSpec: NodeSpec<'mathPlus'> = {
  kind: 'mathPlus',
  label: 'Math+',
  description: 'Evaluate expressions; variables (a := 2) are shared across Math+ nodes',
  icon: Calculator,
  placement: 'place',
  schema: z.object({ latex: z.string(), color: z.enum(SECTION_COLORS).optional() }),
  defaults: () => ({ latex: '' }),
  searchText: (d) => d.latex,
};
