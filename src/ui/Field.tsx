import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Switch } from './Switch';

/** Wraps a form control with a label. */
export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: ReactNode;
  /** Short help shown under the label. */
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-3', className)}>
      {(label || hint) && (
        <div className="mb-1.5">
          {label && (
            <label htmlFor={htmlFor} className="block font-medium text-muted text-xs">
              {label}
            </label>
          )}
          {hint && <p className="mt-0.5 text-2xs text-muted leading-snug">{hint}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/** Small section heading inside a panel or dialog. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('mb-2 font-medium text-fg/80 text-xs', className)}>{children}</h3>;
}

/** A switch with its label on one row. */
export function SwitchField({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the Radix switch button inside is the labelled control.
    <label className="group flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-surface-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className="font-medium text-fg text-xs">{label}</span>
    </label>
  );
}
