import { ToggleGroup } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label?: string;
  icon?: ReactNode;
  title?: string;
  'aria-label'?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  /** NoInfer: T comes from options/value, so a useState setter can be passed straight in. */
  onValueChange: (value: NoInfer<T>) => void;
  className?: string;
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  className,
  disabled,
}: SegmentedControlProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      disabled={disabled}
      onValueChange={(v) => {
        if (v) onValueChange(v as T);
      }}
      className={cn('relative flex rounded-xl bg-surface-2 p-1 font-medium text-xs', className)}
    >
      {options.map((opt) => (
        <ToggleGroup.Item
          key={opt.value}
          value={opt.value}
          disabled={opt.disabled}
          title={opt.title ?? opt.label ?? opt.value}
          aria-label={opt['aria-label'] ?? opt.label ?? opt.value}
          className={cn(
            'z-10 flex flex-1 cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium text-xs transition-colors disabled:pointer-events-none disabled:opacity-50',
            value === opt.value ? 'text-fg' : 'text-muted hover:text-fg',
          )}
        >
          {opt.icon}
          {opt.label ? <span>{opt.label}</span> : null}
        </ToggleGroup.Item>
      ))}
      {/* Sliding indicator */}
      <div
        aria-hidden
        className="absolute top-1 bottom-1 z-0 rounded-lg bg-surface transition-all duration-200 ease-spring motion-reduce:transition-none"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${(index * 100) / options.length}% + 2px)`,
        }}
      />
    </ToggleGroup.Root>
  );
}
