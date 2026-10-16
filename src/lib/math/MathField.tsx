import { MathfieldElement } from 'mathlive';
import 'mathlive/fonts.css';
import { useEffect, useEffectEvent, useRef } from 'react';
import { cn } from '@/lib/cn';
import { useCanvasStore } from '@/store/canvasStore';
import { flattenDisplaylines } from './normalize';

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
  const emitChange = useEffectEvent((latex: string) => onChange?.(flattenDisplaylines(latex)));

  useEffect(() => {
    const field = ref.current;
    // Stored values are flattened (see emitChange), so compare like with like or the caret would jump.
    if (!field || flattenDisplaylines(field.value) === value) return;
    try {
      field.setValue(value, { silenceNotifications: true });
    } catch (error) {
      // A value MathLive cannot parse must not take the whole canvas down with this one node.
      console.error('Could not load math into the field', error);
    }
  }, [value]);

  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    field.readOnly = readOnly;
    field.mathVirtualKeyboardPolicy = 'manual';
    // The canvas context menu replaces MathLive's (see canvas/mathMenu.ts).
    field.menuItems = [];
    if (placeholder) field.placeholder = placeholder;
  }, [readOnly, placeholder]);

  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    const handleInput = () => emitChange(field.value);
    // Clicking into a field selects its node, so Escape can hand control back to node shortcuts (Ctrl+D, Ctrl+C...).
    const node = () => field.closest<HTMLElement>('.react-flow__node');
    const handleFocus = () => {
      const id = node()?.dataset.id;
      if (id) useCanvasStore.getState().setSelection((n) => n.id === id);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && field.mode !== 'latex') {
        event.preventDefault();
        event.stopPropagation();
        node()?.focus();
        return;
      }
      if (multiline && event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        field.executeCommand(['insert', '\\\\']);
      }
    };
    field.addEventListener('input', handleInput);
    field.addEventListener('focus', handleFocus);
    field.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      field.removeEventListener('input', handleInput);
      field.removeEventListener('focus', handleFocus);
      field.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [multiline]);

  // nodrag/nopan/nowheel/nokey stop React Flow from treating interaction with the field as canvas input.
  return <math-field ref={ref} className={cn('nodrag nopan nowheel nokey', className)} />;
}
