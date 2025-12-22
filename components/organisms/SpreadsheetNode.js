/**
 * Spreadsheet Node Organism
 * Uses Jspreadsheet CE (v5)
 */
import { interaction } from '../../state/appState.js';

export function createSpreadsheetNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    // .node-spreadsheet defined in css
    // We add common node classes for selection/dragging
    div.className = 'node absolute rounded-lg transition-shadow duration-150 bg-surface text-text-primary shadow-md border border-transparent [&.selected]:shadow-focus [&.selected]:shadow-lg [&.selected]:z-[1000] [&.selected]:border-accent [&.dragging]:cursor-grabbing [&.dragging]:opacity-90 p-0 cursor-grab node-spreadsheet overflow-hidden';

    // Position
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex;

    // Header (Simple strip like other nodes)
    const header = document.createElement('div');
    header.className = 'p-2 px-3 bg-surface-hover border-b border-border-base flex justify-between items-center cursor-grab select-none';

    const title = document.createElement('span');
    title.textContent = 'Spreadsheet';
    title.className = 'text-xs font-semibold text-text-secondary uppercase tracking-wider';

    header.appendChild(title);

    // Content Container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'p-1 bg-surface spreadsheet-content';

    div.appendChild(header);
    div.appendChild(contentDiv);

    // Initialize Jspreadsheet
    // We need to wait for the customized styling or ensure it loads.
    // Data parsing
    let spreadsheetData = [];
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

    let worksheetInstance = null;

    const syncData = () => {
        const ws = Array.isArray(worksheetInstance) ? worksheetInstance[0] : worksheetInstance;
        if (ws && typeof ws.getData === 'function') {
            const currentData = ws.getData();
            data.content = JSON.stringify(currentData);
        }
    };

    if (window.jspreadsheet) {
        worksheetInstance = window.jspreadsheet(contentDiv, {
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
            onmovecolumn: syncData
        });
    } else {
        contentDiv.textContent = "Error: Jspreadsheet library not loaded.";
    }

    return div;
}
