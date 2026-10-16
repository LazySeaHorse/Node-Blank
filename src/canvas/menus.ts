import type { XYPosition } from '@xyflow/react';
import { Clipboard, Maximize, MousePointer2, Plus, Shapes } from 'lucide-react';
import type { NodeKind } from '@/model/types';
import { nodeSpecs } from '@/nodes/catalog';
import { useCanvasStore } from '@/store/canvasStore';
import { organiseCanvas } from '@/store/groups';
import type { MenuEntry } from '@/ui/Menu';
import { pasteAt } from './clipboard';

export interface CanvasMenuActions {
  addNode: (kind: NodeKind, at: XYPosition) => void;
  insertImage: () => void;
  insertVideo: () => void;
  fitView: () => void;
}

const selectAll = () => {
  const { nodes, onNodesChange } = useCanvasStore.getState();
  onNodesChange(nodes.map((n) => ({ type: 'select', id: n.id, selected: true })));
};

/** What right-clicking empty canvas offers; `at` is where the click landed, in canvas coordinates. */
export function canvasMenu(at: XYPosition, actions: CanvasMenuActions): MenuEntry[] {
  const kinds = Object.values(nodeSpecs);
  const insertActions: Partial<Record<NodeKind, () => void>> = {
    image: actions.insertImage,
    video: actions.insertVideo,
  };
  const add: MenuEntry[] = [];
  for (const spec of kinds) {
    if (spec.placement === 'place')
      add.push({ label: spec.label, icon: spec.icon, onSelect: () => actions.addNode(spec.kind, at) });
    else if (spec.placement === 'insert' && insertActions[spec.kind])
      add.push({ label: spec.label, icon: spec.icon, onSelect: insertActions[spec.kind] as () => void });
  }
  return [
    { label: 'Add node', icon: Plus, items: add },
    { label: 'Paste', icon: Clipboard, hint: 'Ctrl+V', onSelect: () => void pasteAt(at) },
    { separator: true },
    { label: 'Organise', icon: Shapes, onSelect: organiseCanvas },
    { label: 'Fit view', icon: Maximize, onSelect: actions.fitView },
    { label: 'Select all', icon: MousePointer2, hint: 'Ctrl+A', onSelect: selectAll },
  ];
}
