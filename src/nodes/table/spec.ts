import { Table } from 'lucide-react';
import { z } from 'zod';
import { emptyGrid } from '@/lib/grid';
import type { NodeSpec } from '../spec';

export const tableSpec: NodeSpec<'table'> = {
  kind: 'table',
  label: 'Table',
  description: 'A grid of math cells',
  icon: Table,
  placement: 'place',
  schema: z.object({ cells: z.array(z.array(z.string())) }),
  defaults: () => ({ cells: emptyGrid(3, 3) }),
  searchText: (d) => d.cells.flat().join(' '),
};
