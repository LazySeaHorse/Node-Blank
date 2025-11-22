/**
 * App Header Organism - Floating toolbar
 */
import { createModeSelector } from './ModeSelector.js';
import { createActionBar } from './ActionBar.js';
import { createIconElement } from '../../utils/icons.js';

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
    header.className = 'app-header';
    
    // Canvases button (icon only)
    const canvasesBtn = document.createElement('button');
    canvasesBtn.className = 'header-icon-btn';
    canvasesBtn.title = 'Canvases';
    canvasesBtn.appendChild(createIconElement('folder', 20));
    canvasesBtn.addEventListener('click', onCanvasManager);
    
    // Divider
    const divider1 = document.createElement('div');
    divider1.className = 'header-divider';
    
    // Mode selector (includes image and video buttons) - with labels
    const modeSelector = createModeSelector(onModeChange, onImageUpload, onVideoAdd);
    
    // Divider
    const divider2 = document.createElement('div');
    divider2.className = 'header-divider';
    
    // Action bar (icon only)
    const actionBar = createActionBar({
        onUndo,
        onExport,
        onImport,
        onSave,
        iconOnly: true
    });
    
    header.appendChild(canvasesBtn);
    header.appendChild(divider1);
    header.appendChild(modeSelector);
    header.appendChild(divider2);
    header.appendChild(actionBar);
    
    return header;
}
