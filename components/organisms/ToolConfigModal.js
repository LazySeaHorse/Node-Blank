/**
 * Tool Configuration Modal
 * Allows user to customize which tools appear in the toolbar vs the "More" menu.
 */
import { appState } from '../../state/appState.js';
import { TOOLS } from '../../utils/toolRegistry.js';
import { createIconElement } from '../../utils/icons.js';

export function createToolConfigModal({ onClose }) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center';

    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'tool-config-modal rounded-lg shadow-xl w-[600px] max-w-[90vw] overflow-hidden flex flex-col max-h-[80vh]';
    overlay.appendChild(modal);

    // Initial State (Copy of current config)
    const currentConfig = appState.toolConfig;
    let toolbarItems = [...currentConfig.toolbar];
    let moreItems = [...currentConfig.more];

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header px-6 py-4 flex justify-between items-center';
    header.innerHTML = '<h2 class="modal-title text-lg font-bold">Customize Toolbar</h2>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
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
        titleEl.className = 'list-area-title text-sm font-semibold mb-2 uppercase tracking-wide';
        titleEl.textContent = title;
        container.appendChild(titleEl);

        const listContainer = document.createElement('div');
        listContainer.className = 'list-container rounded-md p-2 flex-1 overflow-y-auto min-h-[250px]';

        items.forEach(itemId => {
            const tool = TOOLS[itemId];
            if (!tool) return;

            const itemEl = document.createElement('div');
            itemEl.className = 'tool-item flex items-center justify-between p-3 mb-2 rounded shadow-sm group';

            const left = document.createElement('div');
            left.className = 'flex items-center gap-3 tool-item-icon';
            left.appendChild(createIconElement(tool.icon, 18));

            const text = document.createElement('span');
            text.textContent = tool.label;
            text.className = 'tool-item-label font-medium';
            left.appendChild(text);
            itemEl.appendChild(left);

            const actionBtn = document.createElement('button');
            actionBtn.className = 'tool-action-btn p-1 rounded transition-colors tooltip';
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
    footer.className = 'modal-footer px-6 py-4 flex justify-end gap-3';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-secondary px-4 py-2 font-medium rounded-md transition-colors';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => cleanup();

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-primary px-4 py-2 font-medium rounded-md shadow-sm transition-colors';
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
