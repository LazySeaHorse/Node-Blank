import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export type AlertVariant = 'default' | 'danger' | 'info' | 'warning' | 'success';
export type AlertSize = 'default' | 'sm';

const base =
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-xl border leading-relaxed has-[>svg]:grid-cols-[auto_1fr] [&>svg]:shrink-0 [&>svg]:text-current';

/** `default` is a neutral card; the other tones tint it. (Badge's `default` is a solid accent fill.) */
const variants: Record<AlertVariant, string> = {
  default: 'border-border bg-surface text-fg',
  danger: 'border-border bg-surface text-danger *:data-[slot=alert-description]:text-danger/90',
  info: 'border-accent/15 bg-accent/5 [&>svg]:text-accent',
  warning: 'border-warning/20 bg-warning/5 [&>svg]:text-warning',
  success: 'border-success/20 bg-success/5 [&>svg]:text-success',
};

const sizes: Record<AlertSize, string> = {
  default: 'px-3.5 py-3 text-sm has-[>svg]:gap-x-2.5 [&>svg]:size-4 [&>svg]:translate-y-[3px]',
  sm: 'p-3 text-xs has-[>svg]:gap-x-2.5 [&>svg]:size-3.5 [&>svg]:translate-y-0.5',
};

export function Alert({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ComponentProps<'div'> & { variant?: AlertVariant; size?: AlertSize }) {
  return (
    <div
      data-slot="alert"
      // Only errors interrupt a screen reader; other notes are static.
      role={variant === 'danger' ? 'alert' : 'note'}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium', className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('col-start-2 grid justify-items-start gap-1 text-muted [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
}
