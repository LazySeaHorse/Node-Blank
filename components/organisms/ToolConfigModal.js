/**
 * Tool Configuration Modal
 * Allows user to customize which tools appear in the toolbar vs the "More" menu.
 */
import { appState } from '../../state/appState.js';
import { TOOLS } from '../../utils/toolRegistry.js';
import { createIconElement } from '../../utils/icons.js';

export function createToolConfigModal({ onClose }) {
    // Create overlay
    // .modal-overlay { bg: rgba(0,0,0,0.5); backdrop-filter: blur(2px); }
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center backdrop-blur-[2px]';

    // Create modal container
    // .tool-config-modal { bg: var(--bg-surface); color: var(--text-primary); shadow: lg; border: 1px solid var(--border-base); }
    const modal = document.createElement('div');
    modal.className = 'bg-surface text-text-primary border border-border-base rounded-lg shadow-xl w-[600px] max-w-[90vw] overflow-hidden flex flex-col max-h-[80vh]';
    overlay.appendChild(modal);

    // Initial State (Copy of current config)
    const currentConfig = appState.toolConfig;
    let toolbarItems = [...currentConfig.toolbar];
    let moreItems = [...currentConfig.more];

    // Header
    const header = document.createElement('div');
    header.className = 'px-6 py-4 flex justify-between items-center border-b border-border-base';
    header.innerHTML = '<h2 class="text-lg font-bold text-text-primary">Customize Toolbar</h2>';
    const closeBtn = document.createElement('button');
    // .modal-close { color: var(--text-secondary); } hover: color-text-primary
    closeBtn.className = 'text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0';
    closeBtn.appendChild(createIconElement('x', 24));
    closeBtn.onclick = () => cleanup();
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'p-6 flex gap-6 min-h-[300px] overflow-y-auto';

    // Helper to render lists
    function renderList(title, items, isToolbar) {
        const container = document.createElement('div');
        container.className = 'flex-1 flex flex-col gap-2';

        const titleEl = document.createElement('h3');
        // .list-area-title { color: var(--text-secondary); }
        titleEl.className = 'text-sm font-semibold mb-2 uppercase tracking-wide text-text-secondary';
        titleEl.textContent = title;
        container.appendChild(titleEl);

        const listContainer = document.createElement('div');
        // .list-container { bg: var(--bg-canvas); border: 1px solid var(--border-base); }
        listContainer.className = 'bg-canvas border border-border-base rounded-md p-2 flex-1 overflow-y-auto min-h-[250px]';

        items.forEach(itemId => {
            const tool = TOOLS[itemId];
            if (!tool) return;

            const itemEl = document.createElement('div');
            // .tool-item { bg: var(--bg-surface); border: 1px solid var(--border-base); } hover: border-slate-400
            itemEl.className = 'flex items-center justify-between p-3 mb-2 rounded shadow-sm group bg-surface border border-border-base hover:border-slate-400';

            const left = document.createElement('div');
            // .tool-item-icon { color: var(--text-secondary); }
            left.className = 'flex items-center gap-3 text-text-secondary';
            left.appendChild(createIconElement(tool.icon, 18));

            const text = document.createElement('span');
            text.textContent = tool.label;
            // .tool-item-label { color: var(--text-primary); }
            text.className = 'font-medium text-text-primary';
            left.appendChild(text);
            itemEl.appendChild(left);

            const actionBtn = document.createElement('button');
            // .tool-action-btn { color: var(--text-secondary); } hover: color-accent, bg-surface-active
            actionBtn.className = 'p-1 rounded transition-colors tooltip text-text-secondary hover:text-accent hover:bg-surface-active cursor-pointer border-none bg-transparent';
            // Arrow icon based on direction
            const iconName = isToolbar ? 'arrow-right' : 'arrow-left';
            actionBtn.appendChild(createIconElement(iconName, 18));
            actionBtn.title = isToolbar ? "Move to More Menu" : "Move to Main Toolbar";

            actionBtn.onclick = () => moveItem(itemId, isToolbar);

            itemEl.appendChild(actionBtn);
            listContainer.appendChild(itemEl);
        });

        container.appendChild(listContainer);
        return container;
    }

    // Render Function
    function render() {
        body.innerHTML = '';
        body.appendChild(renderList('Main Toolbar', toolbarItems, true));
        body.appendChild(renderList('More Menu', moreItems, false));
    }

    // Logic
    function moveItem(id, fromToolbar) {
        if (fromToolbar) {
            toolbarItems = toolbarItems.filter(i => i !== id);
            moreItems.push(id);
        } else {
            moreItems = moreItems.filter(i => i !== id);
            toolbarItems.push(id);
        }
        render(); // Re-render lists
    }

    modal.appendChild(body);
    render();

    // Footer
    const footer = document.createElement('div');
    // .modal-footer { bg: var(--bg-surface-hover); border-top: 1px solid var(--border-base); }
    footer.className = 'px-6 py-4 flex justify-end gap-3 bg-surface-hover border-t border-border-base';

    const cancelBtn = document.createElement('button');
    // .btn-secondary { color: var(--text-primary); } hover: bg-surface-active
    cancelBtn.className = 'px-4 py-2 font-medium rounded-md transition-colors bg-transparent border-none cursor-pointer text-text-primary hover:bg-surface-active';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => cleanup();

    const saveBtn = document.createElement('button');
    // .btn-primary { bg: var(--color-accent); color: var(--color-accent-fg); } hover: darker
    saveBtn.className = 'px-4 py-2 font-medium rounded-md shadow-sm transition-colors border-none cursor-pointer bg-accent text-white hover:bg-[color-mix(in_srgb,var(--color-accent),black_10%)]';
    saveBtn.textContent = 'Save Changes';
    saveBtn.onclick = () => {
        // Save to global state
        appState.toolConfig = {
            toolbar: toolbarItems,
            more: moreItems
        };
        cleanup();
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);
    modal.appendChild(footer);

    // Helpers
    function cleanup() {
        document.body.removeChild(overlay);
        if (onClose) onClose();
    }

    document.body.appendChild(overlay);

    return overlay;
}
