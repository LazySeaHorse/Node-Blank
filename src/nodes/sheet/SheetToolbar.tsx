import { useState } from 'react';
import { cn } from '@/lib/cn';

const field =
  'min-w-0 rounded border border-border bg-surface px-2 py-0.5 text-xs text-fg outline-none placeholder:text-muted focus:border-accent';

/**
 * Name box and formula bar for the active cell, sized for the node's header. Edits land on the cell that
 * was active when typing began, even if the grid has moved on by the time the box loses focus.
 */
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
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <span className="w-14 shrink-0 truncate rounded border border-border bg-surface px-1.5 py-0.5 text-center text-xs font-medium text-muted">
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
