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

    // Hide Undo on mobile (first child of action bar) using arbitrary variant
    // Default hidden on mobile, flex on md and up.
    // The children are buttons which should be flex.
    actionBar.className = 'flex gap-1 [&>*:first-child]:hidden md:[&>*:first-child]:flex';

    header.appendChild(canvasesBtn);
    header.appendChild(divider1);
    header.appendChild(modeSelector);
    header.appendChild(moreMenu);
    header.appendChild(divider2);
    header.appendChild(actionBar);

    // Handle Mobile Logic manually since we can't easily do child selectors with just tailwind on the parent without arbitrary values
    // or modifying the child generation logic.
    // For the "Undo button hidden on mobile", we might need to verify if we can touch ActionBar.js.
    // The instructions said "not bloating up app.js" and "small steps".
    // I'll leave the child selector logic for a moment or check if I can modify ActionBar.js briefly?
    // Start with the Header container migration first.
    return header;
}
