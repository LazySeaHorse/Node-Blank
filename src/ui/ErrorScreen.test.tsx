import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary, isStaleChunkError } from './ErrorScreen';

function Boom({ message }: { message: string }): never {
  throw new Error(message);
}

afterEach(() => vi.restoreAllMocks());

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>fine</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('fine')).toBeTruthy();
  });

  it('renders the fallback when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom message="kaput" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
    expect(screen.getByText(/saved in this browser/)).toBeTruthy();
  });

  it('shows the stale-version variant for chunk load failures', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom message="Failed to fetch dynamically imported module: /a.js" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('A new version is available')).toBeTruthy();
    expect(isStaleChunkError(new Error('nope'))).toBe(false);
  });
});
