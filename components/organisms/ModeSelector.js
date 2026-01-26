/**
 * Mode Selector Organism
 * Display toolbar buttons based on configuration.
 */
import { createModeButton } from '../molecules/ModeButton.js';
import { appState, signals } from '../../state/appState.ts';
import { TOOLS } from '../../utils/toolRegistry.ts';
import { effect } from '@preact/signals-core';

export function createModeSelector(handlers) {
    const container = document.createElement('div');
    container.className = 'mode-selector';

    // We need to re-render when toolConfig changes
    effect(() => {
        container.innerHTML = '';

        const config = signals.toolConfig.value;
        const currentMode = signals.mode.value;

        config.toolbar.forEach(toolId => {
            const tool = TOOLS[toolId];
            if (!tool) return;

            const button = createModeButton({
                id: `btn-tool-${toolId}`,
                iconName: tool.icon,
                label: tool.label,
                isActive: tool.type === 'mode' && currentMode === tool.id,
                onClick: () => {
                    if (tool.type === 'mode') {
                        handlers.onModeChange(tool.id);
                    } else if (tool.type === 'action') {
                        if (toolId === 'image') handlers.onImageUpload();
                        if (toolId === 'video') handlers.onVideoAdd();
                    }
                }
            });
            container.appendChild(button);
        });
    });

    let imageInput = document.getElementById('global-img-upload');
    if (!imageInput) {
        imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.id = 'global-img-upload';
        imageInput.accept = 'image/*';
        imageInput.className = 'hidden';
        imageInput.style.display = 'none';
        imageInput.addEventListener('change', (e) => handlers.onImageUpload(e.target));
        document.body.appendChild(imageInput);
    }

    // Override the generic handler to click our specific input
    const originalImageUpload = handlers.onImageUpload;
    handlers.onImageUpload = (target) => {
        if (target && target.files) {
            // It's the change event carrying the file
            originalImageUpload(target);
        } else {
            // It's the button click, open the dialog
            imageInput.click();
        }
    };

    return container;
}

export function updateModeSelector(mode) {
}
