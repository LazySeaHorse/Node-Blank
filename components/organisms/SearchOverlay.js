/**
 * Search Overlay Organism
 * Global search functionality
 */
import { signals, effect } from '../../state/appState.js';
import { createIconElement } from '../../utils/icons.js';

export function createSearchOverlay() {
    // 1. Main Shell (Background/Border/Shadow)
    // We add flex to align children
    const shell = document.createElement('div');
    shell.className = 'absolute top-4 left-4 z-40 bg-surface border border-border-base rounded-lg shadow-lg flex items-center p-2 transition-all duration-300 ease-in-out';

    // 2. Icon Wrapper (Always visible)
    const iconWrapper = document.createElement('div');
    // Added p-2 to match standard button padding size (8px) + 20px icon = 36px content height
    iconWrapper.className = 'flex items-center justify-center text-text-secondary cursor-pointer hover:text-text-primary transition-colors p-2';
    // Matches button size inside header (icon + padding)
    iconWrapper.appendChild(createIconElement('search', 20));

    // 3. Input Wrapper (Expandable)
    const inputContainer = document.createElement('div');
    inputContainer.className = 'overflow-hidden transition-all duration-300 ease-in-out relative flex items-center';
    // Width controlled via JS/Classes

    // 4. Input Field
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search...';
    // pl-2 (spacing from icon), pr-28 (room for controls)
    // Removed default vertical padding (py-0) and set fixed height (h-9 = 36px) to match iconWrapper
    input.className = 'bg-transparent border-none pl-2 pr-28 text-text-primary outline-none placeholder:text-text-secondary/50 w-64 h-9 py-0';

    // 5. Controls (Count + Clear) - Absolute Right of Input Container
    const controls = document.createElement('div');
    controls.className = 'absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-auto pr-1';

    const countBadge = document.createElement('span');
    countBadge.className = 'text-xs text-text-secondary font-medium whitespace-nowrap hidden';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'p-0.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-hover flex items-center justify-center transition-colors hidden';
    clearBtn.title = 'Clear';
    clearBtn.appendChild(createIconElement('x', 14));
    clearBtn.onclick = () => {
        signals.searchQuery.value = '';
        input.focus();
    };

    controls.appendChild(countBadge);
    controls.appendChild(clearBtn);

    inputContainer.appendChild(input);
    inputContainer.appendChild(controls);

    shell.appendChild(iconWrapper);
    shell.appendChild(inputContainer);

    // Event Handlers

    // Click Icon to Toggle (Mobile) or Focus (Desktop)
    iconWrapper.onclick = () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            signals.isSearchOpen.value = !signals.isSearchOpen.value;
            if (signals.isSearchOpen.value) {
                setTimeout(() => input.focus(), 100);
            }
        } else {
            input.focus();
        }
    };

    input.addEventListener('input', (e) => {
        signals.searchQuery.value = e.target.value;
    });

    // Reactive State
    effect(() => {
        const isOpen = signals.isSearchOpen.value;
        const query = signals.searchQuery.value;
        const isMobile = window.innerWidth < 768;

        // Sync Input Value
        if (input.value !== query) input.value = query;

        // UI Controls (Count/Clear)
        if (query.length > 0) {
            clearBtn.classList.remove('hidden');
            countBadge.classList.remove('hidden');
            countBadge.textContent = `${signals.searchMatchCount.value} found`;
        } else {
            clearBtn.classList.add('hidden');
            countBadge.classList.add('hidden');
        }

        if (isMobile) {
            if (isOpen) {
                inputContainer.style.width = 'min(16rem, calc(100vw - 160px))';
                inputContainer.style.opacity = '1';
                shell.classList.add('border-primary'); // Highlight active
            } else {
                inputContainer.style.width = '0px';
                inputContainer.style.opacity = '0';
                shell.classList.remove('border-primary');
            }
        } else {
            // Desktop
            inputContainer.style.width = '16rem';
            inputContainer.style.opacity = '1';
            shell.classList.remove('border-primary');
        }
    });

    // Resize Handler
    window.addEventListener('resize', () => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile) {
            inputContainer.style.width = '16rem';
            inputContainer.style.opacity = '1';
        } else {
            if (!signals.isSearchOpen.value) {
                inputContainer.style.width = '0px';
                inputContainer.style.opacity = '0';
            }
        }
    });

    return shell;
}
