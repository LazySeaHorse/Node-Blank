/**
 * Mode Selector Organism
 */
import { createModeButton } from '../molecules/ModeButton.js';
import { appState } from '../../state/appState.js';
import { createIconElement } from '../../utils/icons.js';

export function createModeSelector(onModeChange, onImageUpload, onVideoAdd) {
    const container = document.createElement('div');
    container.className = 'mode-selector';
    
    const modes = [
        { id: 'btn-mode-math', iconName: 'function', label: 'Math', mode: 'math' },
        { id: 'btn-mode-text', iconName: 'type', label: 'Text', mode: 'text' },
        { id: 'btn-mode-graph', iconName: 'chart', label: 'Graph', mode: 'graph' },
        { id: 'btn-mode-table', iconName: 'table', label: 'Table', mode: 'table' }
    ];
    
    modes.forEach(({ id, iconName, label, mode }) => {
        const button = createModeButton({
            id,
            iconName,
            label,
            isActive: appState.mode === mode,
            onClick: () => onModeChange(mode)
        });
        container.appendChild(button);
    });
    
    // Image upload button
    if (onImageUpload) {
        const imageBtn = document.createElement('button');
        imageBtn.className = 'mode-btn';
        imageBtn.appendChild(createIconElement('image', 18));
        const labelSpan = document.createElement('span');
        labelSpan.textContent = 'Image';
        imageBtn.appendChild(labelSpan);
        imageBtn.addEventListener('click', () => {
            document.getElementById('img-upload').click();
        });
        
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.id = 'img-upload';
        imageInput.accept = 'image/*';
        imageInput.className = 'hidden';
        imageInput.style.display = 'none';
        imageInput.addEventListener('change', (e) => onImageUpload(e.target));
        
        container.appendChild(imageBtn);
        container.appendChild(imageInput);
    }
    
    // Video add button
    if (onVideoAdd) {
        const videoBtn = document.createElement('button');
        videoBtn.className = 'mode-btn';
        videoBtn.appendChild(createIconElement('video', 18));
        const labelSpan = document.createElement('span');
        labelSpan.textContent = 'Video';
        videoBtn.appendChild(labelSpan);
        videoBtn.addEventListener('click', () => onVideoAdd());
        
        container.appendChild(videoBtn);
    }
    
    return container;
}

export function updateModeSelector(mode) {
    ['math', 'text', 'graph', 'table'].forEach(m => {
        const btn = document.getElementById(`btn-mode-${m}`);
        if (btn) {
            if (mode === m) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}
