import { type NodeProps, NodeResizer } from '@xyflow/react';
import { Check } from 'lucide-react';
import { Popover } from 'radix-ui';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';
import { type NodeOf, SECTION_COLORS, type SectionColor } from '@/model/types';
import { useUiStore } from '@/store/uiStore';
import { useUpdateNodeData } from '../useNodeData';

const swatch = (color: SectionColor) => `var(--section-${color})`;

/** A titled, tinted box behind other nodes. Only the header grabs it; the body lets clicks through to the canvas. */
export function SectionNode({ id, data, selected }: NodeProps<NodeOf<'section'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'section'>(id);
  const editing = useUiStore((s) => s.renamingSection === id) && !readOnly;
  const stopEditing = () => useUiStore.getState().stopRenaming(id);

  const commit = (title: string) => {
    update({ title: title.trim() || 'Section' });
    stopEditing();
  };

  return (
    <>
      <NodeResizer
        isVisible={selected && !readOnly}
        minWidth={160}
        minHeight={100}
        lineClassName="!border-accent/60"
        handleClassName="!size-2.5 !rounded-sm !border-accent !bg-surface"
      />
      <div
        className={cn(
          'flex h-full w-full flex-col rounded-xl border-2 text-fg',
          selected && 'ring-2 ring-accent/25',
        )}
        style={{
          backgroundColor: `color-mix(in srgb, ${swatch(data.color)} 16%, transparent)`,
          borderColor: selected
            ? 'var(--accent)'
            : `color-mix(in srgb, ${swatch(data.color)} 55%, transparent)`,
        }}
      >
        <header className="section-handle pointer-events-auto flex h-10 shrink-0 cursor-grab items-center gap-2 px-3">
          {editing ? (
            <input
              // biome-ignore lint/a11y/noAutofocus: entering edit mode is an explicit user action.
              autoFocus
              defaultValue={data.title}
              maxLength={200}
              onFocus={(e) => e.currentTarget.select()}
              onBlur={(e) => commit(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') stopEditing();
              }}
              className="nodrag nokey min-w-0 flex-1 rounded bg-surface/70 px-1.5 py-0.5 text-sm font-semibold outline-none"
            />
          ) : (
            // biome-ignore lint/a11y/noStaticElementInteractions: double-click to rename mirrors desktop canvas apps.
            <span
              className="min-w-0 flex-1 truncate text-sm font-semibold"
              onDoubleClick={() => !readOnly && useUiStore.getState().renameSection(id)}
            >
              {data.title}
            </span>
          )}
          {!readOnly && <ColorPicker value={data.color} onChange={(color) => update({ color })} />}
        </header>
      </div>
    </>
  );
}

function ColorPicker({ value, onChange }: { value: SectionColor; onChange: (color: SectionColor) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Section colour"
          className="nodrag size-5 shrink-0 cursor-pointer rounded-full border border-fg/20"
          style={{ backgroundColor: swatch(value) }}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 flex gap-1.5 rounded-xl border border-border bg-surface p-2 shadow-xl"
        >
          {SECTION_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => onChange(color)}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-fg/20"
              style={{ backgroundColor: swatch(color) }}
            >
              {color === value && <Check className="size-3.5 text-slate-900/70" />}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
