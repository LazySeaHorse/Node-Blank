import { Sigma } from 'lucide-react';
import { z } from 'zod';
import { SECTION_COLORS } from '@/model/types';
import type { NodeSpec } from '../spec';

export const mathSpec: NodeSpec<'math'> = {
  kind: 'math',
  label: 'Math',
  description: 'Typeset an equation',
  icon: Sigma,
  placement: 'place',
  schema: z.object({ latex: z.string(), color: z.enum(SECTION_COLORS).optional() }),
  defaults: () => ({ latex: '' }),
  searchText: (d) => d.latex,
};
