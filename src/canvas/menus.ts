import type { XYPosition } from '@xyflow/react';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalJustifyStart,
  AlignStartHorizontal,
  AlignStartVertical,
  ArrowDownToLine,
  ArrowUpToLine,
  Calculator,
  Clipboard,
  Copy,
  CopyPlus,
  Maximize,
  MousePointer2,
  PaintBucket,
  PencilLine,
  Plus,
  Shapes,
  Sigma,
  SquareDashed,
  Trash2,
  Ungroup,
} from 'lucide-react';
import { copyText } from '@/lib/clipboard';
import { type AppNode, type NodeKind, type NodeOf, SECTION_COLORS } from '@/model/types';
import { nodeSpecs } from '@/nodes/catalog';
import { mathPlusResultsText } from '@/nodes/mathPlus/useMathPlusResults';
import { type AlignEdge, alignSelected, bringToFront, sendToBack } from '@/store/arrange';
import { useCanvasStore } from '@/store/canvasStore';
import { organiseCanvas } from '@/store/groups';
import { deleteSectionWithContents } from '@/store/sections';
import { useUiStore } from '@/store/uiStore';
import type { MenuEntry } from '@/ui/Menu';
import { copySelection, pasteAt } from './clipboard';
import { mathMenu } from './mathMenu';

export interface MenuActions {
  addNode: (kind: NodeKind, at: XYPosition) => void;
  insertImage: () => void;
  insertVideo: () => void;
  fitView: () => void;
  /** Ctrl+G: wraps the selection in a section. */
  wrapInSection: () => void;
}

/** What right-clicking empty canvas offers; `at` is where the click landed, in canvas coordinates. */
export function canvasMenu(at: XYPosition, actions: MenuActions): MenuEntry[] {
  const insertActions: Partial<Record<NodeKind, () => void>> = {
    image: actions.insertImage,
    video: actions.insertVideo,
  };
  const add: MenuEntry[] = [];
  for (const spec of Object.values(nodeSpecs)) {
    const insert = insertActions[spec.kind];
    if (spec.placement === 'place')
      add.push({ label: spec.label, icon: spec.icon, onSelect: () => actions.addNode(spec.kind, at) });
    else if (spec.placement === 'insert' && insert)
      add.push({ label: spec.label, icon: spec.icon, onSelect: insert });
  }
  return [
    { label: 'Add node', icon: Plus, items: add },
    { label: 'Paste', icon: Clipboard, hint: 'Ctrl+V', onSelect: () => void pasteAt(at) },
    { separator: true },
    { label: 'Organise', icon: Shapes, onSelect: organiseCanvas },
    { label: 'Fit view', icon: Maximize, onSelect: actions.fitView },
    {
      label: 'Select all',
      icon: MousePointer2,
      hint: 'Ctrl+A',
      onSelect: () => useCanvasStore.getState().setSelection(() => true),
    },
  ];
}

const copy: MenuEntry = { label: 'Copy', icon: Copy, hint: 'Ctrl+C', onSelect: () => void copySelection() };
const duplicate: MenuEntry = {
  label: 'Duplicate',
  icon: CopyPlus,
  hint: 'Ctrl+D',
  onSelect: () => useCanvasStore.getState().duplicateSelected(),
};
const remove: MenuEntry = {
  label: 'Delete',
  icon: Trash2,
  hint: 'Delete',
  danger: true,
  onSelect: () => useCanvasStore.getState().deleteSelected(),
};

const order: MenuEntry[] = [
  { label: 'Bring to front', icon: ArrowUpToLine, onSelect: bringToFront },
  { label: 'Send to back', icon: ArrowDownToLine, onSelect: sendToBack },
];

const copyLatex = (latex: string): MenuEntry => ({
  label: 'Copy LaTeX',
  icon: Sigma,
  onSelect: () => void copyText(latex, 'LaTeX'),
});

/** Extra items for particular kinds of node, shown above the common ones. */
const kindItems: { [K in NodeKind]?: (node: NodeOf<K>) => MenuEntry[] } = {
  math: (node) => [...mathMenu(node), { separator: true }, copyLatex(node.data.latex)],
  mathPlus: (node) => [
    ...mathMenu(node),
    { separator: true },
    copyLatex(node.data.latex),
    {
      label: 'Copy results',
      icon: Calculator,
      onSelect: async () => copyText(await mathPlusResultsText(node.id), 'results'),
    },
  ],
};

export function nodeMenu(node: AppNode): MenuEntry[] {
  const extra = (kindItems[node.type] as ((n: AppNode) => MenuEntry[]) | undefined)?.(node) ?? [];
  return [
    ...extra,
    ...(extra.length > 0 ? [{ separator: true } as const] : []),
    copy,
    duplicate,
    remove,
    { separator: true },
    ...order,
  ];
}

const titleCase = (word: string) => word[0].toUpperCase() + word.slice(1);

export function sectionMenu(node: NodeOf<'section'>): MenuEntry[] {
  return [
    {
      label: 'Rename',
      icon: PencilLine,
      // After the menu has closed and settled focus, or the title would lose it at once.
      onSelect: () => void setTimeout(() => useUiStore.getState().renameSection(node.id), 0),
    },
    {
      label: 'Colour',
      icon: PaintBucket,
      items: SECTION_COLORS.map((color) => ({
        label: titleCase(color),
        swatch: `var(--section-${color})`,
        checked: color === node.data.color,
        onSelect: () => useCanvasStore.getState().updateNodeData<'section'>(node.id, { color }),
      })),
    },
    { separator: true },
    copy,
    duplicate,
    {
      label: 'Remove section',
      icon: Ungroup,
      onSelect: () => useCanvasStore.getState().deleteNodes([node.id]),
    },
    {
      label: 'Delete section and contents',
      icon: Trash2,
      danger: true,
      onSelect: () => deleteSectionWithContents(node.id),
    },
  ];
}

const alignItems: { edge: AlignEdge; label: string; icon: typeof AlignStartVertical }[] = [
  { edge: 'left', label: 'Left', icon: AlignStartVertical },
  { edge: 'center', label: 'Centre horizontally', icon: AlignCenterVertical },
  { edge: 'right', label: 'Right', icon: AlignEndVertical },
  { edge: 'top', label: 'Top', icon: AlignStartHorizontal },
  { edge: 'middle', label: 'Centre vertically', icon: AlignCenterHorizontal },
  { edge: 'bottom', label: 'Bottom', icon: AlignEndHorizontal },
];

export function selectionMenu(actions: MenuActions): MenuEntry[] {
  return [
    { label: 'Wrap in section', icon: SquareDashed, hint: 'Ctrl+G', onSelect: actions.wrapInSection },
    {
      label: 'Align',
      icon: AlignHorizontalJustifyStart,
      items: alignItems.map(({ edge, label, icon }) => ({
        label,
        icon,
        onSelect: () => alignSelected(edge),
      })),
    },
    { separator: true },
    copy,
    duplicate,
    remove,
    { separator: true },
    ...order,
  ];
}

/**
 * The menu for whatever was right-clicked: the selection box, a node (selected first if it was not
 * part of the selection) or the empty canvas.
 */
export function menuFor(target: Element | null, at: XYPosition, actions: MenuActions): MenuEntry[] {
  if (target?.closest('.react-flow__nodesselection-rect')) return selectionMenu(actions);
  const id = target?.closest<HTMLElement>('.react-flow__node')?.dataset.id;
  const hit = useCanvasStore.getState().nodes.find((n) => n.id === id);
  if (!hit) return canvasMenu(at, actions);
  if (!hit.selected) useCanvasStore.getState().setSelection((n) => n.id === hit.id);
  if (useCanvasStore.getState().nodes.filter((n) => n.selected).length > 1) return selectionMenu(actions);
  return hit.type === 'section' ? sectionMenu(hit) : nodeMenu(hit);
}
