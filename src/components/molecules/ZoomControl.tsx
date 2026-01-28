import { JSX } from 'preact/jsx-runtime';

export interface ZoomControlProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    onFullReset: () => void;
    initialZoom?: number;
    currentZoom?: number; // Added for reactivity if needed, though legacy passed initial
}

export function ZoomControl({
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onFullReset,
    initialZoom = 100,
    currentZoom
}: ZoomControlProps) {
    const displayZoom = currentZoom !== undefined ? currentZoom : initialZoom;

    const btnClass = 'p-3 bg-transparent border-none text-text-secondary cursor-pointer transition-colors duration-150 hover:bg-surface-hover active:bg-surface-active';

    const handleIndicatorClick = (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        if (e.detail === 1) {
            onZoomReset();
        } else if (e.detail === 2) {
            onFullReset();
        }
    };

    return (
        <div className="flex flex-col bg-surface shadow-lg rounded-lg border border-border-base z-30 overflow-hidden pointer-events-auto">
            <button className={`${btnClass} border-b border-border-base`} onClick={onZoomIn}>
                +
            </button>
            <button
                id="zoom-indicator"
                className="p-2 text-xs font-bold text-text-secondary text-center cursor-pointer transition-colors duration-150 hover:bg-surface-hover bg-transparent border-none"
                onClick={handleIndicatorClick}
            >
                {Math.round(displayZoom)}%
            </button>
            <button className={`${btnClass} border-t border-border-base`} onClick={onZoomOut}>
                -
            </button>
        </div>
    );
}
