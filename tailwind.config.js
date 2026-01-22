/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}", // Legacy path support during migration
        "./utils/**/*.{js,ts,jsx,tsx}" // Legacy path support
    ],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                accent: 'var(--color-accent)',

                // Backgrounds
                canvas: 'var(--bg-canvas)',
                surface: {
                    DEFAULT: 'var(--bg-surface)',
                    hover: 'var(--bg-surface-hover)',
                    active: 'var(--bg-surface-active)',
                },

                // Text
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    tertiary: 'var(--text-tertiary)',
                },

                // Borders
                border: {
                    base: 'var(--border-base)',
                }
            },
            borderRadius: {
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
            },
            boxShadow: {
                focus: 'var(--shadow-focus)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
            }
        }
    },
    plugins: [],
}
