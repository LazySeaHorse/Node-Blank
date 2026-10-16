import { nodeRect } from '@/lib/nodeRect';
import { wrapBounds } from '@/lib/sections';
import { createNode } from '@/nodes/factory';
import { startNewUndoStep, useCanvasStore } from './canvasStore';
import { markRenamePending } from './sectionRename';

/** Wraps the selected nodes in a new section and opens its title for editing, as one undo step. */
export function wrapSelectionInSection(): void {
  const { nodes, addNodes } = useCanvasStore.getState();
  const selected = nodes.filter((n) => n.selected);
  if (selected.length === 0) return;
  const box = wrapBounds(selected.map(nodeRect));
  const section = createNode(
    'section',
    { x: box.x, y: box.y },
    { title: 'Section' },
    { width: box.width, height: box.height },
  );
  markRenamePending(section.id);
  startNewUndoStep();
  addNodes([section]);
  startNewUndoStep();
}
