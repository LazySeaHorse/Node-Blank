import { JSX } from 'preact/jsx-runtime';

export interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
    /** optional explicit text prop, though children is preferred */
    text?: string;
}

/**
 * Atomic Button Component
 * Migrated from components/atoms/Button.js
 */
export function Button({ 
    text,
    className = '', 
    children, 
    ...props 
}: ButtonProps) {
    return (
        <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer border-none outline-none hover:opacity-90 active:scale-95 ${className}`}
            {...props}
        >
            {text || children}
        </button>
    );
}
