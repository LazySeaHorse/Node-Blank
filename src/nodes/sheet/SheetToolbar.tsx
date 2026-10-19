import { PaintBucket } from 'lucide-react';
import { Popover } from 'radix-ui';
import { type FormEvent, type RefObject, useState } from 'react';
import { cn } from '@/lib/cn';
import { GridOpError } from '@/lib/gridOps';
import { SECTION_COLORS, type SectionColor } from '@/model/types';

const swatch = (color: SectionColor) => `var(--section-${color})`;
const field =
  'min-w-0 rounded border border-border bg-surface px-2 py-1 text-xs text-fg outline-none placeholder:text-muted focus:border-accent';

/** Name box and formula bar for the active cell. Edits land on the cell that was active when typing began. */
export function FormulaBar({
  label,
  value,
  readOnly,
  onCommit,
}: {
  label: string;
  value: string;
  readOnly: boolean;
  onCommit: (text: string) => void;
}) {
  const [draft, setDraft] = useState<{ label: string; text: string } | null>(null);
  const shown = draft?.label === label ? draft.text : value;

  const commit = () => {
    if (draft && draft.text !== value) onCommit(draft.text);
    setDraft(null);
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-14 shrink-0 rounded border border-border bg-surface-2 px-2 py-1 text-center text-xs font-medium text-muted">
        {label || '–'}
      </span>
      <span className="shrink-0 text-xs font-semibold text-muted italic">fx</span>
      <input
        aria-label="Formula bar"
        value={shown}
        readOnly={readOnly || !label}
        spellCheck={false}
        onChange={(e) => setDraft({ label, text: e.target.value })}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setDraft(null);
        }}
        className={cn(field, 'flex-1 font-mono')}
      />
    </div>
  );
}

/** Background colour of the selected cells. */
export function FillPicker({ onPick }: { onPick: (color: SectionColor | null) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Cell fill"
          title="Fill colour of the selected cells"
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded border border-border text-muted hover:bg-surface-2 hover:text-fg"
        >
          <PaintBucket className="size-3.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 flex items-center gap-1.5 rounded-xl border border-border bg-surface p-2 shadow-xl"
        >
          <button
            type="button"
            aria-label="No fill"
            onClick={() => onPick(null)}
            className="flex h-6 cursor-pointer items-center rounded-full border border-fg/20 px-2 text-xs text-muted hover:text-fg"
          >
            None
          </button>
          {SECTION_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Fill ${color}`}
              onClick={() => onPick(color)}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-fg/20"
              style={{ backgroundColor: swatch(color) }}
            />
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** `R1 -= 3*R2`-style commands on whole rows and columns. Errors show under the box until you type again. */
export function CommandBar({
  inputRef,
  onRun,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onRun: (command: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const run = (event: FormEvent) => {
    event.preventDefault();
    const input = inputRef.current;
    if (!input?.value.trim()) return;
    try {
      onRun(input.value);
      input.value = '';
      setError(null);
    } catch (e) {
      if (!(e instanceof GridOpError)) throw e;
      setError(e.message);
    }
  };

  return (
    <form onSubmit={run} className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="w-14 shrink-0 text-center text-xs font-medium text-muted">Row op</span>
        <input
          ref={inputRef}
          aria-label="Row or column operation"
          placeholder="R1 -= 3*R2   ·   C2 /= 2   ·   R1 <-> R3"
          title="R1 -= 3*R2, R2 *= 1/2, R1 = R1 - R3 + 2*R2, C2 += C1/3, R1 <-> R3. Rows are R1, R2…, columns C1, C2… counted from 1."
          spellCheck={false}
          autoComplete="off"
          onChange={() => setError(null)}
          className={cn(field, 'flex-1 font-mono', error && 'border-danger')}
        />
        <button
          type="submit"
          className="shrink-0 cursor-pointer rounded border border-border px-2 py-1 text-xs font-medium text-muted hover:bg-surface-2 hover:text-fg"
        >
          Apply
        </button>
      </div>
      {error && (
        <p role="alert" className="pl-[3.875rem] text-xs text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
