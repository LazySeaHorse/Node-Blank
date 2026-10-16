import { SquareDashed } from 'lucide-react';
import { z } from 'zod';
import { SECTION_COLORS } from '@/model/types';
import type { NodeSpec } from '../spec';

export const sectionSpec: NodeSpec<'section'> = {
  kind: 'section',
  label: 'Section',
  description: 'A titled, coloured box around other nodes, made with Ctrl+G; moving it moves what is inside',
  icon: SquareDashed,
  placement: 'wrap',
  schema: z.object({ title: z.string().max(200), color: z.enum(SECTION_COLORS) }),
  defaults: () => ({ title: 'Section', color: 'yellow' }),
  size: { width: 400, height: 300 },
  searchText: (d) => d.title,
};
