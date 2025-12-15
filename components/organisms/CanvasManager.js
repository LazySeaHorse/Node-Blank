/**
 * Canvas Manager Organism
 * UI for managing multiple canvases
 */
import { getAllCanvases, deleteCanvas, renameCanvas } from '../../utils/indexedDB.js';

export function createCanvasManager(callbacks) {
    const { onLoad, onClose, onCreate } = callbacks;

    // Create overlay backdrop
    const overlay = document.createElement('div');
    overlay.className = 'canvas-manager-overlay fixed inset-0 flex items-center justify-center z-[10000]';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'canvas-manager-modal rounded-xl w-[90%] max-w-[600px] max-h-[80vh] flex flex-col shadow-2xl';

    // Create header
    const header = document.createElement('div');
    header.className = 'canvas-manager-header p-6 flex justify-between items-center';

    const title = document.createElement('h2');
    title.textContent = 'My Canvases';
    title.className = 'canvas-manager-title m-0 text-2xl font-semibold';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'canvas-manager-close bg-none border-none text-3xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-colors';

    closeBtn.onclick = onClose;

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create new canvas button
    const newCanvasBtn = document.createElement('button');
    newCanvasBtn.textContent = '+ New Canvas';
    newCanvasBtn.className = 'new-canvas-btn mx-6 my-4 px-6 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-colors';

    newCanvasBtn.onclick = async () => {
        const name = prompt('Canvas name:', 'Untitled Canvas');
        if (name) {
            await onCreate(name);
            onClose();
        }
    };

    // Create canvas list container
    const listContainer = document.createElement('div');
    listContainer.className = 'canvas-list flex-1 overflow-y-auto px-6 pb-6';

    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(newCanvasBtn);
    modal.appendChild(listContainer);
    overlay.appendChild(modal);

    // Prevent clicks on modal from closing
    modal.onclick = (e) => e.stopPropagation();

    // Close on overlay click
    overlay.onclick = onClose;

    // Render canvas list
    async function renderList() {
        const canvases = await getAllCanvases();

        // Sort by last modified (newest first)
        canvases.sort((a, b) => b.lastModified - a.lastModified);

        listContainer.innerHTML = '';

        if (canvases.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'text-center py-12 px-6 text-slate-400';
            empty.textContent = 'No canvases yet. Create one to get started.';
            listContainer.appendChild(empty);
            return;
        }

        canvases.forEach(canvas => {
            const item = createCanvasItem(canvas);
            listContainer.appendChild(item);
        });
    }

    function createCanvasItem(canvas) {
        const item = document.createElement('div');
        item.className = 'canvas-item rounded-lg p-4 mb-3 border transition-colors';

        const topRow = document.createElement('div');
        topRow.className = 'flex justify-between items-center mb-2';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = canvas.name;
        nameSpan.className = 'canvas-item-name text-base font-medium';

        const dateSpan = document.createElement('span');
        dateSpan.textContent = formatDate(canvas.lastModified);
        dateSpan.className = 'canvas-item-date text-sm';

        topRow.appendChild(nameSpan);
        topRow.appendChild(dateSpan);

        const actions = document.createElement('div');
        actions.className = 'flex gap-2';

        const loadBtn = createActionButton('Load', 'btn-action-load', async () => {
            await onLoad(canvas.id);
            onClose();
        });

        const renameBtn = createActionButton('Rename', 'btn-action-rename', async () => {
            const newName = prompt('New name:', canvas.name);
            if (newName && newName !== canvas.name) {
                await renameCanvas(canvas.id, newName);
                await renderList();
            }
        });

        const deleteBtn = createActionButton('Delete', 'btn-action-delete', async () => {
            if (confirm(`Delete "${canvas.name}"? This cannot be undone.`)) {
                await deleteCanvas(canvas.id);
                await renderList();
            }
        });

        actions.appendChild(loadBtn);
        actions.appendChild(renameBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(topRow);
        item.appendChild(actions);

        return item;
    }

    function createActionButton(text, className, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = `canvas-action-btn ${className}`;

        btn.onclick = onClick;
        return btn;
    }

    function formatDate(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;

        return new Date(timestamp).toLocaleDateString();
    }

    // Initialize
    renderList();

    return overlay;
}
