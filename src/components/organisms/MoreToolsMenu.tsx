import { useState, useEffect } from 'preact/hooks';
// @ts-ignore
import { appState, signals, effect } from '@state/appState.ts';
// @ts-ignore
import { TOOLS } from '@utils/toolRegistry.ts';
import { Dropdown, DropdownMenuItem } from '../molecules/Dropdown';
import { IconMoreHorizontal, getIconComponent, IconSettings } from '../icons';
import { ToolConfigModal } from './ToolConfigModal';

interface MoreToolsMenuProps {
    onModeChange: (mode: string) => void;
    onImageUpload: (input?: any) => void;
    onVideoAdd: () => void;
}

export function MoreToolsMenu({ onModeChange, onImageUpload, onVideoAdd }: MoreToolsMenuProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [config, setConfig] = useState(signals.toolConfig.value);

    // Subscribe to toolConfig changes
    useEffect(() => {
        return effect(() => {
            setConfig(signals.toolConfig.value);
        });
    }, []);

    const items: DropdownMenuItem[] = config.more.map((toolId: string) => {
        const tool = TOOLS[toolId];
        if (!tool) return null;

        const IconComp = getIconComponent(tool.icon);

        return {
            type: 'item',
            label: tool.label,
            icon: IconComp ? <IconComp size={16} /> : undefined,
            onClick: () => {
                if (tool.type === 'mode') {
                    onModeChange(tool.id);
                } else if (tool.type === 'action') {
                    if (toolId === 'image') onImageUpload();
                    if (toolId === 'video') onVideoAdd();
                }
            }
        };
    }).filter(Boolean) as DropdownMenuItem[];

    // Add Separator and Configure
    if (items.length > 0) {
        items.push({ type: 'separator' });
    }

    items.push({
        type: 'item',
        label: 'Configure Toolbar...',
        icon: <IconSettings size={16} />,
        onClick: () => {
            setAnchorEl(null); // Close dropdown first
            setShowConfigModal(true);
        }
    });

    return (
        <>
            <div className="ml-1 relative hidden md:block">
                <button
                    className="p-2 rounded-md transition-colors border-none bg-transparent cursor-pointer text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    title="More Tools"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                    <IconMoreHorizontal size={20} />
                </button>

                {anchorEl && (
                    <Dropdown
                        items={items}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                    />
                )}
            </div>

            {showConfigModal && (
                <ToolConfigModal onClose={() => setShowConfigModal(false)} />
            )}
        </>
    );
}

