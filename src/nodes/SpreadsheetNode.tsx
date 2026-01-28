/**
 * Spreadsheet Node Component (TSX)
 * Uses Preact signals for reactive formula display
 */
import jspreadsheet from 'jspreadsheet-ce';
import 'jsuites';
import { signal } from '@preact/signals';
import { render } from 'preact';
import { createNodeContainer } from '@utils/nodeUI';
import { SpreadsheetHeader } from '@/components/molecules/SpreadsheetHeader';
import type { NodeData } from '@/types';

export function createSpreadsheetNode(data: NodeData, onSelect?: (id: string, addToSelection?: boolean) => void): HTMLElement {
    const div = (createNodeContainer as any)(data, {
        className: 'p-0 node-spreadsheet',
        flex: true
    });

    // Create reactive signal for formula display
    const formulaValue = signal('');

    // Render Preact header component into a container
    const headerContainer = document.createElement('div');
    render(<SpreadsheetHeader formulaValue={formulaValue} />, headerContainer);

    // Content Container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'p-1 bg-surface spreadsheet-content';

    // Append header and content to node
    div.appendChild(headerContainer.firstElementChild as HTMLElement);
    div.appendChild(contentDiv);

    // Initialize Jspreadsheet
    let spreadsheetData: any[][] = [];
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

    let worksheetInstance: any = null;

    const syncData = () => {
        const ws = Array.isArray(worksheetInstance) ? worksheetInstance[0] : worksheetInstance;
        if (ws && typeof ws.getData === 'function') {
            const currentData = ws.getData();
            data.content = JSON.stringify(currentData);
        }
    };

    worksheetInstance = (jspreadsheet as any)(contentDiv, {
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

                // Update the signal - Preact will reactively update the UI
                formulaValue.value = cellValue || '';
            }
        }
    });

    return div;
}