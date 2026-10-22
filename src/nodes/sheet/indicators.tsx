import type { ColumnIndicatorProps, CornerIndicatorProps, RowIndicatorProps } from 'react-spreadsheet';
import { cn } from '@/lib/cn';
import { columnLabel } from '@/lib/gridOps';

const header = (selected: boolean) => cn('Spreadsheet__header', selected && 'Spreadsheet__header--selected');

/**
 * Row and column headers as the grid draws them, except that a right-click selects the row or column first
 * (unless it is already selected), so the menu that follows is about it.
 */
export function RowIndicator({ row, label, selected, onSelect }: RowIndicatorProps) {
  return (
    <th
      className={header(selected)}
      onPointerDown={(event) => event.button === 2 && !selected && onSelect(row, false)}
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
      title={`Column ${columnLabel(column)} is C${column + 1} in operations`}
      onPointerDown={(event) => event.button === 2 && !selected && onSelect(column, false)}
      onClick={(event) => onSelect(column, event.shiftKey)}
      tabIndex={0}
    >
      {label ?? columnLabel(column)}
    </th>
  );
}

/** The select-all corner, except that a right-click selects the whole sheet first, so its menu is about all of it. */
export function CornerIndicator({ selected, onSelect }: CornerIndicatorProps) {
  return (
    <th
      className={header(selected)}
      title="Select all"
      onPointerDown={(event) => event.button === 2 && !selected && onSelect()}
      onClick={onSelect}
      tabIndex={0}
    />
  );
}
