/**
 * Action Button Molecule
 */
import { createIconElement } from '../../utils/icons.js';

export function createActionButton({ icon, iconName, label, onClick, iconOnly = false }) {
    const button = document.createElement('button');

    if (iconOnly) {
        // header-icon-btn equivalent
        button.className = 'flex items-center justify-center p-2 bg-transparent border-none text-text-secondary cursor-pointer rounded-md transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary active:bg-surface-active header-icon-btn-migrated';
        button.title = label;
        if (iconName) {
            button.appendChild(createIconElement(iconName, 20));
        }
    } else {
        // action-btn equivalent
        // .action-btn { display: flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.875rem; color: var(--color-slate-600); ... }
        button.className = 'flex items-center gap-1.5 px-2 py-1 rounded-sm text-sm text-text-secondary bg-transparent border-none cursor-pointer transition-colors duration-150 hover:bg-surface-active action-btn-migrated';

        if (iconName) {
            button.appendChild(createIconElement(iconName, 18));
        } else if (icon) {
            const iconSpan = document.createElement('span');
            iconSpan.textContent = icon;
            button.appendChild(iconSpan);
        }
        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        button.appendChild(labelSpan);
    }

    if (onClick) button.addEventListener('click', onClick);
    return button;
}
