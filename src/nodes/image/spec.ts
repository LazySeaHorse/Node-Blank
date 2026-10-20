import { Image } from 'lucide-react';
import { z } from 'zod';
import { fitWithin, MAX_IMAGE_SIZE } from '@/lib/files';
import { colorField, NODE_TAB_HEIGHT, type NodeSpec, titleField } from '../spec';

export const imageSpec: NodeSpec<'image'> = {
  kind: 'image',
  label: 'Image',
  description: 'Upload an image',
  icon: Image,
  placement: 'insert',
  schema: z.object({ src: z.string(), title: titleField, color: colorField }),
  defaults: () => ({ src: '' }),
  size: { width: 300, height: 300 },
  searchText: () => '',
};

/** The box for an image of the `natural` size: capped at `MAX_IMAGE_SIZE`, with the tab's height added on top. */
export function imageBox(natural: { width: number; height: number }) {
  const { width, height } = fitWithin(natural, MAX_IMAGE_SIZE);
  return { width, height: height + NODE_TAB_HEIGHT };
}
