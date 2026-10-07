import type { LucideIcon } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  icon?: LucideIcon;
  /** Right-aligned hint, e.g. a keyboard shortcut. */
  hint?: string;
  disabled?: boolean;
  danger?: boolean;
}
export type MenuEntry = MenuItem | { separator: true } | { heading: string };

const itemClass =
  'flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-surface-2 data-[disabled]:opacity-40';

interface MenuProps {
  trigger: ReactNode;
  items: MenuEntry[];
  /** Rendered above the items, e.g. who or what the menu belongs to. */
  header?: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function Menu({ trigger, items, header, align = 'start', className }: MenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={8}
          className={cn(
            'z-50 w-60 rounded-2xl border border-border bg-surface p-1.5 text-fg shadow-2xl',
            className,
          )}
        >
          {header}
          {items.map((entry, i) => {
            if ('separator' in entry)
              // biome-ignore lint/suspicious/noArrayIndexKey: static list, separators have no identity.
              return <DropdownMenu.Separator key={i} className="mx-1.5 my-1 h-px bg-border" />;
            if ('heading' in entry)
              return (
                <DropdownMenu.Label
                  key={entry.heading}
                  className="px-2.5 pt-2 pb-1 text-xs font-medium text-muted"
                >
                  {entry.heading}
                </DropdownMenu.Label>
              );
            const Icon = entry.icon;
            return (
              <DropdownMenu.Item
                key={entry.label}
                disabled={entry.disabled}
                onSelect={entry.onSelect}
                className={cn(itemClass, entry.danger && 'text-danger data-[highlighted]:bg-danger/10')}
              >
                {Icon && <Icon className="size-4 shrink-0 text-muted" />}
                {entry.label}
                {entry.hint && <span className="ml-auto text-xs text-muted">{entry.hint}</span>}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
