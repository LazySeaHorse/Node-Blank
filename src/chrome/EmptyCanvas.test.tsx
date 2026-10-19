import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCanvasStore } from '@/store/canvasStore';
import { AppToaster, celebrate } from '@/ui/toast';
import { EmptyCanvas, SLEEPY_AFTER_MS } from './EmptyCanvas';

describe('EmptyCanvas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useCanvasStore.setState({ nodes: [] });
  });
  afterEach(() => {
    vi.useRealTimers();
    useCanvasStore.setState({ nodes: [] });
  });

  it('shows only while there are no nodes', () => {
    render(<EmptyCanvas />);
    expect(screen.queryByTestId('empty-canvas')).not.toBeNull();
    act(() => useCanvasStore.setState({ nodes: [{ id: 'a' } as never] }));
    expect(screen.queryByTestId('empty-canvas')).toBeNull();
  });

  it('falls asleep after idling and wakes on activity', () => {
    render(<EmptyCanvas />);
    expect(document.querySelector('[data-mood="wave"]')).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(SLEEPY_AFTER_MS + 100);
    });
    expect(document.querySelector('[data-mood="sleepy"]')).not.toBeNull();
    act(() => {
      window.dispatchEvent(new Event('pointermove'));
    });
    expect(document.querySelector('[data-mood="wave"]')).not.toBeNull();
  });
});

describe('celebrate', () => {
  it('renders the message with the mascot', async () => {
    vi.useRealTimers();
    render(<AppToaster />);
    act(() => {
      celebrate('Imported 3 nodes');
    });
    expect(await screen.findByText('Imported 3 nodes')).toBeTruthy();
  });
});
