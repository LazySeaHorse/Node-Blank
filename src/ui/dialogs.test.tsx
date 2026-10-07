import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderUi } from '@/test/render';
import { askText, confirmAction, DialogHost } from './dialogs';

describe('dialogs', () => {
  it('askText resolves with the entered text', async () => {
    renderUi(<DialogHost />);
    let promise!: Promise<string | null>;
    act(() => {
      promise = askText({ title: 'Name it', initial: 'Old' });
    });
    const input = await screen.findByDisplayValue('Old');
    await userEvent.clear(input);
    await userEvent.type(input, 'New{Enter}');
    expect(await promise).toBe('New');
    expect(screen.queryByText('Name it')).toBeNull();
  });

  it('askText resolves null on cancel', async () => {
    renderUi(<DialogHost />);
    let promise!: Promise<string | null>;
    act(() => {
      promise = askText({ title: 'Name it' });
    });
    await userEvent.click(await screen.findByText('Cancel'));
    expect(await promise).toBeNull();
  });

  it('confirmAction resolves true on confirm', async () => {
    renderUi(<DialogHost />);
    let promise!: Promise<boolean>;
    act(() => {
      promise = confirmAction({ title: 'Delete?', message: 'Gone forever', confirmLabel: 'Delete' });
    });
    expect(await screen.findByText('Gone forever')).toBeTruthy();
    await userEvent.click(screen.getByText('Delete'));
    expect(await promise).toBe(true);
  });
});
