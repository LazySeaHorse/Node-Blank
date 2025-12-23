/**
 * App Header Organism - Floating toolbar
 */
import { createModeSelector } from './ModeSelector.js';
import { createActionBar } from './ActionBar.js';
import { createIconElement } from '../../utils/icons.js';

import { createMoreToolsMenu } from './MoreToolsMenu.js';
import { signals, effect } from '../../state/appState.js';

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

    // Helper to exit search fully
    const exitSearch = () => {
        if (signals.searchQuery.value || signals.isSearchOpen.value) {
            signals.searchQuery.value = '';
            signals.isSearchOpen.value = false;
        }
    };

    // Smushed Menu Button (only acts as a toggle to close search/restore view)
    const smushedBtn = document.createElement('button');
    smushedBtn.className = 'hidden items-center justify-center p-2 text-text-secondary hover:text-text-primary';
    smushedBtn.appendChild(createIconElement('menu', 20));
    smushedBtn.onclick = (e) => {
        e.stopPropagation();
        exitSearch();
    };
    header.appendChild(smushedBtn);

    header.addEventListener('click', (e) => {
        if (e.target !== smushedBtn && !smushedBtn.contains(e.target)) {
            exitSearch();
        }
    });

    effect(() => {
        const isSearch = signals.isSearchOpen.value;
        const isMobile = window.innerWidth < 768;

        // Position Logic
        if (isMobile) {
            header.classList.remove('left-1/2', '-translate-x-1/2');
            header.classList.add('right-4', 'translate-x-0');
            header.style.left = 'auto'; // ensure override
        } else {
            header.classList.add('left-1/2', '-translate-x-1/2');
            header.classList.remove('right-4', 'translate-x-0');
            header.style.left = '';
        }

        // Smushing Logic (Mobile Only)
        if (isMobile && isSearch) {
            // Hide standard controls
            canvasesBtn.style.display = 'none';
            divider1.style.display = 'none';
            modeSelector.style.display = 'none';
            moreMenu.style.display = 'none';
            divider2.style.display = 'none';
            actionBar.style.display = 'none';

            // Show smushed button
            smushedBtn.classList.remove('hidden');
            smushedBtn.classList.add('flex');
        } else {
            // Restore standard controls
            canvasesBtn.style.display = '';
            divider1.style.display = '';

            modeSelector.style.display = '';
            moreMenu.style.display = '';

            divider2.style.display = '';
            actionBar.style.display = ''; // "flex gap-1 ..."

            // Hide smushed button
            smushedBtn.classList.add('hidden');
            smushedBtn.classList.remove('flex');
        }
    });

    // Resize listener to re-run effect logic implicitly or explicitly
    window.addEventListener('resize', () => {

        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            header.classList.remove('left-1/2', '-translate-x-1/2');
            header.classList.add('right-4', 'translate-x-0');
            header.style.left = 'auto';
        } else {
            header.classList.add('left-1/2', '-translate-x-1/2');
            header.classList.remove('right-4', 'translate-x-0');
            header.style.left = '';
        }
    });

    return header;
}
