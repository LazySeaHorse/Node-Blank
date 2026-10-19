import { NodeResizer, useNodeId } from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';
import type { SectionColor } from '@/model/types';
import { useCanvasStore } from '@/store/canvasStore';
import { useUiStore } from '@/store/uiStore';

interface NodeShellProps {
  selected: boolean;
  /** When set, renders a header bar that doubles as a drag handle, showing this until the node has a title. */
  title?: string;
  /** The node's own title (`data.title`). Without a header it appears as a slim strip above the content. */
  customTitle?: string;
  icon?: LucideIcon;
  /** Fills the header between the title and the actions, e.g. a formula bar. Stays in read-only mode. */
  toolbar?: ReactNode;
  /** Header controls; hidden in read-only mode. */
  actions?: ReactNode;
  resize?: {
    minWidth: number;
    minHeight: number;
    keepAspectRatio?: boolean;
    onResizing?: (resizing: boolean) => void;
  };
  /** Background tint, from the section palette. */
  tint?: SectionColor;
  className?: string;
  children: ReactNode;
}

/** Common card chrome for every node: border, selection ring, optional header and resize handles. */
export function NodeShell({
  selected,
  title,
  customTitle,
  icon: Icon,
  toolbar,
  actions,
  resize,
  tint,
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
        style={tint && { backgroundColor: `color-mix(in srgb, var(--section-${tint}) 35%, var(--surface))` }}
      >
        {title && (
          <header className="flex h-9 shrink-0 cursor-grab items-center gap-2 border-b border-border bg-surface-2 px-3 text-xs font-semibold tracking-wide text-muted uppercase">
            {Icon && <Icon className="size-3.5" />}
            <NodeTitle fallback={title} value={customTitle} />
            {toolbar && (
              <div className="nodrag nokey ml-1 flex min-w-0 flex-1 items-center font-normal tracking-normal normal-case">
                {toolbar}
              </div>
            )}
            {!readOnly && actions && (
              <div className="nodrag ml-auto flex items-center gap-1 normal-case">{actions}</div>
            )}
          </header>
        )}
        {!title && <NodeTitle value={customTitle} strip />}
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </>
  );
}

/**
 * A node's title: its own, else `fallback` (the node kind). Double-click renames; so does Rename in the node's menu.
 * An empty name restores the fallback. As a `strip` (nodes without a header) it shows only once a title is set.
 */
function NodeTitle({ fallback, value, strip }: { fallback?: string; value?: string; strip?: boolean }) {
  const id = useNodeId();
  const readOnly = useReadOnly();
  const editing = useUiStore((s) => s.renamingNode === id) && !readOnly;
  if (!id || (strip && !value && !editing)) return null;

  const stopEditing = () => useUiStore.getState().stopRenamingNode(id);
  const commit = (name: string) => {
    useCanvasStore.getState().updateNodeData(id, { title: name.trim() || undefined });
    stopEditing();
  };

  const text = editing ? (
    <input
      // biome-ignore lint/a11y/noAutofocus: entering edit mode is an explicit user action.
      autoFocus
      defaultValue={value ?? ''}
      placeholder={fallback}
      maxLength={200}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={(e) => commit(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') stopEditing();
      }}
      className="nodrag nokey min-w-0 flex-1 rounded bg-surface px-1.5 py-0.5 text-xs font-semibold tracking-wide normal-case outline-none"
    />
  ) : (
    // biome-ignore lint/a11y/noStaticElementInteractions: double-click to rename mirrors desktop canvas apps.
    <span
      className="min-w-0 truncate"
      onDoubleClick={() => !readOnly && useUiStore.getState().renameNode(id)}
    >
      {value || fallback}
    </span>
  );
  return strip ? (
    <div className="flex shrink-0 items-center px-3 pt-2 text-xs font-semibold tracking-wide text-muted">
      {text}
    </div>
  ) : (
    text
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
