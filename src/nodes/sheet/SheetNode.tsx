import type { NodeProps } from '@xyflow/react';
import isEqual from 'fast-deep-equal';
import { Sheet } from 'lucide-react';
import { useMemo } from 'react';
import Spreadsheet, { type CellBase, type Matrix } from 'react-spreadsheet';
import { useReadOnly } from '@/canvas/readOnly';
import { addColumn, addRow, removeColumn, removeRow } from '@/lib/grid';
import type { NodeOf } from '@/model/types';
import { NodeShell, Stepper } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';

type Cell = CellBase<string>;

export default function SheetNode({ id, data, selected }: NodeProps<NodeOf<'sheet'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'sheet'>(id);
  const { cells } = data;

  const matrix = useMemo<Matrix<Cell>>(
    () => cells.map((row) => row.map((value) => ({ value, readOnly }))),
    [cells, readOnly],
  );

  const handleChange = (next: Matrix<Cell>) => {
    const nextCells = next.map((row) => row.map((cell) => String(cell?.value ?? '')));
    // The grid reports changes for prop updates too; ignore those to avoid update loops.
    if (!isEqual(nextCells, cells)) update({ cells: nextCells });
  };

  const edit = (transform: (grid: string[][]) => string[][]) => update({ cells: transform(cells) });

  return (
    <NodeShell
      selected={selected}
      title="Sheet"
      icon={Sheet}
      actions={
        <>
          <Stepper label="Row" onDecrement={() => edit(removeRow)} onIncrement={() => edit(addRow)} />
          <Stepper label="Col" onDecrement={() => edit(removeColumn)} onIncrement={() => edit(addColumn)} />
        </>
      }
    >
      {/* nokey: keep Delete/Backspace inside the grid instead of deleting the node. */}
      <div className="nodrag nowheel nokey p-2 text-sm">
        <Spreadsheet data={matrix} onChange={handleChange} />
      </div>
    </NodeShell>
  );
}
