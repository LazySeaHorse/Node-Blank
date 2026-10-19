import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/ui/Button';
import { Mascot } from '@/ui/Mascot';

const STALE_CHUNK =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i;

export const isStaleChunkError = (error: unknown) =>
  STALE_CHUNK.test(error instanceof Error ? `${error.name} ${error.message}` : String(error));

/** Full-page fallback when the app crashes. */
export function ErrorScreen({ error }: { error?: unknown }) {
  const stale = isStaleChunkError(error);
  return (
    <div className="flex min-h-dvh w-screen flex-col items-center justify-center gap-2 bg-canvas px-6 text-center text-fg">
      <Mascot mood="tangled" animated className="mb-2 size-32" title="Tangled octopus" />
      <div role="alert" className="flex flex-col items-center gap-2">
        <h1 className="font-semibold text-xl tracking-tight">
          {stale ? 'A new version is available' : 'Something went wrong'}
        </h1>
        <p className="max-w-sm text-muted text-sm leading-relaxed">
          {stale
            ? 'This page is out of date and could not load a piece of itself. Reload to get the latest version.'
            : 'The app hit an unexpected error. Reloading usually fixes it.'}{' '}
          Your canvases are saved in this browser, so nothing is lost.
        </p>
      </div>
      <Button variant="primary" className="mt-3" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}

type Props = {
  children: ReactNode /** Rendered instead of the full-page screen, e.g. a card for one failed node. */;
  fallback?: (error: unknown) => ReactNode;
};
type State = { error: unknown; failed: boolean };

/** Catches render errors below it and shows {@link ErrorScreen} instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: undefined, failed: false };

  static getDerivedStateFromError(error: unknown): State {
    return { error, failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const { fallback } = this.props;
    return fallback ? fallback(this.state.error) : <ErrorScreen error={this.state.error} />;
  }
}
