import type { AppNode } from '@/model/types';
import { nodeSpecs } from '@/nodes/catalog';
import type { Rect } from './clusters';

/** Used for content-sized nodes React Flow has not measured yet (e.g. in tests). */
const FALLBACK_SIZE = { width: 240, height: 120 };

/** A node's box on the canvas: its rendered size when known, else its stored or default size. */
export function nodeRect(node: AppNode): Rect {
  const size = nodeSpecs[node.type].size ?? FALLBACK_SIZE;
  return {
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    width: node.measured?.width ?? node.width ?? size.width,
    height: node.measured?.height ?? node.height ?? size.height,
  };
}
