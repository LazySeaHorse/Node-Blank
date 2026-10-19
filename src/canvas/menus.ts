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
  ArrowLeftRight,
  ArrowUpToLine,
  Calculator,
  Clipboard,
  Copy,
  CopyPlus,
  Divide,
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
  X,
} from 'lucide-react';
import { copyText } from '@/lib/clipboard';
import { columnLabel } from '@/lib/gridOps';
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

const rename = (node: Exclude<AppNode, NodeOf<'section'>>): MenuEntry => ({
  label: node.data.title ? 'Rename' : 'Add title',
  icon: PencilLine,
  // After the menu has closed and settled focus, or the title would lose it at once.
  onSelect: () => void setTimeout(() => useUiStore.getState().renameNode(node.id), 0),
});

/** Row operations offered on a sheet's row or column header; each starts a command in the sheet's command box. */
export function sheetLineMenu(node: NodeOf<'sheet'>, line: string): MenuEntry[] {
  const axis = line[0] === 'R' ? 'row' : 'column';
  const start = (text: string) => () =>
    void setTimeout(() => useUiStore.getState().prefillSheetCommand(node.id, text), 0);
  const heading =
    axis === 'row' ? `Row ${line.slice(1)}` : `Column ${columnLabel(Number(line.slice(1)) - 1)} (${line})`;
  return [
    { heading },
    { label: `Add a multiple of another ${axis}…`, icon: Plus, onSelect: start(`${line} += `) },
    { label: `Multiply ${axis} by…`, icon: X, onSelect: start(`${line} *= `) },
    { label: `Divide ${axis} by…`, icon: Divide, onSelect: start(`${line} /= `) },
    { label: `Swap with another ${axis}…`, icon: ArrowLeftRight, onSelect: start(`${line} <-> ${line[0]}`) },
  ];
}

export function nodeMenu(node: Exclude<AppNode, NodeOf<'section'>>): MenuEntry[] {
  const extra = (kindItems[node.type] as ((n: AppNode) => MenuEntry[]) | undefined)?.(node) ?? [];
  return [
    rename(node),
    { separator: true },
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
  const line = target?.closest<HTMLElement>('[data-sheet-line]')?.dataset.sheetLine;
  if (hit.type === 'sheet' && line) return sheetLineMenu(hit, line);
  if (useCanvasStore.getState().nodes.filter((n) => n.selected).length > 1) return selectionMenu(actions);
  return hit.type === 'section' ? sectionMenu(hit) : nodeMenu(hit);
}
