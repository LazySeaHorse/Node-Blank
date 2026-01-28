import { useEffect, useRef, useState, useLayoutEffect } from 'preact/hooks';
import { JSX } from 'preact/jsx-runtime';

export type DropdownMenuItem =
    | { type: 'separator' }
    | { type: 'item', label: string, icon?: JSX.Element | string | Element, onClick?: () => void };

export interface DropdownProps {
    items: DropdownMenuItem[];
    anchorEl?: HTMLElement | null;
    onClose: () => void;
}

export function Dropdown({ items, anchorEl, onClose }: DropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<JSX.CSSProperties>({
        opacity: 0,
    });

    useLayoutEffect(() => {
        if (!anchorEl || !dropdownRef.current) return;

        const rect = anchorEl.getBoundingClientRect();
        const top = rect.bottom + 8;
        const isRightSide = rect.left > window.innerWidth / 2;

        const newStyle: JSX.CSSProperties = {
            top: `${top}px`,
            opacity: 1
        };

        if (isRightSide) {
            newStyle.right = `${window.innerWidth - rect.right}px`;
            newStyle.left = 'auto';
            newStyle.transformOrigin = 'top right';
        } else {
            newStyle.left = `${rect.left}px`;
            newStyle.transformOrigin = 'top left';
        }

        setStyle(newStyle);
    }, [anchorEl]);

    // Close on outside click is handled by the Overlay in this implementation, 
    // mimicking the legacy one.

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[9999]"
                onClick={onClose}
            />

            {/* Dropdown Menu */}
            <div
                ref={dropdownRef}
                className="fixed min-w-[180px] p-2 flex flex-col gap-1 rounded-lg bg-surface border border-border-base shadow-lg z-[10000] animate-[fadeIn_0.1s_ease-out]"
                style={style}
            >
                {items.map((item, index) => {
                    if (item.type === 'separator') {
                        return <div key={index} className="h-px my-1 bg-border-base" />;
                    }

                    // Handle legacy "icon is Element" case if necessary, though ideally we pass JSX
                    let IconDisplay = null;
                    if (item.icon) {
                        if (item.icon instanceof Element) {
                            // This is tricky in Preact directly without a ref wrapper, 
                            // but let's assume we might need to handle it or migrate callers.
                            // For now, let's ignore the Element case or use a ref-based wrapper if strictly needed.
                            // Simplest: Don't support Element in the new component, enforce JSX.
                            console.warn('Dropdown: passing DOM Elements as icons is deprecated.', item.icon);
                        } else {
                            IconDisplay = item.icon;
                        }
                    }

                    return (
                        <button
                            key={index}
                            className="flex items-center gap-2 w-full px-3 py-2 border-none rounded-md text-left text-sm cursor-pointer bg-transparent text-text-primary transition-colors hover:bg-surface-hover"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (item.onClick) item.onClick();
                                onClose();
                            }}
                        >
                            {IconDisplay && (
                                typeof IconDisplay === 'string'
                                    ? <span>{IconDisplay}</span>
                                    : IconDisplay
                            )}
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}
