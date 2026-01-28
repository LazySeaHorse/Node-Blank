/**
 * Search Overlay Organism
 * Global search functionality
 */
import { useState, useEffect, useRef } from 'preact/hooks';
// @ts-ignore
import { signals, effect } from '@state/appState.ts';
import { IconX, getIconComponent } from '../icons';

export function SearchOverlay() {
    const [isOpen, setIsOpen] = useState(signals.isSearchOpen.value);
    const [query, setQuery] = useState(signals.searchQuery.value);
    const [matchCount, setMatchCount] = useState(signals.searchMatchCount.value);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get Search Icon
    const IconSearch = getIconComponent('search');

    // Subscribe to signals
    useEffect(() => {
        const cleanup1 = effect(() => {
            setIsOpen(signals.isSearchOpen.value);
        });
        const cleanup2 = effect(() => {
            setQuery(signals.searchQuery.value);
        });
        const cleanup3 = effect(() => {
            setMatchCount(signals.searchMatchCount.value);
        });
        return () => {
            cleanup1();
            cleanup2();
            cleanup3();
        };
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const toggleSearch = () => {
        signals.isSearchOpen.value = !signals.isSearchOpen.value;
    };

    const handleInputChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        signals.searchQuery.value = value;
    };

    const clearSearch = () => {
        signals.searchQuery.value = '';
        inputRef.current?.focus();
    };

    const inputWidth = isOpen
        ? (isMobile ? 'min(16rem, calc(100vw - 160px))' : '16rem')
        : '0px';

    return (
        <div
            className={`absolute top-4 left-4 z-40 bg-surface border rounded-lg shadow-lg flex items-center p-2 transition-all duration-300 ease-in-out ${isOpen ? 'border-primary' : 'border-border-base'
                }`}
        >
            {/* Icon Wrapper */}
            <div
                className="flex items-center justify-center text-text-secondary cursor-pointer hover:text-text-primary transition-colors p-2"
                onClick={toggleSearch}
            >
                {IconSearch && <IconSearch size={20} />}
            </div>

            {/* Input Container */}
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out relative flex items-center"
                style={{ width: inputWidth, opacity: isOpen ? 1 : 0 }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onInput={handleInputChange}
                    className="bg-transparent border-none pl-2 pr-28 text-text-primary outline-none placeholder:text-text-secondary/50 w-64 h-9 py-0"
                />

                {/* Controls */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-auto pr-1">
                    {query.length > 0 && (
                        <>
                            <span className="text-xs text-text-secondary font-medium whitespace-nowrap">
                                {matchCount} found
                            </span>
                            <button
                                className="p-0.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-hover flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer"
                                title="Clear"
                                onClick={clearSearch}
                            >
                                <IconX size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
