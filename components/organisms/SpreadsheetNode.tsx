/**
 * Spreadsheet Node Organism
 * Uses Jspreadsheet CE (v5) for Excel-like functionality
 */
import jspreadsheet from 'jspreadsheet-ce';
import 'jsuites';
import { interaction } from '../../state/appState.js';
import { createNodeHeader } from '../molecules/NodeHeader.js';
import { createNodeContainer } from '../../utils/nodeUI.js';
import type { NodeData, SelectNodeFn } from '../../src/types';

// Type for jSpreadsheet worksheet instance
interface JSpreadsheetWorksheet {
    getData: () => string[][];
    getValueFromCoords: (x: number, y: number) => string;
}

/**
 * Creates a spreadsheet node for the canvas
 * @param data - Node data containing spreadsheet data (JSON array)
 * @param onSelect - Selection callback
 * @returns HTMLElement container with the spreadsheet
 */
export function createSpreadsheetNode(data: NodeData, onSelect: SelectNodeFn): HTMLElement {
    const div = createNodeContainer(data, {
        className: 'p-0 node-spreadsheet',
        flex: true
    });

    // Formula display bar (shows formula/value of selected cell)
    const formulaDisplay = document.createElement('div');
    formulaDisplay.className = 'flex items-center gap-2 bg-surface rounded border border-border-base px-2 py-1 min-w-[200px] max-w-[300px]';

    const formulaLabel = document.createElement('span');
    formulaLabel.className = 'text-xs font-semibold text-text-tertiary';
    formulaLabel.textContent = 'fx';

    const formulaValue = document.createElement('span');
    formulaValue.className = 'text-xs text-text-secondary font-mono truncate flex-1';
    formulaValue.textContent = '';

    formulaDisplay.appendChild(formulaLabel);
    formulaDisplay.appendChild(formulaValue);

    // Header with formula display
    const header = createNodeHeader('Spreadsheet', [formulaDisplay]);

    // Content Container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'p-1 bg-surface spreadsheet-content';

    div.appendChild(header);
    div.appendChild(contentDiv);

    // Data parsing
    let spreadsheetData: string[][] = [];
    try {
        if (data.content && data.content.startsWith('[')) {
            spreadsheetData = JSON.parse(data.content);
        } else {
            // Default 5x5 empty
            spreadsheetData = [
                ['', '', '', '', ''],
                ['', '', '', '', ''],
                ['', '', '', '', ''],
                ['', '', '', '', ''],
                ['', '', '', '', '']
            ];
        }
    } catch (e) {
        spreadsheetData = [
            ['', '', '', '', ''],
            ['', '', '', '', '']
        ];
    }

    let worksheetInstance: JSpreadsheetWorksheet | JSpreadsheetWorksheet[] | null = null;

    /**
     * Sync spreadsheet data back to node data
     */
    const syncData = () => {
        const ws = Array.isArray(worksheetInstance) ? worksheetInstance[0] : worksheetInstance;
        if (ws && typeof ws.getData === 'function') {
            const currentData = ws.getData();
            data.content = JSON.stringify(currentData);
        }
    };

    // Initialize Jspreadsheet
    worksheetInstance = jspreadsheet(contentDiv, {
        worksheets: [{
            data: spreadsheetData,
            minDimensions: [5, 5],
            defaultColWidth: 100,
            parseFormulas: true,
        }],
        tableOverflow: false, // Auto-expand
        tableWidth: "auto",
        tableHeight: "auto",

        // Events - all trigger the same sync logic
        onchange: syncData,
        oninsertrow: syncData,
        ondeleterow: syncData,
        oninsertcolumn: syncData,
        ondeletecolumn: syncData,
        onundo: syncData,
        onredo: syncData,
        onsort: syncData,
        onmoverow: syncData,
        onmovecolumn: syncData,

        // Update formula display when cell is selected
        onselection: (instance: any, x1: number, y1: number, x2: number, y2: number, origin: any) => {
            const ws = Array.isArray(worksheetInstance) ? worksheetInstance[0] : worksheetInstance;
            if (ws && typeof ws.getValueFromCoords === 'function') {
                // Get the value of the first selected cell (top-left of selection)
                const cellValue = ws.getValueFromCoords(x1, y1);

                // Display the cell value (formulas in jspreadsheet start with '=')
                if (cellValue) {
                    formulaValue.textContent = cellValue;
                } else {
                    formulaValue.textContent = '';
                }
            }
        }
    }) as JSpreadsheetWorksheet | JSpreadsheetWorksheet[];

    return div;
}
