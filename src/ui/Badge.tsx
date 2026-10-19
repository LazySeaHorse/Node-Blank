import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'muted';
export type BadgeSize = 'default' | 'sm' | 'micro';

const base =
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border font-medium [&>svg]:pointer-events-none [&>svg]:size-3';

/** `default` is a solid accent fill; the tinted tones are quieter. (Alert's `default` is a neutral card.) */
const variants: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-accent text-accent-fg',
  info: 'border-accent/20 bg-accent/10 text-accent',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  danger: 'border-danger/20 bg-danger/10 text-danger',
  muted: 'border-border/50 bg-surface-2 text-muted',
};

const sizes: Record<BadgeSize, string> = {
  default: 'px-2 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-2xs',
  micro: 'px-1.5 py-0.5 text-micro uppercase tracking-wider',
};

export function Badge({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ComponentProps<'span'> & { variant?: BadgeVariant; size?: BadgeSize }) {
  return <span className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
