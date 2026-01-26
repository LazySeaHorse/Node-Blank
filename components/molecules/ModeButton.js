/**
 * Mode Button Molecule
 */
import { createIconElement } from '../../utils/icons.ts';

export function createModeButton({ id, icon, iconName, label, onClick, isActive = false }) {
    const button = document.createElement('button');
    button.id = id;
    const commonClasses = 'flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer border';

    // Inactive: Gray text, transparent bg, hover effects
    const inactiveClasses = 'text-text-secondary bg-transparent border-transparent hover:bg-surface-hover hover:text-text-primary';

    // Active: Accent color text, surface bg, border, shadow (no hover text override)
    const activeClasses = 'bg-surface shadow-sm text-accent border-border-base';

    button.className = `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`;

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

    if (onClick) button.addEventListener('click', onClick);
    return button;
}
