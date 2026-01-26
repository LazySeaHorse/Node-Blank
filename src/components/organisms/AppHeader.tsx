import { useState, useEffect } from 'preact/hooks';
// @ts-ignore
import { signals, effect } from '@state/appState.js';
import { IconFolder, IconMenu } from '../icons';
import { ModeSelector } from './ModeSelector';
import { MoreToolsMenu } from './MoreToolsMenu';
import { ActionBar } from './ActionBar';
import { Dropdown } from '../molecules/Dropdown.js'; // Not used directly, but implicit via others

interface AppHeaderProps {
    onModeChange: (mode: string) => void;
    onUndo: () => void;
    onExport: (type: 'nodes' | 'single' | 'all') => void;
    onImport: (input: HTMLInputElement) => void;
    onSave: () => void;
    onImageUpload: (input: HTMLInputElement) => void;
    onVideoAdd: () => void;
    onClear: () => void;
    onCanvasManager: () => void;
}

export function AppHeader({
    onModeChange,
    onUndo,
    onExport,
    onImport,
    onSave,
    onImageUpload,
    onVideoAdd,
    onClear,
    onCanvasManager
}: AppHeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(signals.isSearchOpen.value);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Subscribe to global signal
    useEffect(() => {
        return effect(() => {
            setIsSearchOpen(signals.isSearchOpen.value);
        });
    }, []);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isSmushed = isMobile && isSearchOpen;

    const exitSearch = () => {
        signals.searchQuery.value = '';
        signals.isSearchOpen.value = false;
    };

    return (
        <div className="app-header absolute top-4 right-4 flex items-center gap-2 bg-surface p-2 rounded-lg border border-border-base shadow-lg z-30">
            {/* Smushed Toggle Button (Mobile Only, when Search Open) */}
            {isSmushed && (
                <button
                    className="flex items-center justify-center p-2 text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); exitSearch(); }}
                >
                    <IconMenu size={20} />
                </button>
            )}

            {/* Standard Controls (Hidden when Smushed) */}
            {!isSmushed && (
                <>
                    {/* Canvases Button */}
                    <button
                        className="flex items-center justify-center p-2 bg-transparent border-none text-text-secondary cursor-pointer rounded-md transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary active:bg-surface-active"
                        title="Canvases"
                        onClick={onCanvasManager}
                    >
                        <IconFolder size={20} />
                    </button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-border-base hidden md:block" />

                    {/* Mode Selector */}
                    <ModeSelector
                        onModeChange={onModeChange}
                        onImageUpload={onImageUpload}
                        onVideoAdd={onVideoAdd}
                    />

                    {/* More Tools Menu */}
                    <MoreToolsMenu
                        onModeChange={onModeChange}
                        onImageUpload={onImageUpload}
                        onVideoAdd={onVideoAdd}
                    />

                    {/* Divider */}
                    <div className="h-6 w-px bg-border-base hidden md:block" />

                    {/* Action Bar */}
                    <ActionBar
                        onUndo={onUndo}
                        onExport={onExport}
                        onImport={onImport}
                        onSave={onSave}
                        iconOnly={true}
                        className="[&>*:first-child]:hidden md:[&>*:first-child]:flex"
                    />
                </>
            )}
        </div>
    );
}
