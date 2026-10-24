import { MathfieldElement } from 'mathlive';
import 'mathlive/fonts.css';
import { Sigma, Type } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useCanvasStore } from '@/store/canvasStore';
import { WithTooltip } from '@/ui/Button';
import { inkBackground, inkColor } from './ink';
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
  /** While focused and empty, shows a button that switches the field between math and text (the `"` key). */
  modeToggle?: boolean;
  className?: string;
}

/**
 * A command with an argument committed from LaTeX mode (`\hat`, `\sqrt`, `\vec`...) arrives with an empty
 * argument and, through a MathLive slip, the whole command selected instead of the caret inside it: the next
 * key replaces it or lands beside it. Gives it a placeholder and puts the caret there, as `\frac` gets.
 */
function fillEmptyArgument(field: MathfieldElement) {
  const [range] = field.selection.ranges;
  if (!range || range[1] !== range[0] + 1) return;
  const latex = field.getValue(range[0], range[1], 'latex');
  if (!/^\\[a-zA-Z]+(\{\})+$/.test(latex) || latex.startsWith('\\placeholder')) return;
  field.insert(latex.replaceAll('{}', '{#?}'), { format: 'latex', selectionMode: 'placeholder' });
}

/** React wrapper around MathLive's `<math-field>` web component. */
export function MathField({
  value,
  onChange,
  readOnly = false,
  multiline = false,
  placeholder,
  modeToggle = false,
  className,
}: MathFieldProps) {
  const ref = useRef<MathfieldElement>(null);
  const [focused, setFocused] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const emitChange = useEffectEvent((latex: string) => onChange?.(flattenDisplaylines(latex)));

  useEffect(() => {
    const field = ref.current;
    // Stored values are flattened (see emitChange), so compare like with like or the caret would jump.
    if (!field || flattenDisplaylines(field.value) === value) return;
    try {
      // The value came from outside (canvas undo, the AI...): the field's own undo must not step back past it.
      // Emptied first, setValue starts the field's history afresh at the new value.
      field.resetUndo();
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
    const colorMap = field.colorMap;
    const backgroundColorMap = field.backgroundColorMap;
    field.colorMap = (name) => inkColor(name) ?? colorMap(name);
    field.backgroundColorMap = (name) => inkBackground(name) ?? backgroundColorMap(name);
  }, []);

  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    const handleInput = () => emitChange(field.value);
    // Clicking into a field selects its node, so Escape can hand control back to node shortcuts (Ctrl+D, Ctrl+C...).
    const node = () => field.closest<HTMLElement>('.react-flow__node');
    let mode = field.mode;
    const handleModeChange = () => {
      // Committing `\hat` typed in LaTeX mode: MathLive runs this inside the commit, so the microtask
      // sees the result before the next key.
      if (mode === 'latex' && field.mode !== 'latex') queueMicrotask(() => fillEmptyArgument(field));
      mode = field.mode;
      syncMode();
    };
    const syncMode = () => setTextMode(field.mode === 'text');
    const handleBlur = () => setFocused(false);
    const handleFocus = () => {
      setFocused(true);
      syncMode();
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
    field.addEventListener('blur', handleBlur);
    field.addEventListener('mode-change', handleModeChange);
    field.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      field.removeEventListener('input', handleInput);
      field.removeEventListener('focus', handleFocus);
      field.removeEventListener('blur', handleBlur);
      field.removeEventListener('mode-change', handleModeChange);
      field.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [multiline]);

  const field = <math-field ref={ref} className={cn('nodrag nopan nowheel nokey', className)} />;
  if (!modeToggle) return field;

  const toggleMode = () => {
    const el = ref.current;
    if (!el) return;
    el.mode = el.mode === 'text' ? 'math' : 'text';
    setTextMode(el.mode === 'text');
    el.focus();
  };
  const showToggle = focused && !readOnly && value === '';
  // nodrag/nopan/nowheel/nokey stop React Flow from treating interaction with the field as canvas input.
  return (
    <div className="relative">
      {field}
      {showToggle && (
        <WithTooltip label={`${textMode ? 'Text' : 'Math'} mode. Press " to switch`}>
          <button
            type="button"
            aria-label={textMode ? 'Switch to math mode' : 'Switch to text mode'}
            // Keep the caret in the field: a mousedown on a button would take focus away.
            onMouseDown={(event) => event.preventDefault()}
            onClick={toggleMode}
            className="nodrag nopan absolute top-1/2 right-1 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-accent/10"
          >
            {textMode ? <Type className="size-3.5" /> : <Sigma className="size-3.5" />}
          </button>
        </WithTooltip>
      )}
    </div>
  );
}
