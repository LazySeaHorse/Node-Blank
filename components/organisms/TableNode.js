/**
 * Table Node Organism
 */
import { interaction } from '../../state/appState.js';

export function createTableNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    // Base Node
    // .node-table { background: var(--bg-surface); padding: 12px; min-width: 200px; color: var(--text-primary); ... }
    div.className = 'node absolute rounded-lg transition-shadow duration-150 bg-surface text-text-primary shadow-md border border-transparent [&.selected]:shadow-focus [&.selected]:shadow-lg [&.selected]:z-[1000] [&.selected]:border-accent [&.dragging]:cursor-grabbing [&.dragging]:opacity-90 p-3 min-w-[200px] cursor-grab';
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex;

    // Parse table data or create default
    let tableData;
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
    // .table-content { border-collapse: collapse; width: 100%; }
    table.className = 'border-collapse w-full';

    const renderTable = () => {
        table.innerHTML = '';

        for (let i = 0; i < tableData.rows; i++) {
            const tr = document.createElement('tr');

            for (let j = 0; j < tableData.cols; j++) {
                const td = document.createElement('td');
                // .table-content td { border: 1px solid var(--border-base); padding: 0; }
                td.className = 'border border-border-base p-0';

                const mf = document.createElement('math-field');
                mf.value = tableData.cells[i]?.[j] || '';
                // .table-cell-mathfield { width: 100%; padding: 4px 6px; border: none; outline: none; font-size: 0.875rem; bg: transparent; color: inherit; min-width: 80px; min-height: 32px; }
                // focus: bg-surface-active
                mf.className = 'w-full px-1.5 py-1 border-none outline-none text-sm bg-transparent min-w-[80px] min-h-[32px] focus:bg-surface-active';
                mf.virtualKeyboardMode = "manual";

                mf.addEventListener('input', () => {
                    if (!tableData.cells[i]) tableData.cells[i] = [];
                    tableData.cells[i][j] = mf.value;
                    data.content = JSON.stringify(tableData);
                });

                mf.addEventListener('focus', () => {
                    interaction.activeInput = mf;
                    onSelect(data.id);
                });

                // Handle Enter to move to next cell
                mf.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        // Move to next cell or next row
                        const nextCell = td.nextElementSibling;
                        if (nextCell) {
                            nextCell.querySelector('math-field')?.focus();
                        } else {
                            const nextRow = tr.nextElementSibling;
                            if (nextRow) {
                                nextRow.querySelector('math-field')?.focus();
                            }
                        }
                    } else if (e.key === 'Tab') {
                        e.preventDefault();
                        const nextCell = e.shiftKey ? td.previousElementSibling : td.nextElementSibling;
                        if (nextCell) {
                            nextCell.querySelector('math-field')?.focus();
                        }
                    }
                });

                td.appendChild(mf);
                tr.appendChild(td);
            }

            table.appendChild(tr);
        }
    };

    // Control buttons
    const controls = document.createElement('div');
    // .table-controls { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
    controls.className = 'flex gap-1 mb-2 flex-wrap';

    const addRowBtn = createControlButton('+Row', () => {
        tableData.rows++;
        tableData.cells.push(Array(tableData.cols).fill(''));
        data.content = JSON.stringify(tableData);
        renderTable();
    });

    const addColBtn = createControlButton('+Col', () => {
        tableData.cols++;
        tableData.cells.forEach(row => row.push(''));
        data.content = JSON.stringify(tableData);
        renderTable();
    });

    const removeRowBtn = createControlButton('-Row', () => {
        if (tableData.rows > 1) {
            tableData.rows--;
            tableData.cells.pop();
            data.content = JSON.stringify(tableData);
            renderTable();
        }
    });

    const removeColBtn = createControlButton('-Col', () => {
        if (tableData.cols > 1) {
            tableData.cols--;
            tableData.cells.forEach(row => row.pop());
            data.content = JSON.stringify(tableData);
            renderTable();
        }
    });

    controls.appendChild(addRowBtn);
    controls.appendChild(removeRowBtn);
    controls.appendChild(addColBtn);
    controls.appendChild(removeColBtn);

    div.appendChild(controls);
    div.appendChild(table);

    renderTable();

    return div;
}

function createControlButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    // .table-control-btn { padding: 4px 8px; font-size: 0.75rem; bg: var(--color-accent); color: var(--color-accent-fg); border: none; radius: 4px; cursor: pointer; transition: background 0.2s; }
    // hover: color-mix... (darker accent)
    // Using text-white explicitly as requested.
    btn.className = 'px-2 py-1 text-xs bg-accent text-white border-none rounded cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent),black_10%)]';
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });
    return btn;
}
