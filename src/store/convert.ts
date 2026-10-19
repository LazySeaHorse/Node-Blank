import type { MarkdownShape } from '@/lib/markdownShape';
import type { AppNode } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { asUndoStep, useCanvasStore } from './canvasStore';

export type ConvertTarget = 'table' | 'sheet' | 'math';

/**
 * Turns a text node that holds only a table or only math into a node of that kind, in place (same id,
 * position and title), as one undo step. A size picked for the text node is dropped: the new node sizes itself.
 */
export function convertTextNode(id: string, shape: MarkdownShape, to: ConvertTarget) {
  const { nodes } = useCanvasStore.getState();
  const old = nodes.find((n) => n.id === id);
  if (old?.type !== 'text') return;
  const title = old.data.title;

  let fresh: AppNode;
  if (to === 'math' && shape.kind === 'math')
    fresh = createNode('math', old.position, { latex: shape.latex, title });
  else if (to === 'sheet' && shape.kind === 'table')
    fresh = createNode('sheet', old.position, { cells: shape.text, title });
  else if (to === 'table' && shape.kind === 'table')
    fresh = createNode('table', old.position, { cells: shape.latex, title });
  else return;

  asUndoStep(() =>
    useCanvasStore.setState({
      nodes: nodes.map((n) => (n.id === id ? { ...fresh, id, selected: true } : n)),
    }),
  );
}
