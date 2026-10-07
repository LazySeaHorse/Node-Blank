import { SquarePlay } from 'lucide-react';
import { z } from 'zod';
import type { NodeSpec } from '../spec';

export const videoSpec: NodeSpec<'video'> = {
  kind: 'video',
  label: 'Video',
  description: 'Embed a YouTube or Vimeo video',
  icon: SquarePlay,
  placement: 'insert',
  schema: z.object({ url: z.string() }),
  defaults: () => ({ url: '' }),
  size: { width: 560, height: 350 },
  searchText: (d) => d.url,
};
