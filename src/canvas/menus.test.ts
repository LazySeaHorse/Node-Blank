import { describe, expect, it, vi } from 'vitest';
import type { MenuEntry, MenuItem, MenuSub } from '@/ui/Menu';
import { canvasMenu } from './menus';

const isSub = (e: MenuEntry): e is MenuSub => 'items' in e;
const isItem = (e: MenuEntry): e is MenuItem => 'onSelect' in e;
const find = (entries: MenuEntry[], label: string) =>
  entries.find((e) => (isSub(e) || isItem(e)) && e.label === label);

const actions = () => ({
  addNode: vi.fn(),
  insertImage: vi.fn(),
  insertVideo: vi.fn(),
  fitView: vi.fn(),
});

describe('canvas menu', () => {
  it('adds a node of the chosen kind at the click point', () => {
    const a = actions();
    const entries = canvasMenu({ x: 10, y: 20 }, a);
    const add = find(entries, 'Add node');
    if (!add || !isSub(add)) throw new Error('missing Add node submenu');
    const labels = add.items.filter(isItem).map((i) => i.label);
    expect(labels).toEqual(expect.arrayContaining(['Text', 'Math', 'Image', 'Video']));
    expect(labels).not.toContain('Section');
    (find(add.items, 'Text') as MenuItem).onSelect();
    expect(a.addNode).toHaveBeenCalledWith('text', { x: 10, y: 20 });
    (find(add.items, 'Image') as MenuItem).onSelect();
    expect(a.insertImage).toHaveBeenCalled();
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
