import { NodeResizer, useNodeId } from '@xyflow/react';
import type { CSSProperties, ReactNode } from 'react';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';
import type { NodeKind, SectionColor } from '@/model/types';
import { useCanvasStore } from '@/store/canvasStore';
import { useUiStore } from '@/store/uiStore';
import { nodeSpecs } from './catalog';
import { NODE_TAB_HEIGHT } from './spec';

interface NodeShellProps {
  /** Picks the tone, and the label and icon of the tab. */
  kind: NodeKind;
  selected: boolean;
  /** The tab's text until the node has a title of its own; defaults to the kind's label. */
  title?: string;
  /** The node's own title (`data.title`). */
  customTitle?: string;
  /** Fills the top of the tile under the tab, e.g. a formula bar. Stays in read-only mode. */
  toolbar?: ReactNode;
  /** Controls on the tab line, shown while the node is hovered or selected; hidden in read-only mode. */
  actions?: ReactNode;
  resize?: {
    minWidth: number;
    minHeight: number;
    keepAspectRatio?: boolean;
    onResizing?: (resizing: boolean) => void;
  };
  /** Background tint, from the section palette. */
  tint?: SectionColor;
  /** The embedded page or video is taking the mouse, so the node says so. */
  live?: boolean;
  /** Classes for the tile, e.g. its padding and minimum width. */
  className?: string;
  children: ReactNode;
}

/**
 * Common chrome for every node: a tab (kind icon and title, which doubles as the drag handle) fused to a
 * flat tonal tile. Both sit inside the node's box, so selection, resizing and layout see one rectangle.
 */
export function NodeShell({
  kind,
  selected,
  title,
  customTitle,
  toolbar,
  actions,
  resize,
  tint,
  live,
  className,
  children,
}: NodeShellProps) {
  const readOnly = useReadOnly();
  const { icon: Icon, label } = nodeSpecs[kind];
  const tone = tint
    ? `color-mix(in srgb, var(--section-${tint}) 35%, var(--surface))`
    : `var(--tone-${kind})`;
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
          lineClassName="!border-transparent"
          handleClassName="!size-3.5 !rounded-none !border-0 !bg-transparent"
        />
      )}
      <div
        className="node flex h-full w-full flex-col"
        data-live={live || undefined}
        style={{ '--tone-base': tone } as CSSProperties}
      >
        <div className="flex shrink-0 items-end" style={{ height: NODE_TAB_HEIGHT }}>
          <div className="node-tab cursor-grab">
            <Icon className="size-3.5 shrink-0 opacity-70" />
            <NodeTitle fallback={title ?? label} value={customTitle} />
            {live && <span className="shrink-0 text-2xs font-normal opacity-80">· Live</span>}
          </div>
          {!readOnly && actions && (
            <div className="node-actions nodrag ml-auto flex items-center gap-1 self-center">{actions}</div>
          )}
        </div>
        <div className={cn('node-tile flex min-h-0 flex-1 flex-col', className)}>
          {toolbar && (
            <header className="nodrag nokey flex h-9 shrink-0 items-center gap-1 px-2">{toolbar}</header>
          )}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          {/* Far out, the tile shows only its title, large. */}
          <div className="node-poster" aria-hidden="true" data-title={customTitle || title || label} />
        </div>
      </div>
    </>
  );
}

/**
 * A node's title: its own, else `fallback` (the node kind). Double-click renames; so does Rename in the node's menu.
 * An empty name restores the fallback.
 */
function NodeTitle({ fallback, value }: { fallback: string; value?: string }) {
  const id = useNodeId();
  const readOnly = useReadOnly();
  const editing = useUiStore((s) => s.renamingNode === id) && !readOnly;
  if (!id) return null;

  const stopEditing = () => useUiStore.getState().stopRenamingNode(id);
  const commit = (name: string) => {
    useCanvasStore.getState().updateNodeData(id, { title: name.trim() || undefined });
    stopEditing();
  };

  return editing ? (
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
      className="nodrag nokey min-w-0 max-w-56 rounded bg-surface px-1.5 py-0.5 text-xs font-medium text-fg [field-sizing:content] outline-none"
    />
  ) : (
    // biome-ignore lint/a11y/noStaticElementInteractions: double-click to rename mirrors desktop canvas apps.
    <span
      className={cn('min-w-0 truncate', !value && 'opacity-70')}
      onDoubleClick={() => !readOnly && useUiStore.getState().renameNode(id)}
    >
      {value || fallback}
    </span>
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
