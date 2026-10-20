import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_VIEWPORT, SECTION_COLORS } from '@/model/types';
import { createNode, searchTextOf } from '@/nodes/factory';
import { undo, useCanvasStore } from '@/store/canvasStore';
import type { MenuEntry, MenuItem, MenuSub } from '@/ui/Menu';
import { canvasMenu, menuFor } from './menus';

const isSub = (e: MenuEntry): e is MenuSub => 'items' in e;
const isItem = (e: MenuEntry): e is MenuItem => 'onSelect' in e;
const find = (entries: MenuEntry[], label: string) =>
  entries.find((e) => (isSub(e) || isItem(e)) && e.label === label);

const actions = () => ({
  addNode: vi.fn(),
  insertImage: vi.fn(),
  insertVideo: vi.fn(),
  insertWeb: vi.fn(),
  insertPdf: vi.fn(),
  fitView: vi.fn(),
  wrapInSection: vi.fn(),
});

const state = () => useCanvasStore.getState();
const run = (entries: MenuEntry[], label: string) => {
  const entry = find(entries, label);
  if (!entry || !isItem(entry)) throw new Error(`no item ${label}`);
  entry.onSelect();
};
const sub = (entries: MenuEntry[], label: string) => {
  const entry = find(entries, label);
  if (!entry || !isSub(entry)) throw new Error(`no submenu ${label}`);
  return entry.items;
};
const labels = (entries: MenuEntry[]) => entries.flatMap((e) => (isItem(e) || isSub(e) ? [e.label] : []));
/** A stand-in for the element React Flow renders for a node. */
const element = (cls: string, id?: string) => {
  const el = document.createElement('div');
  el.className = cls;
  if (id) el.dataset.id = id;
  document.body.append(el);
  return el;
};

beforeEach(() => state().load({ nodes: [], viewport: DEFAULT_VIEWPORT }));

describe('canvas menu', () => {
  it('adds a node of the chosen kind at the click point', () => {
    const a = actions();
    const entries = canvasMenu({ x: 10, y: 20 }, a);
    const add = find(entries, 'Add node');
    if (!add || !isSub(add)) throw new Error('missing Add node submenu');
    const labels = add.items.filter(isItem).map((i) => i.label);
    expect(labels).toEqual(expect.arrayContaining(['Text', 'Math', 'Image', 'Video', 'Web']));
    expect(labels).not.toContain('Section');
    (find(add.items, 'Text') as MenuItem).onSelect();
    expect(a.addNode).toHaveBeenCalledWith('text', { x: 10, y: 20 });
    (find(add.items, 'Image') as MenuItem).onSelect();
    expect(a.insertImage).toHaveBeenCalled();
    (find(add.items, 'Web') as MenuItem).onSelect();
    expect(a.insertWeb).toHaveBeenCalled();
  });

  it('offers paste, organise, fit view and select all', () => {
    const a = actions();
    const entries = canvasMenu({ x: 0, y: 0 }, a);
    for (const label of ['Paste', 'Organise', 'Fit view', 'Select all'])
      expect(find(entries, label)).toBeTruthy();
    (find(entries, 'Fit view') as MenuItem).onSelect();
    expect(a.fitView).toHaveBeenCalled();
  });
});

describe('node menus', () => {
  const at = { x: 0, y: 0 };

  it('targets the canvas when nothing was hit', () => {
    expect(labels(menuFor(null, at, actions()))).toContain('Add node');
  });

  it('selects an unselected node before opening its menu', () => {
    const [a, b] = [createNode('math', { x: 0, y: 0 }), createNode('math', { x: 300, y: 0 })];
    state().load({ nodes: [{ ...a, selected: true }, b], viewport: DEFAULT_VIEWPORT });
    const entries = menuFor(element('react-flow__node', b.id), at, actions());
    expect(
      state()
        .nodes.filter((n) => n.selected)
        .map((n) => n.id),
    ).toEqual([b.id]);
    expect(labels(entries)).toEqual(
      expect.arrayContaining(['Copy', 'Duplicate', 'Delete', 'Bring to front', 'Send to back', 'Copy LaTeX']),
    );
  });

  it('duplicates and deletes the node it was opened on', () => {
    const a = createNode('text', { x: 0, y: 0 });
    state().load({ nodes: [a], viewport: DEFAULT_VIEWPORT });
    const entries = menuFor(element('react-flow__node', a.id), at, actions());
    expect(labels(entries)).not.toContain('Copy LaTeX');
    run(entries, 'Duplicate');
    expect(state().nodes).toHaveLength(2);
    run(menuFor(element('react-flow__node', a.id), at, actions()), 'Delete');
    expect(state().nodes.map((n) => n.id)).not.toContain(a.id);
    undo();
    expect(state().nodes.map((n) => n.id)).toContain(a.id);
  });

  it('offers a title for any node but a section, and finds the node by it', () => {
    const a = createNode('text', { x: 0, y: 0 });
    state().load({ nodes: [a], viewport: DEFAULT_VIEWPORT });
    const entries = menuFor(element('react-flow__node', a.id), at, actions());
    expect(labels(entries)[0]).toBe('Add title');
    state().updateNodeData<'text'>(a.id, { title: 'Intro' });
    const titled = state().nodes[0];
    expect(labels(menuFor(element('react-flow__node', a.id), at, actions()))[0]).toBe('Rename');
    expect(searchTextOf(titled).startsWith('Intro')).toBe(true);
  });

  it('adds Math+ result copying', () => {
    const a = createNode('mathPlus', { x: 0, y: 0 });
    state().load({ nodes: [a], viewport: DEFAULT_VIEWPORT });
    expect(labels(menuFor(element('react-flow__node', a.id), at, actions()))).toEqual(
      expect.arrayContaining(['Copy LaTeX', 'Copy results']),
    );
  });

  it('tints a math node background and clears it again', () => {
    const a = createNode('math', { x: 0, y: 0 });
    state().load({ nodes: [a], viewport: DEFAULT_VIEWPORT });
    const background = () => sub(menuFor(element('react-flow__node', a.id), at, actions()), 'Background');
    expect(
      background()
        .filter(isItem)
        .map((i) => i.label),
    ).toEqual(['None', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Orange', 'Gray']);
    run(background(), 'Blue');
    expect(state().nodes[0].data).toMatchObject({ color: 'blue' });
    expect((find(background(), 'Blue') as MenuItem).checked).toBe(true);
    run(background(), 'None');
    expect(state().nodes[0].data).not.toHaveProperty('color', 'blue');
  });

  it('offers the section menu on a section and recolours it', () => {
    const s = createNode('section', { x: 0, y: 0 });
    state().load({ nodes: [s], viewport: DEFAULT_VIEWPORT });
    const entries = menuFor(element('react-flow__node react-flow__node-section', s.id), at, actions());
    expect(labels(entries)).toEqual(
      expect.arrayContaining(['Rename', 'Colour', 'Remove section', 'Delete section and contents']),
    );
    const colours = sub(entries, 'Colour');
    expect(colours.filter(isItem).map((c) => c.label.toLowerCase())).toEqual([...SECTION_COLORS]);
    run(colours, 'Blue');
    expect(state().nodes[0].data).toMatchObject({ color: 'blue' });
  });

  it('removes a section without touching what is inside', () => {
    const s = createNode('section', { x: 0, y: 0 });
    const inside = createNode('math', { x: 50, y: 80 });
    state().load({ nodes: [s, inside], viewport: DEFAULT_VIEWPORT });
    run(menuFor(element('react-flow__node', s.id), at, actions()), 'Remove section');
    expect(state().nodes.map((n) => n.id)).toEqual([inside.id]);
  });

  it('deletes a section with its contents', () => {
    const s = createNode('section', { x: 0, y: 0 });
    const inside = createNode('math', { x: 50, y: 80 });
    state().load({ nodes: [s, inside], viewport: DEFAULT_VIEWPORT });
    run(menuFor(element('react-flow__node', s.id), at, actions()), 'Delete section and contents');
    expect(state().nodes).toHaveLength(0);
  });

  it('offers the selection menu on the selection box or a multi-selection', () => {
    const [a, b] = [createNode('math', { x: 0, y: 0 }), createNode('math', { x: 300, y: 0 })];
    state().load({
      nodes: [
        { ...a, selected: true },
        { ...b, selected: true },
      ],
      viewport: DEFAULT_VIEWPORT,
    });
    const a2 = actions();
    for (const target of [element('react-flow__nodesselection-rect'), element('react-flow__node', a.id)]) {
      const entries = menuFor(target, at, a2);
      expect(labels(entries)).toEqual(
        expect.arrayContaining(['Wrap in section', 'Copy', 'Duplicate', 'Delete', 'Align']),
      );
    }
    const entries = menuFor(element('react-flow__nodesselection-rect'), at, a2);
    expect(labels(sub(entries, 'Align'))).toEqual([
      'Left',
      'Centre horizontally',
      'Right',
      'Top',
      'Centre vertically',
      'Bottom',
    ]);
    run(sub(entries, 'Align'), 'Left');
    expect(state().nodes.map((n) => n.position.x)).toEqual([0, 0]);
    run(entries, 'Wrap in section');
    expect(a2.wrapInSection).toHaveBeenCalled();
  });
});
