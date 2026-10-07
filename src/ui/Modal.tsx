import { X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Shown before the title, in the accent colour. */
  icon?: ReactNode;
  children: ReactNode;
  /** Pinned below the scrolling body. */
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-surface text-fg shadow-2xl',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-3 bg-gradient-to-b from-surface-2 to-transparent px-6 pt-5 pb-3">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-2 text-xl font-medium tracking-tight">
                {icon && <span className="text-accent [&>svg]:size-5">{icon}</span>}
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <IconButton icon={X} label="Close" size="sm" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 overflow-y-auto px-6 pt-2 pb-5">{children}</div>
          {footer && (
            <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2/40 px-6 py-3.5">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
