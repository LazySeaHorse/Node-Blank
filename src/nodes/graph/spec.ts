import { ChartSpline } from 'lucide-react';
import { z } from 'zod';
import type { NodeSpec } from '../spec';

export const graphSpec: NodeSpec<'graph'> = {
  kind: 'graph',
  label: 'Graph',
  description: 'Plot functions of x',
  icon: ChartSpline,
  placement: 'place',
  schema: z.object({ functions: z.array(z.string()) }),
  defaults: () => ({ functions: ['x^2'] }),
  size: { width: 380, height: 360 },
  searchText: (d) => d.functions.join(' '),
};
