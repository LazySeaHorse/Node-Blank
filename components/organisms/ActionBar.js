/**
 * Action Bar Organism
 */
import { createActionButton } from '../molecules/ActionButton.js';

export function createActionBar({ onUndo, onExport, onImport, onSave, iconOnly = false }) {
    const container = document.createElement('div');
    container.className = 'flex gap-1';

    // Undo button
    const undoBtn = createActionButton({
        iconName: 'undo',
        label: 'Undo',
        onClick: onUndo,
        iconOnly
    });

    // Export button with choice dialog
    const exportBtn = createActionButton({
        iconName: 'upload',
        label: 'Export',
        onClick: (e) => showExportDialog(onExport, e.currentTarget),
        iconOnly
    });

    // Import button (with file input and choice dialog)
    const importBtn = createActionButton({
        iconName: 'download',
        label: 'Import',
        onClick: async (e) => {
            const choice = await showImportDialog(e.currentTarget);
            if (choice) {
                importInput.dataset.importType = choice;
                importInput.click();
            }
        },
        iconOnly
    });

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = '.json';
    importInput.className = 'hidden';
    importInput.style.display = 'none';
    importInput.addEventListener('change', (e) => onImport(e.target));

    importBtn.appendChild(importInput);

    // Save button
    const saveBtn = createActionButton({
        iconName: 'save',
        label: 'Save',
        onClick: onSave,
        iconOnly
    });

    container.appendChild(undoBtn);
    container.appendChild(exportBtn);
    container.appendChild(importBtn);
    container.appendChild(saveBtn);

    return container;
}

/**
 * Ensure dropdown styles - managed via action-bar.css now
 */
function ensureDropdownStyles() {
    // No-op as styles are loaded via CSS
}

/**
 * Show export choice dropdown
 */
/**
 * Show export choice dropdown
 */
function showExportDialog(onExport, buttonElement) {
    ensureDropdownStyles();
    return new Promise((resolve) => {
        const dropdown = document.createElement('div');
        // .export-import-dropdown { bg: var(--bg-surface); border: 1px solid var(--border-base); radius: lg; shadow: lg; padding: 0.5rem; }
        dropdown.className = 'fixed bg-surface border border-border-base rounded-lg shadow-lg z-[10000] min-w-[180px] p-2 animate-[fadeIn_0.1s_ease-out]';

        // Position below the button
        // Position logic
        const rect = buttonElement.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 8}px`;

        const isRightSide = rect.left > window.innerWidth / 2;
        if (isRightSide) {
            dropdown.style.right = `${window.innerWidth - rect.right}px`;
            dropdown.style.left = 'auto';
            dropdown.style.transformOrigin = 'top right';
        } else {
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.transformOrigin = 'top left';
        }

        const overlay = document.createElement('div');
        // .export-import-overlay { fixed inset 0 z 9999 }
        overlay.className = 'fixed inset-0 z-[9999]';

        // Item classes
        // .dropdown-item { w-full padding: 0.5 0.75; bg: transparent; border: none; radius: md; text-align: left; text-sm; color: text-primary; cursor: pointer; transition; }
        // hover: bg-surface-hover
        const itemClass = 'block w-full px-3 py-2 bg-transparent border-none rounded-md text-left text-sm text-text-primary cursor-pointer transition-colors hover:bg-surface-hover';

        dropdown.innerHTML = `
            <button class="${itemClass}" id="export-nodes">Selected Nodes</button>
            <button class="${itemClass}" id="export-single">Current Canvas</button>
            <button class="${itemClass}" id="export-all">All Canvases</button>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dropdown);

        const cleanup = () => {
            document.body.removeChild(dropdown);
            document.body.removeChild(overlay);
        };

        dropdown.querySelector('#export-nodes').onclick = () => {
            cleanup();
            onExport('nodes');
            resolve();
        };

        dropdown.querySelector('#export-single').onclick = () => {
            cleanup();
            onExport('single');
            resolve();
        };

        dropdown.querySelector('#export-all').onclick = () => {
            cleanup();
            onExport('all');
            resolve();
        };

        overlay.onclick = () => {
            cleanup();
            resolve();
        };
    });
}

/**
 * Show import choice dropdown
 */
function showImportDialog(buttonElement) {
    ensureDropdownStyles();
    return new Promise((resolve) => {
        const dropdown = document.createElement('div');
        // Reuse same class as export
        dropdown.className = 'fixed bg-surface border border-border-base rounded-lg shadow-lg z-[10000] min-w-[180px] p-2 animate-[fadeIn_0.1s_ease-out]';

        // Position below the button
        // Position logic
        const rect = buttonElement.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 8}px`;

        const isRightSide = rect.left > window.innerWidth / 2;
        if (isRightSide) {
            dropdown.style.right = `${window.innerWidth - rect.right}px`;
            dropdown.style.left = 'auto';
            dropdown.style.transformOrigin = 'top right';
        } else {
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.transformOrigin = 'top left';
        }

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[9999]';

        const itemClass = 'block w-full px-3 py-2 bg-transparent border-none rounded-md text-left text-sm text-text-primary cursor-pointer transition-colors hover:bg-surface-hover';

        dropdown.innerHTML = `
            <button class="${itemClass}" id="import-nodes">Append Nodes</button>
            <button class="${itemClass}" id="import-single">Single Canvas</button>
            <button class="${itemClass}" id="import-all">All Canvases</button>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dropdown);

        const cleanup = () => {
            document.body.removeChild(dropdown);
            document.body.removeChild(overlay);
        };

        dropdown.querySelector('#import-nodes').onclick = () => {
            cleanup();
            resolve('nodes');
        };

        dropdown.querySelector('#import-single').onclick = () => {
            cleanup();
            resolve('single');
        };

        dropdown.querySelector('#import-all').onclick = () => {
            cleanup();
            resolve('all');
        };

        overlay.onclick = () => {
            cleanup();
            resolve(null);
        };
    });
}
