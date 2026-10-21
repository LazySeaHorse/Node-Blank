import { type RefObject, useEffect, useRef } from 'react';
import { isTyping } from '@/canvas/keyboard';
import { MAX_TABLE_COLUMNS, MAX_TABLE_ROWS } from '@/lib/grid';
import { useCanvasStore } from '@/store/canvasStore';
import { blockText, clearBlock, parseBlockText, pasteBlock } from './blocks';
import { selectedBlock, setTableSelection, type TableSelection, useTableSelections } from './selection';

interface Options {
  id: string;
  wrapper: RefObject<HTMLElement | null>;
  cells: string[][];
  readOnly: boolean;
  edit: (transform: (grid: string[][]) => string[][]) => void;
}

/**
 * Block selection for a table: whole rows and columns from the header handles, rectangles by dragging across
 * cells or Shift+click. A plain click still just focuses the cell for editing. While a selection exists the table
 * takes Delete, Escape, copy and paste ahead of the canvas shortcuts.
 */
export function useTableSelection({ id, wrapper, cells, readOnly, edit }: Options) {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  const selection = useTableSelections((s) => s[id]);
  const block = selectedBlock(selection, rows, cols);
  const lastCell = useRef<{ row: number; col: number } | null>(null);
  const latest = useRef({ cells, edit, block, rows, cols });
  latest.current = { cells, edit, block, rows, cols };

  const select = (next: TableSelection | undefined) => setTableSelection(id, next);

  /** Hands focus from the cell being edited to the node, so keys reach the table and no caret blinks. */
  const takeOver = () => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && wrapper.current?.contains(active)) active.blur();
    window.getSelection()?.removeAllRanges();
    wrapper.current?.closest<HTMLElement>('.react-flow__node')?.focus({ preventScroll: true });
    useCanvasStore.getState().setSelection((n) => n.id === id);
  };

  const cellAt = (x: number, y: number) => {
    const td = document.elementFromPoint(x, y)?.closest<HTMLElement>('td[data-r]');
    return td && wrapper.current?.contains(td)
      ? { row: Number(td.dataset.r), col: Number(td.dataset.c) }
      : null;
  };

  const selectRows = (from: number, to = from) => {
    select({ anchor: { row: from, col: 0 }, focus: { row: to, col: latest.current.cols - 1 } });
    takeOver();
  };
  const selectColumns = (from: number, to = from) => {
    select({ anchor: { row: 0, col: from }, focus: { row: latest.current.rows - 1, col: to } });
    takeOver();
  };
  const selectAll = () => {
    select({ anchor: { row: 0, col: 0 }, focus: { row: rows - 1, col: cols - 1 } });
    takeOver();
  };

  /** Props for a cell: Shift+click selects a block, and dragging out of the cell starts one. */
  const cellHandlers = (row: number, col: number) => ({
    onFocusCapture: () => {
      lastCell.current = { row, col };
    },
    onPointerDownCapture: (event: React.PointerEvent) => {
      if (readOnly || event.button !== 0) return;
      if (event.shiftKey) {
        // Not a click into the field: the anchor is the selection's, or the cell last edited.
        event.preventDefault();
        event.stopPropagation();
        select({ anchor: selection?.anchor ?? lastCell.current ?? { row, col }, focus: { row, col } });
        takeOver();
        return;
      }
      if (tableSelectionActive()) select(undefined);
      const start = { row, col };
      let dragging = false;
      const move = (e: PointerEvent) => {
        const over = cellAt(e.clientX, e.clientY);
        if (!over || (over.row === start.row && over.col === start.col && !dragging)) return;
        // Once the pointer leaves the cell it began in, the drag is a block, not a text selection.
        if (!dragging) {
          dragging = true;
          takeOver();
        }
        select({ anchor: start, focus: over });
      };
      const up = () => {
        window.removeEventListener('pointermove', move, true);
        window.removeEventListener('pointerup', up, true);
        window.removeEventListener('pointercancel', up, true);
      };
      window.addEventListener('pointermove', move, true);
      window.addEventListener('pointerup', up, true);
      window.addEventListener('pointercancel', up, true);
    },
  });
  const tableSelectionActive = () => useTableSelections.getState()[id] !== undefined;

  const active = selection !== undefined && !readOnly;
  useEffect(() => {
    if (!active) return;
    const select = (next: TableSelection | undefined) => setTableSelection(id, next);
    const owns = (target: EventTarget | null) => !isTyping(target) && !isTyping(document.activeElement);
    const stop = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (event.button !== 0 || wrapper.current?.contains(target as Node) || target?.closest('[role="menu"]'))
        return;
      select(undefined);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const { block: b, edit: apply } = latest.current;
      if (!b || !owns(event.target)) return;
      if (event.key === 'Escape') {
        stop(event);
        select(undefined);
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        stop(event);
        apply((grid) => clearBlock(grid, b));
      }
    };
    const onCopy = (event: ClipboardEvent) => {
      const { block: b, cells: grid } = latest.current;
      if (!b || !event.clipboardData || !owns(event.target)) return;
      stop(event);
      event.clipboardData.setData('text/plain', blockText(grid, b));
    };
    const onPaste = (event: ClipboardEvent) => {
      const { block: b, cells: grid } = latest.current;
      if (!b || !event.clipboardData || !owns(event.target)) return;
      stop(event);
      const result = pasteBlock(
        grid,
        { row: b.r0, col: b.c0 },
        parseBlockText(event.clipboardData.getData('text/plain')),
        MAX_TABLE_ROWS,
        MAX_TABLE_COLUMNS,
      );
      if (!result) return;
      latest.current.edit(() => result.cells);
      select({
        anchor: { row: result.block.r0, col: result.block.c0 },
        focus: { row: result.block.r1, col: result.block.c1 },
      });
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('copy', onCopy, true);
    window.addEventListener('paste', onPaste, true);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('copy', onCopy, true);
      window.removeEventListener('paste', onPaste, true);
    };
  }, [active, wrapper, id]);

  // A table that goes away (or turns read-only) leaves nothing selected behind.
  useEffect(() => () => setTableSelection(id, undefined), [id]);
  useEffect(() => {
    if (readOnly) setTableSelection(id, undefined);
  }, [readOnly, id]);

  return { block, selectRows, selectColumns, selectAll, cellHandlers };
}
