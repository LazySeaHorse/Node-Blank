/**
 * Export/Import Functionality
 */
import { appState } from '../state/appState.ts';
import { exportAllCanvases, importAllCanvases } from './indexedDB.ts';
import { interaction } from '../state/appState.ts';
import type { NodeData, CanvasData } from '../src/types/index.js';

interface ExportData {
    version: number;
    canvasName: string;
    exportedAt: number;
    scale: number;
    pan: { x: number; y: number };
    fields: NodeData[];
    zIndexCounter: number;
}

interface NodesExportData {
    version: number;
    type: 'nodes';
    exportedAt: number;
    nodeCount: number;
    fields: NodeData[];
}

interface ImportResult {
    imported: number;
    skipped: number;
    conflicts: Array<{ id: string; name: string }>;
}

type ConflictStrategy = 'replace' | 'rename' | 'abort';

export function exportJSON(): void {
    const exportData: ExportData = {
        version: 4,
        canvasName: appState.currentCanvasName,
        exportedAt: Date.now(),
        scale: appState.scale,
        pan: appState.pan,
        fields: appState.fields,
        zIndexCounter: appState.zIndexCounter
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appState.currentCanvasName.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportSelectedNodesJSON(selectedIds: string[]): void {
    if (!selectedIds || selectedIds.length === 0) return;

    const selectedFields = appState.fields.filter(f => selectedIds.includes(f.id));

    const exportData: NodesExportData = {
        version: 4,
        type: 'nodes',
        exportedAt: Date.now(),
        nodeCount: selectedFields.length,
        fields: selectedFields
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nodes-${selectedFields.length}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function importJSON(file: File, callback?: (data: ExportData) => void): void {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result !== 'string') return;
            
            const data = JSON.parse(result) as ExportData;

            // Auto-convert v3 to v4
            if (data.version === 3) {
                data.version = 4;
                data.canvasName = data.canvasName || 'Imported Canvas';
                data.exportedAt = Date.now();
            }

            if (data.version !== 4) {
                alert("Unsupported file version");
                return;
            }

            if (callback) callback(data);
        } catch (err) {
            console.error(err);
            alert("Invalid JSON file");
        }
    };
    r.readAsText(file);
}

export function importNodesJSON(file: File, callback?: (nodes: NodeData[]) => void): void {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result !== 'string') return;
            
            const data = JSON.parse(result) as NodesExportData;

            if (data.version !== 4 || data.type !== 'nodes') {
                alert("Invalid nodes export file");
                return;
            }

            if (!data.fields || data.fields.length === 0) {
                alert("No nodes found in file");
                return;
            }

            // Generate new IDs for all imported nodes
            const timestamp = Date.now();
            const importedNodes: NodeData[] = data.fields.map((field, index) => ({
                ...field,
                id: `node-${timestamp}-${Math.random().toString(36).substr(2, 5)}-${index}`,
                zIndex: (appState.zIndexCounter += 1)
            }));

            if (callback) callback(importedNodes);
        } catch (err) {
            console.error(err);
            alert("Invalid JSON file");
        }
    };
    r.readAsText(file);
}

/**
 * Export entire canvas store
 */
export async function exportAllCanvasesJSON(): Promise<void> {
    try {
        const allData = await exportAllCanvases();

        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all-canvases-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Export failed:', err);
        alert('Failed to export canvases');
    }
}

/**
 * Import entire canvas store with conflict handling
 */
export async function importAllCanvasesJSON(file: File, callback?: () => void): Promise<void> {
    if (!file) return;

    const r = new FileReader();
    r.onload = async (e) => {
        try {
            const result = e.target?.result;
            if (typeof result !== 'string') return;
            
            const data = JSON.parse(result);

            if (!data.version || data.version !== 1) {
                alert("Unsupported export format");
                return;
            }

            // Check for conflicts first (dry run)
            const importResult = await importAllCanvases(data, 'abort', true);

            if (importResult.conflicts.length > 0) {
                // Show conflict dialog
                const conflictNames = importResult.conflicts.map(c => c.name).join('\n');
                const message = `Found ${importResult.conflicts.length} conflicting canvas(es):\n\n${conflictNames}\n\nWhat would you like to do?`;

                const choice = await showConflictDialog(message);

                if (choice === 'abort') {
                    alert('Import cancelled');
                    return;
                }

                // Re-import with chosen strategy
                const finalResult = await importAllCanvases(data, choice, false);
                alert(`Import complete!\nImported: ${finalResult.imported} canvas(es)`);
            } else {
                // No conflicts, import directly
                const finalResult = await importAllCanvases(data, 'abort', false);
                alert(`Import complete!\nImported: ${finalResult.imported} canvas(es)`);
            }

            if (callback) callback();

        } catch (err) {
            console.error('Import failed:', err);
            alert("Failed to import canvases");
        }
    };
    r.readAsText(file);
}

/**
 * Show conflict resolution dialog
 */
function showConflictDialog(message: string): Promise<ConflictStrategy> {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
        `;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;

        dialog.innerHTML = `
            <h3 style="margin-top: 0;">Canvas Conflicts Detected</h3>
            <p style="white-space: pre-line; margin: 1rem 0;">${message}</p>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button id="replace-btn" style="padding: 0.5rem 1rem; cursor: pointer;">Replace Existing</button>
                <button id="rename-btn" style="padding: 0.5rem 1rem; cursor: pointer;">Auto-Rename</button>
                <button id="abort-btn" style="padding: 0.5rem 1rem; cursor: pointer;">Cancel</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        const cleanup = () => {
            document.body.removeChild(dialog);
            document.body.removeChild(overlay);
        };

        dialog.querySelector('#replace-btn')!.addEventListener('click', () => {
            cleanup();
            resolve('replace');
        });

        dialog.querySelector('#rename-btn')!.addEventListener('click', () => {
            cleanup();
            resolve('rename');
        });

        dialog.querySelector('#abort-btn')!.addEventListener('click', () => {
            cleanup();
            resolve('abort');
        });
    });
}