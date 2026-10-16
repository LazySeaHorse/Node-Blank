import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderUi } from '@/test/render';
import { ContextMenu } from './ContextMenu';
import type { MenuEntry } from './Menu';

const setup = (items: MenuEntry[], disabled = false) => {
  renderUi(
    <ContextMenu items={items} disabled={disabled}>
      <div data-testid="area">area</div>
    </ContextMenu>,
  );
  return screen.getByTestId('area');
};

describe('ContextMenu', () => {
  it('opens on contextmenu and runs the chosen item', async () => {
    const onSelect = vi.fn();
    const area = setup([
      { label: 'Copy', hint: 'Ctrl+C', onSelect },
      { separator: true },
      { heading: 'More' },
    ]);
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.contextMenu(area, { clientX: 40, clientY: 50 });
    expect(await screen.findByRole('menu')).toBeTruthy();
    expect(screen.getByText('Ctrl+C')).toBeTruthy();
    await userEvent.click(screen.getByRole('menuitem', { name: /Copy/ }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('shows submenus', async () => {
    const onSelect = vi.fn();
    const area = setup([{ label: 'Add node', items: [{ label: 'Text', onSelect }] }]);
    fireEvent.contextMenu(area);
    const trigger = await screen.findByRole('menuitem', { name: /Add node/ });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Text' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('does not open when disabled', () => {
    const area = setup([{ label: 'Copy', onSelect: () => {} }], true);
    fireEvent.contextMenu(area);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
