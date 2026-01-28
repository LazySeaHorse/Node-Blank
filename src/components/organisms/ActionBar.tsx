import { useRef, useState } from 'preact/hooks';
import { ActionButton } from '../molecules/ActionButton';
import { Dropdown, DropdownMenuItem } from '../molecules/Dropdown';

interface ActionBarProps {
    onUndo: () => void;
    onExport: (type: 'nodes' | 'single' | 'all') => void;
    onImport: (input: HTMLInputElement) => void;
    onSave: () => void;
    iconOnly?: boolean;
    className?: string; // Allow styling overrides
}

export function ActionBar({ onUndo, onExport, onImport, onSave, iconOnly = false, className = '' }: ActionBarProps) {
    const importInputRef = useRef<HTMLInputElement>(null);
    const [dropdownState, setDropdownState] = useState<{
        type: 'export' | 'import';
        anchor: HTMLElement;
    } | null>(null);

    const closeDropdown = () => setDropdownState(null);

    const handleImportClick = (type: string) => {
        if (importInputRef.current) {
            importInputRef.current.dataset.importType = type;
            importInputRef.current.click();
        }
        closeDropdown();
    };

    const handleImportFileChange = (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            onImport(input);
        }
    };

    const getDropdownItems = (): DropdownMenuItem[] => {
        if (!dropdownState) return [];

        if (dropdownState.type === 'export') {
            return [
                { type: 'item', label: 'Selected Nodes', onClick: () => { onExport('nodes'); closeDropdown(); } },
                { type: 'item', label: 'Current Canvas', onClick: () => { onExport('single'); closeDropdown(); } },
                { type: 'item', label: 'All Canvases', onClick: () => { onExport('all'); closeDropdown(); } }
            ];
        }

        if (dropdownState.type === 'import') {
            return [
                { type: 'item', label: 'Append Nodes', onClick: () => handleImportClick('nodes') },
                { type: 'item', label: 'Single Canvas', onClick: () => handleImportClick('single') },
                { type: 'item', label: 'All Canvases', onClick: () => handleImportClick('all') }
            ];
        }

        return [];
    };

    return (
        <div className={`flex gap-1 ${className}`}>
            <ActionButton
                iconName="undo"
                label="Undo"
                onClick={onUndo}
                iconOnly={iconOnly}
            />

            <ActionButton
                iconName="upload"
                label="Export"
                onClick={(e) => setDropdownState({ type: 'export', anchor: e.currentTarget })}
                iconOnly={iconOnly}
            />

            <ActionButton
                iconName="download"
                label="Import"
                onClick={(e) => setDropdownState({ type: 'import', anchor: e.currentTarget })}
                iconOnly={iconOnly}
            >
                {/* Hidden Import Input nested here or outside, doesn't matter much but legacy appended it to btn */}
                <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    style={{ display: 'none' }}
                    onChange={handleImportFileChange}
                />
            </ActionButton>

            <ActionButton
                iconName="save"
                label="Save"
                onClick={onSave}
                iconOnly={iconOnly}
            />

            {dropdownState && (
                <Dropdown
                    items={getDropdownItems()}
                    anchorEl={dropdownState.anchor}
                    onClose={closeDropdown}
                />
            )}
        </div>
    );
}
