import { Check } from 'lucide-react';
import { SECTION_COLORS, type SectionColor } from '@/model/types';

export const swatch = (color: SectionColor) => `var(--section-${color})`;

/**
 * A row of colour buttons. With `onClear`, a plain swatch first restores the default.
 * Pressing a swatch keeps focus where it was, so a title being typed stays in its field.
 */
export function ColorSwatches({
  value,
  onChange,
  onClear,
}: {
  value?: SectionColor;
  onChange: (color: SectionColor) => void;
  onClear?: () => void;
}) {
  const button = 'flex size-6 cursor-pointer items-center justify-center rounded-full border border-fg/20';
  const check = <Check className="size-3.5 text-slate-900/70" />;
  return (
    <div className="flex gap-1.5">
      {onClear && (
        <button
          type="button"
          aria-label="Default"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClear}
          className={`${button} bg-surface`}
        >
          {!value && <Check className="size-3.5 text-fg/70" />}
        </button>
      )}
      {SECTION_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={color}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange(color)}
          className={button}
          style={{ backgroundColor: swatch(color) }}
        >
          {color === value && check}
        </button>
      ))}
    </div>
  );
}
