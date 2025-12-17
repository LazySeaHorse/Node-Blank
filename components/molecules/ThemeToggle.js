/**
 * Theme Toggle Molecule
 * Handles light/dark mode switching
 */
import { html, useState, useEffect, render } from '../../utils/preact.js';

export function createThemeToggle() {
    // Container for the component
    const container = document.createElement('div');
    render(html`<${ThemeToggle} />`, container);
    return container.firstElementChild;
    // Return first child because the app expects a button element, 
    // and replaceWith/appendChild is used in app.js. 
    // Ideally app.js should handle the component mount, but we are doing gradual migration.
}

function ThemeToggle() {
    // Initialize state from localStorage or system preference
    const [isDark, setIsDark] = useState(() => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Effect to update document attribute and save preference
    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Dispatch event for other components (like GraphNode)
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: isDark ? 'dark' : 'light' }
        }));
    }, [isDark]);

    const toggle = () => setIsDark(prev => !prev);

    return html`
        <button 
            class="p-3 bg-surface border border-border-base text-text-secondary cursor-pointer rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center mb-3 pointer-events-auto hover:bg-surface-hover hover:text-text-primary hover:-translate-y-px active:bg-surface-active active:translate-y-0"
            title="Toggle Dark Mode"
            onClick=${toggle}
        >
            ${isDark ? html`
                <!-- Sun Icon -->
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
            ` : html`
                <!-- Moon Icon -->
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
            `}
        </button>
    `;
}

