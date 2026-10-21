import { create } from 'zustand';
import { type Block, blockBetween, type Cell, clampBlock } from './blocks';

export interface TableSelection {
  anchor: Cell;
  focus: Cell;
}

/**
 * What each table has selected. Local UI state: never saved, never in undo history. Kept in a store so the
 * right-click menu, built far from the table's component, can reach it.
 */
export const useTableSelections = create<Record<string, TableSelection | undefined>>(() => ({}));

export const setTableSelection = (id: string, selection: TableSelection | undefined) =>
  useTableSelections.setState({ [id]: selection });

export const tableSelection = (id: string) => useTableSelections.getState()[id];

/** The selected block, kept inside a grid that may have shrunk since. */
export const selectedBlock = (
  selection: TableSelection | undefined,
  rows: number,
  cols: number,
): Block | null =>
  selection ? clampBlock(blockBetween(selection.anchor, selection.focus), rows, cols) : null;
