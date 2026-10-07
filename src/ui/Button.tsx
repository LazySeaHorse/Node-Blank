import type { LucideIcon } from 'lucide-react';
import { Tooltip } from 'radix-ui';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:brightness-110',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
  danger: 'text-danger hover:bg-danger/10',
};

export function Button({
  variant = 'ghost',
  className,
  ...props
}: ComponentPropsWithRef<'button'> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function WithTooltip({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={6}
          className="z-50 rounded-lg bg-fg px-2 py-1 text-xs text-canvas shadow-md"
        >
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface IconButtonProps extends ComponentPropsWithRef<'button'> {
  icon: LucideIcon;
  label: string;
  /** Shown after the label in the tooltip, e.g. a keyboard shortcut. */
  hint?: string;
  active?: boolean;
  size?: 'sm' | 'md';
}

export function IconButton({
  icon: Icon,
  label,
  hint,
  active,
  size = 'md',
  className,
  ...props
}: IconButtonProps) {
  return (
    <WithTooltip label={hint ? `${label} · ${hint}` : label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center rounded-xl transition-colors disabled:pointer-events-none disabled:opacity-40',
          size === 'md' ? 'size-9' : 'size-7',
          active ? 'bg-accent text-accent-fg' : 'text-fg hover:bg-accent/10 hover:text-accent',
          className,
        )}
        {...props}
      >
        <Icon className={size === 'md' ? 'size-[18px]' : 'size-4'} />
      </button>
    </WithTooltip>
  );
}
