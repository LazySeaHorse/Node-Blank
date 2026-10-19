import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  /** Icon tile. Mutually exclusive with `mascot`; if both are given, `mascot` wins. */
  icon?: LucideIcon;
  /** Mascot art in place of the icon tile. Mutually exclusive with `icon`. */
  mascot?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** 'default' is roomy; 'compact' fits menus and small panels. */
  size?: 'default' | 'compact';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  mascot,
  title,
  description,
  action,
  size = 'default',
  className,
}: EmptyStateProps) {
  const compact = size === 'compact';
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-4 py-8' : 'px-6 py-12',
        className,
      )}
    >
      {mascot ? (
        <div className="mb-2">{mascot}</div>
      ) : (
        Icon && (
          <div
            className={cn(
              'mb-3.5 flex items-center justify-center rounded-2xl border border-border bg-surface-2 text-muted',
              compact ? 'size-12' : 'size-16',
            )}
          >
            <Icon size={compact ? 22 : 28} strokeWidth={1.5} />
          </div>
        )
      )}
      <p className="font-medium text-fg text-sm tracking-tight">{title}</p>
      {description && <p className="mt-1 max-w-[260px] text-muted text-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
