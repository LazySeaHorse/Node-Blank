/**
 * Table Node Organism
 */
import { interaction } from '../../state/appState.js';

export function createTableNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    div.className = 'node node-table';
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
    table.className = 'table-content';
    
    const renderTable = () => {
        table.innerHTML = '';
        
        for (let i = 0; i < tableData.rows; i++) {
            const tr = document.createElement('tr');
            
            for (let j = 0; j < tableData.cols; j++) {
                const td = document.createElement('td');
                const mf = document.createElement('math-field');
                mf.value = tableData.cells[i]?.[j] || '';
                mf.className = 'table-cell-mathfield';
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
                
                mf.addEventListener('mousedown', e => e.stopPropagation());
                
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
    controls.className = 'table-controls';
    
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
    btn.className = 'table-control-btn';
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });
    btn.addEventListener('mousedown', e => e.stopPropagation());
    return btn;
}
