import { Image } from 'lucide-react';
import { z } from 'zod';
import type { NodeSpec } from '../spec';

export const imageSpec: NodeSpec<'image'> = {
  kind: 'image',
  label: 'Image',
  description: 'Upload an image',
  icon: Image,
  placement: 'insert',
  schema: z.object({ src: z.string() }),
  defaults: () => ({ src: '' }),
  size: { width: 300, height: 300 },
  searchText: () => '',
};
