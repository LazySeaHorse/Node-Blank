import { MathfieldElement } from 'mathlive';
import 'mathlive/fonts.css';
import { useEffect, useEffectEvent, useRef } from 'react';
import { cn } from '@/lib/cn';

// Fonts come from the bundled CSS above; no keyboard click sounds.
MathfieldElement.fontsDirectory = null;
MathfieldElement.soundsDirectory = null;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': DetailedHTMLProps<HTMLAttributes<MathfieldElement>, MathfieldElement>;
    }
  }
}

interface MathFieldProps {
  value: string;
  onChange?: (latex: string) => void;
  readOnly?: boolean;
  /** Shift+Enter inserts a line break. */
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

/** React wrapper around MathLive's `<math-field>` web component. */
export function MathField({
  value,
  onChange,
  readOnly = false,
  multiline = false,
  placeholder,
  className,
}: MathFieldProps) {
  const ref = useRef<MathfieldElement>(null);
  const emitChange = useEffectEvent((latex: string) => onChange?.(latex));

  useEffect(() => {
    const field = ref.current;
    if (field && field.value !== value) field.setValue(value, { silenceNotifications: true });
  }, [value]);

  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    field.readOnly = readOnly;
    field.mathVirtualKeyboardPolicy = 'manual';
    if (placeholder) field.placeholder = placeholder;
  }, [readOnly, placeholder]);

  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    const handleInput = () => emitChange(field.value);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (multiline && event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        field.executeCommand(['insert', '\\\\']);
      }
    };
    field.addEventListener('input', handleInput);
    field.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      field.removeEventListener('input', handleInput);
      field.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [multiline]);

  // nodrag/nopan/nowheel/nokey stop React Flow from treating interaction with the field as canvas input.
  return <math-field ref={ref} className={cn('nodrag nopan nowheel nokey', className)} />;
}
