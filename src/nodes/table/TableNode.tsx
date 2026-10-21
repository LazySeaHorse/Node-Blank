import type { NodeProps } from '@xyflow/react';
import { Minus, Plus } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';
import { insertColumn, insertRow, removeColumnAt, removeRowAt, setCell } from '@/lib/grid';
import { MathField } from '@/lib/math/MathField';
import type { NodeOf } from '@/model/types';
import { WithTooltip } from '@/ui/Button';
import { NodeShell } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';

interface Layout {
  /** Table offset inside the wrapper. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** Positions of the horizontal and vertical gridlines, relative to the table. */
  ys: number[];
  xs: number[];
}

/** Measures the gridlines in unscaled layout pixels, so the canvas zoom does not matter. */
function measure(table: HTMLTableElement): Layout {
  const rows = Array.from(table.rows);
  const cols = rows[0] ? Array.from(rows[0].cells) : [];
  return {
    left: table.offsetLeft,
    top: table.offsetTop,
    width: table.offsetWidth,
    height: table.offsetHeight,
    ys: [0, ...rows.map((row) => row.offsetTop + row.offsetHeight)],
    xs: [0, ...cols.map((cell) => cell.offsetLeft + cell.offsetWidth)],
  };
}

function PillButton({
  label,
  disabled,
  onClick,
  onPreview,
  children,
}: {
  label: string;
  disabled?: boolean;
  /** Called with true while the button is hovered or focused, false when that ends. */
  onPreview?: (on: boolean) => void;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <WithTooltip label={label}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        // Keep the caret in the cell: a mousedown on a button would take focus away.
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        onMouseEnter={() => !disabled && onPreview?.(true)}
        onMouseLeave={() => onPreview?.(false)}
        onFocus={() => !disabled && onPreview?.(true)}
        onBlur={() => onPreview?.(false)}
        className="flex size-5 cursor-pointer items-center justify-center rounded-full hover:bg-accent hover:text-white disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
      >
        {children}
      </button>
    </WithTooltip>
  );
}

/**
 * A gridline's hover zone: a thin strip that lights the whole line and shows a "− +" pill on it.
 * "+" inserts at this boundary; "−" removes the row/column just before it (the first one on the outer edge).
 */
function Gridline({
  vertical,
  position,
  length,
  canRemove,
  onInsert,
  onRemove,
  onPreview,
}: {
  vertical: boolean;
  position: number;
  length: number;
  canRemove: boolean;
  onInsert: () => void;
  onRemove: () => void;
  onPreview: (on: boolean) => void;
}) {
  const noun = vertical ? 'column' : 'row';
  return (
    <div
      className={cn(
        'nodrag nopan group/line pointer-events-auto absolute z-10',
        vertical ? 'h-(--len) w-2 -translate-x-1/2' : 'h-2 w-(--len) -translate-y-1/2',
      )}
      style={{ [vertical ? 'left' : 'top']: position, '--len': `${length}px` } as React.CSSProperties}
    >
      <div
        className={cn(
          'pointer-events-none absolute bg-accent opacity-0 group-hover/line:opacity-100',
          vertical ? 'inset-y-0 left-1/2 w-0.5 -translate-x-1/2' : 'inset-x-0 top-1/2 h-0.5 -translate-y-1/2',
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute flex items-center rounded-full border border-border bg-surface text-muted opacity-0 shadow-sm group-hover/line:pointer-events-auto group-hover/line:opacity-100',
          vertical
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        )}
      >
        <PillButton
          label={`Remove ${noun}`}
          disabled={!canRemove}
          onClick={() => {
            onPreview(false);
            onRemove();
          }}
          onPreview={onPreview}
        >
          <Minus className="size-3" />
        </PillButton>
        <PillButton label={`Insert ${noun}`} onClick={onInsert}>
          <Plus className="size-3" />
        </PillButton>
      </div>
    </div>
  );
}

export default function TableNode({ id, data, selected }: NodeProps<NodeOf<'table'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'table'>(id);
  const { cells } = data;
  const edit = (transform: (grid: string[][]) => string[][]) => update({ cells: transform(cells) });
  const tableRef = useRef<HTMLTableElement>(null);
  // The row or column the pointer is about to remove, shown tinted.
  const [doomed, setDoomed] = useState<{ axis: 'row' | 'col'; index: number } | null>(null);
  const preview = (axis: 'row' | 'col', index: number) => (on: boolean) =>
    setDoomed(on ? { axis, index } : null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const rowCount = cells.length;
  const colCount = cells[0]?.length ?? 0;

  // Cells grow with their content, so measure again whenever the table's size changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the grid shape changes the lines.
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table || readOnly) return;
    const run = () => setLayout(measure(table));
    run();
    const observer = new ResizeObserver(run);
    observer.observe(table);
    return () => observer.disconnect();
  }, [readOnly, rowCount, colCount]);

  return (
    <NodeShell kind="table" selected={selected} customTitle={data.title} tint={data.color}>
      <div className="relative w-fit p-4">
        <table ref={tableRef} className="border-collapse">
          <tbody>
            {cells.map((row, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: grid cells are addressed by position.
              <tr key={r}>
                {row.map((value, c) => (
                  <td
                    // biome-ignore lint/suspicious/noArrayIndexKey: grid cells are addressed by position.
                    key={c}
                    className={cn(
                      'min-w-20 border border-border p-0 transition-colors duration-150',
                      (doomed?.axis === 'row' ? doomed.index === r : doomed?.index === c) && 'bg-danger/15',
                    )}
                  >
                    <MathField
                      value={value}
                      onChange={(latex) => edit((grid) => setCell(grid, r, c, latex))}
                      readOnly={readOnly}
                      modeToggle
                      className="min-h-8 px-1.5 py-1 text-base"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!readOnly && layout && (
          <div className="pointer-events-none absolute" style={{ left: layout.left, top: layout.top }}>
            {layout.ys.map((y, b) => (
              <Gridline
                // biome-ignore lint/suspicious/noArrayIndexKey: boundaries are addressed by position.
                key={`r${b}`}
                vertical={false}
                position={y}
                length={layout.width}
                canRemove={rowCount > 1}
                onInsert={() => edit((grid) => insertRow(grid, b))}
                onRemove={() => edit((grid) => removeRowAt(grid, Math.max(0, b - 1)))}
                onPreview={preview('row', Math.max(0, b - 1))}
              />
            ))}
            {layout.xs.map((x, b) => (
              <Gridline
                // biome-ignore lint/suspicious/noArrayIndexKey: boundaries are addressed by position.
                key={`c${b}`}
                vertical
                position={x}
                length={layout.height}
                canRemove={colCount > 1}
                onInsert={() => edit((grid) => insertColumn(grid, b))}
                onRemove={() => edit((grid) => removeColumnAt(grid, Math.max(0, b - 1)))}
                onPreview={preview('col', Math.max(0, b - 1))}
              />
            ))}
          </div>
        )}
      </div>
    </NodeShell>
  );
}
