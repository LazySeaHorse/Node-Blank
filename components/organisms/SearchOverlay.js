/**
 * Search Overlay Organism
 * Global search functionality
 */
import { signals, effect } from '../../state/appState.js';
import { createIconElement } from '../../utils/icons.js';

export function createSearchOverlay() {
    const container = document.createElement('div');
    container.className = 'absolute top-4 left-4 z-40 flex items-center gap-2';

    // Search Toggle Button (Mobile mainly)
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'flex items-center justify-center p-2 bg-surface border border-border-base rounded-lg text-text-secondary cursor-pointer transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary shadow-sm';
    toggleBtn.appendChild(createIconElement('search', 20));

    // Input Container
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'overflow-hidden transition-all duration-300 ease-in-out bg-surface rounded-lg shadow-lg origin-left relative flex items-center';
    // Default state: Hidden on mobile (width 0), Visible on desktop
    // We'll manage classes based on state signals

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search nodes...';
    // Added pr-24 (padding-right 6rem) to prevent text overlapping controls
    input.className = 'w-full w-64 bg-transparent border-none pl-4 pr-28 py-2 text-text-primary outline-none placeholder:text-text-secondary/50';

    // Controls Container (Count + Clear)
    const controls = document.createElement('div');
    controls.className = 'absolute right-2 flex items-center gap-2 pointer-events-auto';

    // Count Badge
    const countBadge = document.createElement('span');
    countBadge.className = 'text-xs text-text-secondary font-medium whitespace-nowrap hidden';

    // Clear Button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'p-1 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-hover flex items-center justify-center transition-colors hidden';
    clearBtn.title = 'Clear search';
    clearBtn.appendChild(createIconElement('x', 14));
    clearBtn.onclick = () => {
        signals.searchQuery.value = '';
        input.focus();
    };

    controls.appendChild(countBadge);
    controls.appendChild(clearBtn);

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(controls);

    container.appendChild(toggleBtn);
    container.appendChild(inputWrapper);

    // Bind Input
    input.addEventListener('input', (e) => {
        signals.searchQuery.value = e.target.value;
    });

    // Toggle Logic
    toggleBtn.addEventListener('click', () => {
        // Toggle interaction specific check for mobile logic
        // If query is empty and we click, we might want to close if already open
        // But usually search icon focuses input
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            signals.isSearchOpen.value = !signals.isSearchOpen.value;
            if (signals.isSearchOpen.value) {
                setTimeout(() => input.focus(), 100);
            }
        } else {
            input.focus();
        }
    });

    // Reactive State Updates
    effect(() => {
        const isOpen = signals.isSearchOpen.value;
        const query = signals.searchQuery.value;

        // Update input value if different
        if (input.value !== query) {
            input.value = query;
        }

        // Update functionality UI (Count & Clear)
        const hasQuery = query.length > 0;

        if (hasQuery) {
            clearBtn.classList.remove('hidden');
            countBadge.classList.remove('hidden');
            const count = signals.searchMatchCount.value;
            countBadge.textContent = `${count} found`;
        } else {
            clearBtn.classList.add('hidden');
            countBadge.classList.add('hidden');
        }

        // On Desktop, we want it always open essentially, or at least visible
        // On Mobile, we toggle

        // We can use a media query check inside effect or rely on CSS classes
        // Ideally CSS classes handle the "desktop always open" part

        if (isOpen) {
            inputWrapper.style.width = '16rem'; // w-64
            inputWrapper.style.opacity = '1';
            inputWrapper.style.pointerEvents = 'auto';
            toggleBtn.classList.add('text-primary', 'border-primary');
        } else {
            // Close state
            // Only strictly close if on Mobile
            if (window.innerWidth < 768) {
                inputWrapper.style.width = '0px';
                inputWrapper.style.opacity = '0';
                inputWrapper.style.pointerEvents = 'none';
                toggleBtn.classList.remove('text-primary', 'border-primary');
            } else {
                // Desktop: Always open
                inputWrapper.style.width = '16rem';
                inputWrapper.style.opacity = '1';
                inputWrapper.style.pointerEvents = 'auto';
            }
        }
    });

    // Listen for resize to reset/fix state if needed
    window.addEventListener('resize', () => {
        // Force re-evaluation of the effect by touching the signal roughly? 
        // Or just manually checking
        if (window.innerWidth >= 768) {
            inputWrapper.style.width = '16rem';
            inputWrapper.style.opacity = '1';
            inputWrapper.style.pointerEvents = 'auto';
        } else {
            if (!signals.isSearchOpen.value) {
                inputWrapper.style.width = '0px';
                inputWrapper.style.opacity = '0';
            }
        }
    });

    return container;
}
