import { Sheet } from 'lucide-react';
import { z } from 'zod';
import { emptyGrid } from '@/lib/grid';
import type { NodeSpec } from '../spec';

export const sheetSpec: NodeSpec<'sheet'> = {
  kind: 'sheet',
  label: 'Sheet',
  description: 'Spreadsheet with formulas (=SUM(A1:A3))',
  icon: Sheet,
  placement: 'place',
  schema: z.object({ cells: z.array(z.array(z.string())) }),
  defaults: () => ({ cells: emptyGrid(5, 4) }),
  searchText: (d) => d.cells.flat().join(' '),
};
