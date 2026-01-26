/**
 * Tool Configuration Modal
 * Allows user to customize which tools appear in the toolbar vs the "More" menu.
 */
import { useState, useEffect } from 'preact/hooks';
// @ts-ignore
import { appState, signals, effect } from '@state/appState.js';
// @ts-ignore
import { TOOLS, DEFAULT_TOOL_CONFIG } from '@utils/toolRegistry.js';
import { IconX, IconArrowLeft, IconArrowRight, getIconComponent } from '../icons';

interface ToolConfigModalProps {
    onClose: () => void;
}

interface Tool {
    id: string;
    label: string;
    icon: string;
    type: string;
    description?: string;
}

interface ToolItemProps {
    toolId: string;
    isToolbar: boolean;
    onMove: (id: string, fromToolbar: boolean) => void;
}

function ToolItem({ toolId, isToolbar, onMove }: ToolItemProps) {
    const tool = TOOLS[toolId] as Tool | undefined;
    if (!tool) return null;

    const IconComp = getIconComponent(tool.icon);

    return (
        <div className="flex items-center justify-between p-3 mb-2 rounded shadow-sm group bg-surface border border-border-base hover:border-slate-400">
            <div className="flex items-center gap-3 text-text-secondary">
                {IconComp && <IconComp size={18} />}
                <span className="font-medium text-text-primary">{tool.label}</span>
            </div>
            <button
                className="p-1 rounded transition-colors text-text-secondary hover:text-accent hover:bg-surface-active cursor-pointer border-none bg-transparent"
                title={isToolbar ? "Move to More Menu" : "Move to Main Toolbar"}
                onClick={() => onMove(toolId, isToolbar)}
            >
                {isToolbar ? <IconArrowRight size={18} /> : <IconArrowLeft size={18} />}
            </button>
        </div>
    );
}

interface ToolListProps {
    title: string;
    items: string[];
    isToolbar: boolean;
    onMove: (id: string, fromToolbar: boolean) => void;
}

function ToolList({ title, items, isToolbar, onMove }: ToolListProps) {
    return (
        <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide text-text-secondary">
                {title}
            </h3>
            <div className="bg-canvas border border-border-base rounded-md p-2 flex-1 overflow-y-auto min-h-[250px]">
                {items.map((itemId) => (
                    <ToolItem
                        key={itemId}
                        toolId={itemId}
                        isToolbar={isToolbar}
                        onMove={onMove}
                    />
                ))}
            </div>
        </div>
    );
}

export function ToolConfigModal({ onClose }: ToolConfigModalProps) {
    const [toolbarItems, setToolbarItems] = useState<string[]>([...appState.toolConfig.toolbar]);
    const [moreItems, setMoreItems] = useState<string[]>([...appState.toolConfig.more]);

    const moveItem = (id: string, fromToolbar: boolean) => {
        if (fromToolbar) {
            setToolbarItems((prev) => prev.filter((i) => i !== id));
            setMoreItems((prev) => [...prev, id]);
        } else {
            setMoreItems((prev) => prev.filter((i) => i !== id));
            setToolbarItems((prev) => [...prev, id]);
        }
    };

    const handleReset = () => {
        setToolbarItems([...DEFAULT_TOOL_CONFIG.toolbar]);
        setMoreItems([...DEFAULT_TOOL_CONFIG.more]);
    };

    const handleSave = () => {
        appState.toolConfig = {
            toolbar: toolbarItems,
            more: moreItems
        };
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center backdrop-blur-[2px]"
            onClick={onClose}
        >
            <div
                className="bg-surface text-text-primary border border-border-base rounded-lg shadow-xl w-[600px] max-w-[90vw] overflow-hidden flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-border-base">
                    <h2 className="text-lg font-bold text-text-primary">Customize Toolbar</h2>
                    <button
                        className="text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0"
                        onClick={onClose}
                    >
                        <IconX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex gap-6 min-h-[300px] overflow-y-auto">
                    <ToolList
                        title="Main Toolbar"
                        items={toolbarItems}
                        isToolbar={true}
                        onMove={moveItem}
                    />
                    <ToolList
                        title="More Menu"
                        items={moreItems}
                        isToolbar={false}
                        onMove={moveItem}
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 flex justify-end gap-3 bg-surface-hover border-t border-border-base">
                    <button
                        className="px-4 py-2 font-medium rounded-md transition-colors bg-transparent border-none cursor-pointer text-red-500 hover:bg-red-500/10 mr-auto"
                        onClick={handleReset}
                    >
                        Reset to Defaults
                    </button>
                    <button
                        className="px-4 py-2 font-medium rounded-md transition-colors bg-transparent border-none cursor-pointer text-text-primary hover:bg-surface-active"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 font-medium rounded-md shadow-sm transition-colors border-none cursor-pointer bg-accent text-white hover:bg-[color-mix(in_srgb,var(--color-accent),black_10%)]"
                        onClick={handleSave}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
