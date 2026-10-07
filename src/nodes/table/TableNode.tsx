import type { NodeProps } from '@xyflow/react';
import { Table } from 'lucide-react';
import { useReadOnly } from '@/canvas/readOnly';
import { addColumn, addRow, removeColumn, removeRow, setCell } from '@/lib/grid';
import { MathField } from '@/lib/math/MathField';
import type { NodeOf } from '@/model/types';
import { NodeShell, Stepper } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';

export default function TableNode({ id, data, selected }: NodeProps<NodeOf<'table'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'table'>(id);
  const { cells } = data;
  const edit = (transform: (grid: string[][]) => string[][]) => update({ cells: transform(cells) });

  return (
    <NodeShell
      selected={selected}
      title="Table"
      icon={Table}
      actions={
        <>
          <Stepper label="Row" onDecrement={() => edit(removeRow)} onIncrement={() => edit(addRow)} />
          <Stepper label="Col" onDecrement={() => edit(removeColumn)} onIncrement={() => edit(addColumn)} />
        </>
      }
    >
      <table className="m-3 border-collapse">
        <tbody>
          {cells.map((row, r) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: grid cells are addressed by position.
            <tr key={r}>
              {row.map((value, c) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: grid cells are addressed by position.
                <td key={c} className="min-w-20 border border-border p-0">
                  <MathField
                    value={value}
                    onChange={(latex) => edit((grid) => setCell(grid, r, c, latex))}
                    readOnly={readOnly}
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
