/**
 * Table Node Component (TSX)
 */
import { interaction } from '../state/appState.js';
import { createNodeHeader, createButtonGroup } from '../components/molecules/NodeHeader.js';
import { createNodeContainer } from './nodeUI.js';
import type { NodeData } from '../src/types/index.js';

interface TableData {
    rows: number;
    cols: number;
    cells: string[][];
}

export function createTableNode(data: NodeData, onSelect?: (id: string, addToSelection?: boolean) => void): HTMLElement {
    const div = createNodeContainer(data, {
        className: 'min-w-[200px]',
        flex: true
    });

    // Parse table data or create default
    let tableData: TableData;
    try {
        tableData = data.content ? JSON.parse(data.content) : {
            rows: 3,
            cols: 3,
            cells: Array(3).fill(null).map(() => Array(3).fill(''))
        };
    } catch (e) {
        tableData = {
            rows: 3,
            cols: 3,
            cells: Array(3).fill(null).map(() => Array(3).fill(''))
        };
    }

    const table = document.createElement('table');
    table.className = 'border-collapse w-full';

    const renderTable = () => {
        table.innerHTML = '';

        for (let i = 0; i < tableData.rows; i++) {
            const tr = document.createElement('tr');

            for (let j = 0; j < tableData.cols; j++) {
                const td = document.createElement('td');
                td.className = 'border border-border-base p-0';

                const mf = document.createElement('math-field') as any;
                mf.value = tableData.cells[i]?.[j] || '';
                mf.className = 'w-full px-1.5 py-1 border-none outline-none text-sm bg-transparent min-w-[80px] min-h-[32px] focus:bg-surface-active';
                mf.virtualKeyboardMode = "manual";

                mf.addEventListener('input', () => {
                    if (!tableData.cells[i]) tableData.cells[i] = [];
                    tableData.cells[i][j] = mf.value;
                    data.content = JSON.stringify(tableData);
                });

                mf.addEventListener('focus', () => {
                    interaction.activeInput = mf;
                    if (onSelect) onSelect(data.id);
                });

                // Handle Enter to move to next cell
                mf.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        // Move to next cell or next row
                        const nextCell = td.nextElementSibling;
                        if (nextCell) {
                            (nextCell.querySelector('math-field') as any)?.focus();
                        } else {
                            const nextRow = tr.nextElementSibling;
                            if (nextRow) {
                                (nextRow.querySelector('math-field') as any)?.focus();
                            }
                        }
                    } else if (e.key === 'Tab') {
                        e.preventDefault();
                        const nextCell = e.shiftKey ? td.previousElementSibling : td.nextElementSibling;
                        if (nextCell) {
                            (nextCell.querySelector('math-field') as any)?.focus();
                        }
                    }
                });

                td.appendChild(mf);
                tr.appendChild(td);
            }

            table.appendChild(tr);
        }
    };

    // Create button groups for header controls
    const rowControls = createButtonGroup('Row',
        // Decrement (remove row)
        () => {
            if (tableData.rows > 1) {
                tableData.rows--;
                tableData.cells.pop();
                data.content = JSON.stringify(tableData);
                renderTable();
            }
        },
        // Increment (add row)
        () => {
            tableData.rows++;
            tableData.cells.push(Array(tableData.cols).fill(''));
            data.content = JSON.stringify(tableData);
            renderTable();
        }
    );

    const colControls = createButtonGroup('Col',
        // Decrement (remove col)
        () => {
            if (tableData.cols > 1) {
                tableData.cols--;
                tableData.cells.forEach(row => row.pop());
                data.content = JSON.stringify(tableData);
                renderTable();
            }
        },
        // Increment (add col)
        () => {
            tableData.cols++;
            tableData.cells.forEach(row => row.push(''));
            data.content = JSON.stringify(tableData);
            renderTable();
        }
    );

    // Create header with controls
    const header = createNodeHeader('Table', [rowControls, colControls]);

    // Content wrapper with padding
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'p-3';
    contentWrapper.appendChild(table);

    div.appendChild(header);
    div.appendChild(contentWrapper);

    renderTable();

    return div;
}