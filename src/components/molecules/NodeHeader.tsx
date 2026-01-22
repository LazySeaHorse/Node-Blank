import { JSX } from 'preact/jsx-runtime';

export interface NodeHeaderProps {
    title: string;
    controls?: JSX.Element[];
    className?: string; // Allow overrides
    onMouseDown?: (e: JSX.TargetedMouseEvent<HTMLDivElement>) => void;
}

export function NodeHeader({ title, controls = [], className = '', onMouseDown }: NodeHeaderProps) {
    return (
        <div
            className={`p-2 px-3 bg-surface-hover border-b border-border-base flex justify-between items-center cursor-grab select-none ${className}`}
            onMouseDown={onMouseDown}
        >
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {title.toUpperCase()}
            </span>
            {controls.length > 0 && (
                <div className="flex gap-2 items-center">
                    {controls}
                </div>
            )}
        </div>
    );
}

export interface ButtonGroupProps {
    label: string;
    onDecrement: () => void;
    onIncrement: () => void;
}

export function ButtonGroup({ label, onDecrement, onIncrement }: ButtonGroupProps) {
    const btnClass = 'px-2 py-1 bg-transparent border-none text-text-secondary cursor-pointer transition-colors duration-150 hover:bg-surface-hover active:bg-surface-active text-xs';

    return (
        <div className="flex bg-surface rounded border border-border-base overflow-hidden">
            <button
                className={`${btnClass} border-r border-border-base`}
                onClick={(e) => { e.stopPropagation(); onDecrement(); }}
            >
                −
            </button>
            <span className="px-2 py-1 text-xs text-text-secondary select-none">
                {label}
            </span>
            <button
                className={`${btnClass} border-l border-border-base`}
                onClick={(e) => { e.stopPropagation(); onIncrement(); }}
            >
                +
            </button>
        </div>
    );
}
