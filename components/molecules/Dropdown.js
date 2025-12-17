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
    // .dropdown-menu { min-width: 180px; padding: 0.5rem; flex-col; gap: 0.25rem; radius: 0.5rem; bg: surface; border: base; shadow: lg; }
    dropdown.className = 'fixed min-w-[180px] p-2 flex flex-col gap-1 rounded-lg bg-surface border border-border-base shadow-lg z-[10000] animate-[fadeIn_0.1s_ease-out]';

    // Calculate position
    const rect = trigger.getBoundingClientRect();
    const top = rect.bottom + 8;
    const left = rect.left;

    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${left}px`;

    // Removed inline style injection as we use Tailwind classes now

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[9999]';

    // Render items
    items.forEach(item => {
        if (item.type === 'separator') {
            const separator = document.createElement('div');
            // .dropdown-separator { height: 1px; margin: 0.5rem 0; bg: border-base }
            separator.className = 'h-px my-1 bg-border-base';
            dropdown.appendChild(separator);
            return;
        }

        const btn = document.createElement('button');
        // .dropdown-item { flex items-center gap-2 w-full px-3 py-2 border-none radius-md text-left text-sm cursor-pointer bg-transparent text-text-primary hover:bg-surface-hover }
        btn.className = 'flex items-center gap-2 w-full px-3 py-2 border-none rounded-md text-left text-sm cursor-pointer bg-transparent text-text-primary transition-colors hover:bg-surface-hover';

        if (item.icon) {
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
