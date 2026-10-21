import type { NodeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { useReadOnly } from '@/canvas/readOnly';
import { addColumn, addRow, insertColumn, insertRow, removeColumn, removeRow, setCell } from '@/lib/grid';
import { MathField } from '@/lib/math/MathField';
import type { NodeOf } from '@/model/types';
import { WithTooltip } from '@/ui/Button';
import { NodeShell, Stepper } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';

/** A small "+" on a gridline end; shown while the table is hovered. Does not take focus or start a drag. */
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
        className={`nodrag nopan pointer-events-none absolute z-10 flex size-4 cursor-pointer items-center justify-center rounded-full bg-accent text-white opacity-0 group-hover/table:pointer-events-auto group-hover/table:opacity-100 ${className}`}
      >
        <Plus className="size-3" />
      </button>
    </WithTooltip>
  );
}

export default function TableNode({ id, data, selected }: NodeProps<NodeOf<'table'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'table'>(id);
  const { cells } = data;
  const edit = (transform: (grid: string[][]) => string[][]) => update({ cells: transform(cells) });

  return (
    <NodeShell
      kind="table"
      selected={selected}
      customTitle={data.title}
      tint={data.color}
      actions={
        <>
          <Stepper label="Row" onDecrement={() => edit(removeRow)} onIncrement={() => edit(addRow)} />
          <Stepper label="Col" onDecrement={() => edit(removeColumn)} onIncrement={() => edit(addColumn)} />
        </>
      }
    >
      <table className="group/table m-3 border-collapse">
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
    </NodeShell>
  );
}
