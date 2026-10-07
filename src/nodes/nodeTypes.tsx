import type { NodeProps, NodeTypes } from '@xyflow/react';
import { type ComponentType, lazy, Suspense } from 'react';
import type { AppNode } from '@/model/types';
import { ImageNode } from './image/ImageNode';
import { TextNode } from './text/TextNode';
import { VideoNode } from './video/VideoNode';

/** Code-splits heavy nodes (MathLive, CodeMirror, spreadsheet, plotting) so they load only when used. */
function lazyNode<P extends NodeProps<AppNode>>(load: () => Promise<{ default: ComponentType<P> }>) {
  const Component = lazy(load);
  return function LazyNode(props: P) {
    return (
      <Suspense
        fallback={<div className="h-12 w-40 animate-pulse rounded-lg border border-border bg-surface" />}
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

export const nodeTypes = {
  text: TextNode,
  image: ImageNode,
  video: VideoNode,
  math: lazyNode(() => import('./math/MathNode')),
  mathPlus: lazyNode(() => import('./mathPlus/MathPlusNode')),
  graph: lazyNode(() => import('./graph/GraphNode')),
  table: lazyNode(() => import('./table/TableNode')),
  sheet: lazyNode(() => import('./sheet/SheetNode')),
  code: lazyNode(() => import('./code/CodeNode')),
} satisfies Record<AppNode['type'], unknown> as NodeTypes;
