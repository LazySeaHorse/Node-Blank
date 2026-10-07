import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';

/** Floating surface for toolbars and controls over the canvas. */
export function Panel({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-lg',
        className,
      )}
      {...props}
    />
  );
}

export const Divider = () => <div className="mx-1 h-6 w-px bg-border" />;
