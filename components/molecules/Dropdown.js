/**
 * Dropdown Molecule
 * A reusable floating dropdown menu with an overlay to close it.
 */

export function createDropdown({
    trigger,
    items,
    onClose,
    position = 'bottom-start'
}) {
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';

    // Calculate position
    const rect = trigger.getBoundingClientRect();
    const top = rect.bottom + 8;
    const left = rect.left;

    dropdown.style.cssText = `
        position: fixed;
        top: ${top}px;
        left: ${left}px;
        animation: fadeIn 0.1s ease-out;
    `;

    // Add simple animation styles only (structure moved to more-tools.css)
    const style = document.createElement('style');
    if (!document.getElementById('dropdown-animation')) {
        style.id = 'dropdown-animation';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .dropdown-menu {
                min-width: 180px;
                padding: 0.5rem;
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                border-radius: 0.5rem;
            }
            .dropdown-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                width: 100%;
                padding: 0.5rem 0.75rem;
                border: none;
                border-radius: 0.375rem;
                text-align: left;
                font-size: 0.875rem;
                cursor: pointer;
                font-family: inherit;
                background: transparent;
            }
            .dropdown-separator {
                height: 1px;
                margin: 0.5rem 0;
            }
        `;
        document.head.appendChild(style);
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
    `;

    // Render items
    items.forEach(item => {
        if (item.type === 'separator') {
            const separator = document.createElement('div');
            separator.className = 'dropdown-separator';
            dropdown.appendChild(separator);
            return;
        }

        const btn = document.createElement('button');
        btn.className = 'dropdown-item';

        if (item.icon) {
            // If icon is a string, we might need a helper, but here we assume it's pre-rendered element or handled by caller?
            // Existing app uses createIconElement. Let's assume the caller passes either an HTML string or element, or we handle it if simple string.
            // For flexibility, let's assume 'icon' in item can be an Element or HTML string.
            // But to match app style simpler: expecting element
            if (item.icon instanceof Element) {
                btn.appendChild(item.icon);
            }
        }

        const label = document.createElement('span');
        label.textContent = item.label;
        btn.appendChild(label);

        btn.onclick = (e) => {
            e.stopPropagation();
            if (item.onClick) item.onClick();
            cleanup();
        };

        dropdown.appendChild(btn);
    });

    function cleanup() {
        if (document.body.contains(dropdown)) document.body.removeChild(dropdown);
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        if (onClose) onClose();
    }

    overlay.onclick = cleanup;

    document.body.appendChild(overlay);
    document.body.appendChild(dropdown);

    return {
        close: cleanup
    };
}
