import { NodeResizer } from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';

interface NodeShellProps {
  selected: boolean;
  /** When set, renders a header bar that doubles as a drag handle. */
  title?: string;
  icon?: LucideIcon;
  /** Header controls; hidden in read-only mode. */
  actions?: ReactNode;
  resize?: {
    minWidth: number;
    minHeight: number;
    keepAspectRatio?: boolean;
    onResizing?: (resizing: boolean) => void;
  };
  className?: string;
  children: ReactNode;
}

/** Common card chrome for every node: border, selection ring, optional header and resize handles. */
export function NodeShell({
  selected,
  title,
  icon: Icon,
  actions,
  resize,
  className,
  children,
}: NodeShellProps) {
  const readOnly = useReadOnly();
  return (
    <>
      {resize && (
        <NodeResizer
          isVisible={selected && !readOnly}
          minWidth={resize.minWidth}
          minHeight={resize.minHeight}
          keepAspectRatio={resize.keepAspectRatio}
          onResizeStart={() => resize.onResizing?.(true)}
          onResizeEnd={() => resize.onResizing?.(false)}
          lineClassName="!border-accent/60"
          handleClassName="!size-2.5 !rounded-sm !border-accent !bg-surface"
        />
      )}
      <div
        className={cn(
          'flex h-full w-full flex-col overflow-hidden rounded-lg border bg-surface text-fg shadow-sm transition-shadow',
          selected ? 'border-accent shadow-md ring-2 ring-accent/25' : 'border-border',
          className,
        )}
      >
        {title && (
          <header className="flex h-9 shrink-0 cursor-grab items-center gap-2 border-b border-border bg-surface-2 px-3 text-xs font-semibold tracking-wide text-muted uppercase">
            {Icon && <Icon className="size-3.5" />}
            <span>{title}</span>
            {!readOnly && actions && (
              <div className="nodrag ml-auto flex items-center gap-1 normal-case">{actions}</div>
            )}
          </header>
        )}
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </>
  );
}

/** Small "− label +" stepper used for row/column counts. */
export function Stepper({
  label,
  onDecrement,
  onIncrement,
}: {
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  const button = 'cursor-pointer px-2 py-0.5 hover:bg-surface-2 hover:text-fg';
  return (
    <div className="flex items-center overflow-hidden rounded border border-border bg-surface text-xs font-medium text-muted">
      <button type="button" className={button} onClick={onDecrement} aria-label={`Remove ${label}`}>
        −
      </button>
      <span className="px-1">{label}</span>
      <button type="button" className={button} onClick={onIncrement} aria-label={`Add ${label}`}>
        +
      </button>
    </div>
  );
}
