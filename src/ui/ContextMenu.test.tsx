import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderUi } from '@/test/render';
import { ContextMenu } from './ContextMenu';
import type { MenuEntry } from './Menu';

const setup = (items: MenuEntry[], at: { x: number; y: number } | null = { x: 40, y: 50 }) => {
  const onClose = vi.fn();
  renderUi(<ContextMenu at={at} items={items} onClose={onClose} />);
  return onClose;
};

describe('ContextMenu', () => {
  it('opens at a point and runs the chosen item', async () => {
    const onSelect = vi.fn();
    const onClose = setup([
      { label: 'Copy', hint: 'Ctrl+C', onSelect },
      { separator: true },
      { heading: 'More' },
    ]);
    expect(await screen.findByRole('menu')).toBeTruthy();
    expect(screen.getByText('Ctrl+C')).toBeTruthy();
    await userEvent.click(screen.getByRole('menuitem', { name: /Copy/ }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows submenus', async () => {
    const onSelect = vi.fn();
    setup([{ label: 'Add node', items: [{ label: 'Text', onSelect }] }]);
    await userEvent.click(await screen.findByRole('menuitem', { name: /Add node/ }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Text' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('stays closed without a point', () => {
    setup([{ label: 'Copy', onSelect: () => {} }], null);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes on Escape', async () => {
    const onClose = setup([{ label: 'Copy', onSelect: () => {} }]);
    await screen.findByRole('menu');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
