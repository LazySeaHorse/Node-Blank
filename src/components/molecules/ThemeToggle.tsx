import { useState, useEffect } from 'preact/hooks';
import { IconSun, IconMoon } from '../icons';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: isDark ? 'dark' : 'light' }
        }));
    }, [isDark]);

    const toggle = () => setIsDark(prev => !prev);

    return (
        <button
            className="p-3 bg-surface border border-border-base text-text-secondary cursor-pointer rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center mb-3 pointer-events-auto hover:bg-surface-hover hover:text-text-primary hover:-translate-y-px active:bg-surface-active active:translate-y-0"
            title="Toggle Dark Mode"
            onClick={toggle}
        >
            {isDark ? (
                <IconSun className="w-5 h-5 fill-current" />
            ) : (
                <IconMoon className="w-5 h-5 fill-current" />
            )}
        </button>
    );
}
