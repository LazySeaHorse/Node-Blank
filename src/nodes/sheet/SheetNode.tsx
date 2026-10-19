import type { NodeProps } from '@xyflow/react';
import isEqual from 'fast-deep-equal';
import { Sheet } from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Spreadsheet, {
  type CellBase,
  DataViewer,
  type DataViewerProps,
  type Matrix,
  type Point,
  type Selection,
} from 'react-spreadsheet';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';
import { addColumn, addRow, removeColumn, removeRow, setCell } from '@/lib/grid';
import { applyGridOp } from '@/lib/gridOps';
import type { NodeOf, SectionColor } from '@/model/types';
import { useUiStore } from '@/store/uiStore';
import { NodeShell, Stepper } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';
import { evaluateExact } from './exactEvaluate';
import { cellKey, pruneFills, rangeLabel, withFill } from './fills';
import { ColumnIndicator, RowIndicator } from './indicators';
import { CommandBar, FillPicker, FormulaBar } from './SheetToolbar';

type Cell = CellBase<string>;

/** In fraction mode: what each formula cell shows, from `evaluateExact`. */
const ExactResults = createContext<(string | undefined)[][] | null>(null);

/** Draws the exact answer of a formula cell, and any other cell as the grid would. */
function FractionViewer(props: DataViewerProps<Cell>) {
  const shown = useContext(ExactResults)?.[props.row]?.[props.column];
  if (shown === undefined) return <DataViewer<Cell, string> {...props} />;
  return <span className="Spreadsheet__data-viewer">{shown}</span>;
}

export default function SheetNode({ id, data, selected }: NodeProps<NodeOf<'sheet'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'sheet'>(id);
  const { cells, fills } = data;
  const fractions = data.fractions ?? false;
  const [active, setActive] = useState<Point>();
  const [selection, setSelection] = useState<Selection>();
  const commandRef = useRef<HTMLInputElement>(null);

  const exact = useMemo(() => (fractions ? evaluateExact(cells) : null), [fractions, cells]);
  const matrix = useMemo<Matrix<Cell>>(
    () =>
      cells.map((row, r) =>
        row.map((value, column) => {
          const fill = fills?.[cellKey({ row: r, column })];
          return { value, readOnly, className: fill && `sheet-fill sheet-fill-${fill}` };
        }),
      ),
    [cells, fills, readOnly],
  );

  // A menu on a row or column header asks for a command to be started here.
  const request = useUiStore((s) => (s.sheetCommand?.id === id ? s.sheetCommand : null));
  useEffect(() => {
    const input = commandRef.current;
    if (!request || !input) return;
    input.value = request.text;
    input.focus();
    input.setSelectionRange(request.text.length, request.text.length);
    useUiStore.getState().clearSheetCommand();
  }, [request]);

  const handleChange = (next: Matrix<Cell>) => {
    const nextCells = next.map((row) => row.map((cell) => String(cell?.value ?? '')));
    // The grid reports changes for prop updates too; ignore those to avoid update loops.
    if (!isEqual(nextCells, cells)) update({ cells: nextCells });
  };

  const shrink = (transform: (grid: string[][]) => string[][]) => {
    const next = transform(cells);
    update({ cells: next, fills: pruneFills(fills, next.length, next[0]?.length ?? 0) });
  };

  const block = selection?.toRange(matrix);
  const targets = block ? [...block] : active ? [active] : [];
  const label = block ? rangeLabel(block.start, block.end) : active ? cellKey(active) : '';
  const setFill = (color: SectionColor | null) => update({ fills: withFill(fills, targets, color) });
  const toggleFractions = () => update({ fractions: fractions ? undefined : true });

  return (
    <NodeShell
      selected={selected}
      title="Sheet"
      customTitle={data.title}
      icon={Sheet}
      actions={
        <>
          <button
            type="button"
            aria-pressed={fractions}
            title="Exact fractions: 1/3 stays 1/3, and row operations write fractions"
            onClick={toggleFractions}
            className={cn(
              'cursor-pointer rounded border px-2 py-0.5 text-xs font-medium',
              fractions
                ? 'border-accent/50 bg-accent/15 text-accent'
                : 'border-border bg-surface text-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            a/b
          </button>
          <Stepper label="Row" onDecrement={() => shrink(removeRow)} onIncrement={() => shrink(addRow)} />
          <Stepper
            label="Col"
            onDecrement={() => shrink(removeColumn)}
            onIncrement={() => shrink(addColumn)}
          />
        </>
      }
    >
      {/* nokey: keep Delete/Backspace inside the grid instead of deleting the node. */}
      <div className="nodrag nowheel nokey flex flex-col gap-1.5 border-b border-border px-2 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="min-w-0 flex-1">
            <FormulaBar
              label={label}
              value={active ? (cells[active.row]?.[active.column] ?? '') : ''}
              readOnly={readOnly}
              onCommit={(text) =>
                active && update({ cells: setCell(cells, active.row, active.column, text) })
              }
            />
          </div>
          {!readOnly && <FillPicker onPick={setFill} />}
        </div>
        {!readOnly && (
          <CommandBar
            inputRef={commandRef}
            onRun={(command) =>
              update({ cells: applyGridOp(cells, command, fractions ? 'fraction' : 'decimal') })
            }
          />
        )}
      </div>
      <div className="nodrag nowheel nokey p-2 text-sm">
        <ExactResults value={exact}>
          <Spreadsheet
            data={matrix}
            onChange={handleChange}
            onActivate={setActive}
            // Leaving the grid (to the formula bar or fill picker) empties its selection; keep the last block.
            onSelect={(next) => next.toRange(matrix) && setSelection(next)}
            RowIndicator={RowIndicator}
            ColumnIndicator={ColumnIndicator}
            DataViewer={fractions ? FractionViewer : undefined}
          />
        </ExactResults>
      </div>
    </NodeShell>
  );
}
