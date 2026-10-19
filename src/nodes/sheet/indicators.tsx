import type { ColumnIndicatorProps, RowIndicatorProps } from 'react-spreadsheet';
import { cn } from '@/lib/cn';
import { columnLabel } from '@/lib/gridOps';

const header = (selected: boolean) => cn('Spreadsheet__header', selected && 'Spreadsheet__header--selected');

/**
 * Row and column headers as the grid draws them, tagged with the name the command box uses (R3, C2) so the
 * canvas can offer row operations on right-click. Rows and columns are counted from 1 in commands.
 */
export function RowIndicator({ row, label, selected, onSelect }: RowIndicatorProps) {
  return (
    <th
      className={header(selected)}
      data-sheet-line={`R${row + 1}`}
      onClick={(event) => onSelect(row, event.shiftKey)}
      tabIndex={0}
    >
      {label ?? row + 1}
    </th>
  );
}

export function ColumnIndicator({ column, label, selected, onSelect }: ColumnIndicatorProps) {
  return (
    <th
      className={header(selected)}
      data-sheet-line={`C${column + 1}`}
      title={`Column ${columnLabel(column)} is C${column + 1} in commands`}
      onClick={(event) => onSelect(column, event.shiftKey)}
      tabIndex={0}
    >
      {label ?? columnLabel(column)}
    </th>
  );
}
