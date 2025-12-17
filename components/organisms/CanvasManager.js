/**
 * Canvas Manager Organism
 * UI for managing multiple canvases
 */
import { getAllCanvases, deleteCanvas, renameCanvas } from '../../utils/indexedDB.js';

export function createCanvasManager(callbacks) {
    const { onLoad, onClose, onCreate } = callbacks;

    // Create overlay backdrop
    // .canvas-manager-overlay { background: color-mix(in srgb, var(--bg-canvas), transparent 50%); backdrop-filter: blur(2px); }
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 flex items-center justify-center z-[10000] bg-canvas/50 backdrop-blur-[2px]';

    // Create modal
    // .canvas-manager-modal { background: var(--bg-surface); color: var(--text-primary); shadow: var(--shadow-lg); border: 1px solid var(--border-base); }
    const modal = document.createElement('div');
    modal.className = 'bg-surface text-text-primary shadow-2xl border border-border-base rounded-xl w-[90%] max-w-[600px] max-h-[80vh] flex flex-col';

    // Create header
    // .canvas-manager-header { border-bottom: 1px solid var(--border-base); }
    const header = document.createElement('div');
    header.className = 'p-6 flex justify-between items-center border-b border-border-base';

    const title = document.createElement('h2');
    title.textContent = 'My Canvases';
    // .canvas-manager-title { color: var(--text-primary); }
    title.className = 'm-0 text-2xl font-semibold text-text-primary';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    // .canvas-manager-close { color: var(--text-secondary); } hover: bg-surface-hover, color-text-primary
    closeBtn.className = 'bg-transparent border-none text-3xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-colors text-text-secondary hover:bg-surface-hover hover:text-text-primary';

    closeBtn.onclick = onClose;

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create new canvas button
    const newCanvasBtn = document.createElement('button');
    newCanvasBtn.textContent = '+ New Canvas';
    // .new-canvas-btn { background: var(--color-accent); color: var(--color-accent-fg); } hover: darker
    newCanvasBtn.className = 'mx-6 my-4 px-6 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-colors bg-accent text-white hover:bg-[color-mix(in_srgb,var(--color-accent),black_10%)]';

    newCanvasBtn.onclick = async () => {
        const name = prompt('Canvas name:', 'Untitled Canvas');
        if (name) {
            await onCreate(name);
            onClose();
        }
    };

    // Create canvas list container
    const listContainer = document.createElement('div');
    listContainer.className = 'flex-1 overflow-y-auto px-6 pb-6';

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
        // .canvas-item { background: var(--bg-surface-hover); border: 1px solid var(--border-base); } hover: border-slate-400
        item.className = 'rounded-lg p-4 mb-3 border border-border-base transition-colors bg-surface-hover hover:border-slate-400';

        const topRow = document.createElement('div');
        topRow.className = 'flex justify-between items-center mb-2';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = canvas.name;
        // .canvas-item-name { color: var(--text-primary); }
        nameSpan.className = 'text-base font-medium text-text-primary';

        const dateSpan = document.createElement('span');
        dateSpan.textContent = formatDate(canvas.lastModified);
        // .canvas-item-date { color: var(--text-secondary); }
        dateSpan.className = 'text-sm text-text-secondary';

        topRow.appendChild(nameSpan);
        topRow.appendChild(dateSpan);

        const actions = document.createElement('div');
        actions.className = 'flex gap-2';

        const loadBtn = createActionButton('Load', 'text-primary border-primary hover:bg-primary hover:text-white', async () => {
            await onLoad(canvas.id);
            onClose();
        });

        const renameBtn = createActionButton('Rename', 'text-text-secondary border-border-base hover:bg-text-secondary hover:text-surface', async () => {
            const newName = prompt('New name:', canvas.name);
            if (newName && newName !== canvas.name) {
                await renameCanvas(canvas.id, newName);
                await renderList();
            }
        });

        const deleteBtn = createActionButton('Delete', 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white', async () => {
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

    function createActionButton(text, tailwindClasses, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        // .canvas-action-btn { padding: 6px 12px; bg: var(--bg-surface); border: 1px solid currentColor; radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        // hover: border-transparent
        btn.className = `px-3 py-1.5 bg-surface border border-current rounded-md text-[13px] font-medium cursor-pointer transition-all duration-200 hover:border-transparent ${tailwindClasses}`;

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
