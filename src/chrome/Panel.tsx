import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';

/** Floating surface for toolbars and controls over the canvas. */
export function Panel({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-1 rounded-2xl border border-border bg-surface p-1 shadow-xl',
        className,
      )}
      {...props}
    />
  );
}

export const Divider = ({ className }: { className?: string }) => (
  <div className={cn('mx-1.5 h-6 w-px shrink-0 bg-border', className)} />
);
