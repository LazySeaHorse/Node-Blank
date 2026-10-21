import type { NodeProps } from '@xyflow/react';
import { Minus, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';
import { addColumn, addRow, insertColumn, insertRow, removeColumn, removeRow, setCell } from '@/lib/grid';
import { MathField } from '@/lib/math/MathField';
import type { NodeOf } from '@/model/types';
import { WithTooltip } from '@/ui/Button';
import { NodeShell } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';

const reveal =
  'nodrag nopan pointer-events-none opacity-0 group-hover/table:pointer-events-auto group-hover/table:opacity-100';
const control =
  'flex cursor-pointer items-center justify-center border border-border bg-surface text-muted hover:bg-accent hover:text-white';

/** A small "+" on a gridline end, to insert in the middle. Does not take focus or start a drag. */
function InsertHandle({
  label,
  className,
  onInsert,
}: {
  label: string;
  className: string;
  onInsert: () => void;
}) {
  return (
    <WithTooltip label={label}>
      <button
        type="button"
        aria-label={label}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onInsert}
        className={cn(reveal, control, 'absolute z-10 size-4 rounded-full', className)}
      >
        <Plus className="size-3" />
      </button>
    </WithTooltip>
  );
}

/** The slim "− label +" bar along the bottom (rows) or right (columns) edge: remove or add at the end. */
function EdgeBar({
  label,
  vertical,
  onRemove,
  onAdd,
}: {
  label: 'Row' | 'Col';
  vertical?: boolean;
  onRemove: () => void;
  onAdd: () => void;
}) {
  const button = 'flex flex-1 cursor-pointer items-center justify-center hover:bg-accent hover:text-white';
  const part = (name: string, action: () => void, icon: ReactNode) => (
    <WithTooltip label={name}>
      <button
        type="button"
        aria-label={name}
        onMouseDown={(event) => event.preventDefault()}
        onClick={action}
        className={button}
      >
        {icon}
      </button>
    </WithTooltip>
  );
  return (
    <div
      className={cn(
        reveal,
        'absolute z-10 flex items-stretch overflow-hidden rounded-full border border-border bg-surface text-muted',
        vertical ? 'top-4 right-0 bottom-4 w-4 flex-col' : 'right-4 bottom-0 left-4 h-4',
      )}
    >
      {part(`Remove ${label.toLowerCase()}`, onRemove, <Minus className="size-3" />)}
      {!vertical && <span className="flex items-center text-[10px] leading-none font-medium">{label}</span>}
      {part(`Add ${label.toLowerCase()}`, onAdd, <Plus className="size-3" />)}
    </div>
  );
}

export default function TableNode({ id, data, selected }: NodeProps<NodeOf<'table'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'table'>(id);
  const { cells } = data;
  const edit = (transform: (grid: string[][]) => string[][]) => update({ cells: transform(cells) });

  return (
    <NodeShell kind="table" selected={selected} customTitle={data.title} tint={data.color}>
      <div className="group/table relative w-fit p-4">
        <table className="border-collapse">
          <tbody>
            {cells.map((row, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: grid cells are addressed by position.
              <tr key={r}>
                {row.map((value, c) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: grid cells are addressed by position.
                  <td key={c} className="relative min-w-20 border border-border p-0">
                    {!readOnly && c === 0 && (
                      <InsertHandle
                        label="Insert row"
                        className="top-0 right-full -translate-y-1/2"
                        onInsert={() => edit((grid) => insertRow(grid, r))}
                      />
                    )}
                    {!readOnly && c === 0 && r === cells.length - 1 && (
                      <InsertHandle
                        label="Insert row"
                        className="bottom-0 right-full translate-y-1/2"
                        onInsert={() => edit((grid) => insertRow(grid, r + 1))}
                      />
                    )}
                    {!readOnly && r === 0 && (
                      <InsertHandle
                        label="Insert column"
                        className="bottom-full left-0 -translate-x-1/2"
                        onInsert={() => edit((grid) => insertColumn(grid, c))}
                      />
                    )}
                    {!readOnly && r === 0 && c === row.length - 1 && (
                      <InsertHandle
                        label="Insert column"
                        className="bottom-full right-0 translate-x-1/2"
                        onInsert={() => edit((grid) => insertColumn(grid, c + 1))}
                      />
                    )}
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
        {!readOnly && (
          <>
            <EdgeBar label="Row" onRemove={() => edit(removeRow)} onAdd={() => edit(addRow)} />
            <EdgeBar label="Col" vertical onRemove={() => edit(removeColumn)} onAdd={() => edit(addColumn)} />
          </>
        )}
      </div>
    </NodeShell>
  );
}
