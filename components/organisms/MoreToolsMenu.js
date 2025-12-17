/**
 * More Tools Menu Organism
 * Button that opens a dropdown with extra tools and configuration option.
 */
import { appState } from '../../state/appState.js';
import { TOOLS } from '../../utils/toolRegistry.js';
import { createIconElement } from '../../utils/icons.js';
import { createDropdown } from '../molecules/Dropdown.js';
import { createToolConfigModal } from './ToolConfigModal.js';

export function createMoreToolsMenu(handlers) {
    const container = document.createElement('div');
    container.className = 'ml-1 relative'; // more-tools-menu

    const triggerBtn = document.createElement('button');
    // .more-tools-trigger { color: var(--text-secondary); transition: all 0.2s ease; } hover: text-primary, bg-surface-hover
    triggerBtn.className = 'p-2 rounded-md transition-colors border-none bg-transparent cursor-pointer text-text-secondary hover:text-text-primary hover:bg-surface-hover';
    triggerBtn.title = 'More Tools';
    triggerBtn.appendChild(createIconElement('more-horizontal', 20));

    container.appendChild(triggerBtn);

    triggerBtn.addEventListener('click', () => {
        // Build items list from current state
        const config = appState.toolConfig;

        const items = config.more.map(toolId => {
            const tool = TOOLS[toolId];
            if (!tool) return null;

            return {
                label: tool.label,
                icon: createIconElement(tool.icon, 16),
                onClick: () => {
                    if (tool.type === 'mode') {
                        handlers.onModeChange(toolId);
                    } else if (tool.type === 'action') {
                        if (toolId === 'image') handlers.onImageUpload();
                        if (toolId === 'video') handlers.onVideoAdd();
                    }
                }
            };
        }).filter(Boolean);

        // Add Separator and Configure
        if (items.length > 0) {
            items.push({ type: 'separator' });
        }

        items.push({
            label: 'Configure Toolbar...',
            icon: createIconElement('settings', 16),
            onClick: () => {
                createToolConfigModal({
                    onClose: () => { }
                });
            }
        });

        createDropdown({
            trigger: triggerBtn,
            items: items
        });
    });

    return container;
}
