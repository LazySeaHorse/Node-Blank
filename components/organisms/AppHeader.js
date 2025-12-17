/**
 * App Header Organism - Floating toolbar
 */
import { createModeSelector } from './ModeSelector.js';
import { createActionBar } from './ActionBar.js';
import { createIconElement } from '../../utils/icons.js';

import { createMoreToolsMenu } from './MoreToolsMenu.js';

export function createAppHeader({
    onModeChange,
    onUndo,
    onExport,
    onImport,
    onSave,
    onImageUpload,
    onVideoAdd,
    onClear,
    onCanvasManager
}) {
    const header = document.createElement('div');
    header.className = 'app-header absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface p-2 rounded-lg border border-border-base shadow-lg z-30';

    // Canvases button (icon only)
    const canvasesBtn = document.createElement('button');
    canvasesBtn.className = 'flex items-center justify-center p-2 bg-transparent border-none text-text-secondary cursor-pointer rounded-md transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary active:bg-surface-active';
    canvasesBtn.title = 'Canvases';
    canvasesBtn.appendChild(createIconElement('folder', 20));
    canvasesBtn.addEventListener('click', onCanvasManager);

    // Divider
    const divider1 = document.createElement('div');
    divider1.className = 'h-6 w-px bg-border-base hidden md:block';

    // Bundle handlers for mode/tools
    const toolHandlers = { onModeChange, onImageUpload, onVideoAdd };

    // Mode selector (Dynamic Toolbar)
    const modeSelector = createModeSelector(toolHandlers);
    // Restore styling: flex, background, padding, radius, border, gap
    modeSelector.className = 'flex bg-canvas p-1 rounded-lg border border-border-base gap-1 hidden md:flex';

    // More Tools Menu
    const moreMenu = createMoreToolsMenu(toolHandlers);
    moreMenu.classList.add('hidden', 'md:block'); // Hide on mobile

    // Divider
    const divider2 = document.createElement('div');
    divider2.className = 'h-6 w-px bg-border-base hidden md:block';

    // Action bar (icon only)
    const actionBar = createActionBar({
        onUndo,
        onExport,
        onImport,
        onSave,
        iconOnly: true
    });

    actionBar.className = 'flex gap-1 [&>*:first-child]:hidden md:[&>*:first-child]:flex';

    header.appendChild(canvasesBtn);
    header.appendChild(divider1);
    header.appendChild(modeSelector);
    header.appendChild(moreMenu);
    header.appendChild(divider2);
    header.appendChild(actionBar);
    return header;
}
