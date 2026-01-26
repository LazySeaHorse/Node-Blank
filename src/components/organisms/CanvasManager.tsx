/**
 * Canvas Manager Organism
 * UI for managing multiple canvases
 */
import { useState, useEffect } from 'preact/hooks';
import { JSX } from 'preact/jsx-runtime';
// @ts-ignore
import { getAllCanvases, deleteCanvas, renameCanvas } from '@utils/indexedDB.js';
import { IconX } from '../icons';

interface Canvas {
    id: string;
    name: string;
    lastModified: number;
}

interface CanvasManagerProps {
    onLoad: (id: string) => Promise<void>;
    onCreate: (name: string) => Promise<void>;
    onClose: () => void;
}

function formatDate(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return new Date(timestamp).toLocaleDateString();
}

interface ActionButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    variant: 'primary' | 'secondary' | 'danger';
}

function ActionBtn({ variant, children, className = '', ...props }: ActionButtonProps) {
    const baseClasses = 'px-3 py-1.5 bg-surface border border-current rounded-md text-[13px] font-medium cursor-pointer transition-all duration-200 hover:border-transparent';

    const variantClasses = {
        primary: 'text-primary border-primary hover:bg-primary hover:text-white',
        secondary: 'text-text-secondary border-border-base hover:bg-text-secondary hover:text-surface',
        danger: 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white'
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}

export function CanvasManager({ onLoad, onCreate, onClose }: CanvasManagerProps) {
    const [canvases, setCanvases] = useState<Canvas[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCanvases = async () => {
        setLoading(true);
        const data = await getAllCanvases();
        // Sort by last modified (newest first)
        data.sort((a: Canvas, b: Canvas) => b.lastModified - a.lastModified);
        setCanvases(data);
        setLoading(false);
    };

    useEffect(() => {
        loadCanvases();
    }, []);

    const handleCreate = async () => {
        const name = prompt('Canvas name:', 'Untitled Canvas');
        if (name) {
            await onCreate(name);
            onClose();
        }
    };

    const handleRename = async (canvas: Canvas) => {
        const newName = prompt('New name:', canvas.name);
        if (newName && newName !== canvas.name) {
            await renameCanvas(canvas.id, newName);
            await loadCanvases();
        }
    };

    const handleDelete = async (canvas: Canvas) => {
        if (confirm(`Delete "${canvas.name}"? This cannot be undone.`)) {
            await deleteCanvas(canvas.id);
            await loadCanvases();
        }
    };

    const handleLoad = async (canvas: Canvas) => {
        await onLoad(canvas.id);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[10000] bg-canvas/50 backdrop-blur-[2px]"
            onClick={onClose}
        >
            <div
                className="bg-surface text-text-primary shadow-2xl border border-border-base rounded-xl w-[90%] max-w-[600px] max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-border-base">
                    <h2 className="m-0 text-2xl font-semibold text-text-primary">My Canvases</h2>
                    <button
                        className="bg-transparent border-none text-3xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-colors text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                        onClick={onClose}
                    >
                        <IconX size={24} />
                    </button>
                </div>

                {/* New Canvas Button */}
                <button
                    className="mx-6 my-4 px-6 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-colors bg-accent text-white hover:bg-[color-mix(in_srgb,var(--color-accent),black_10%)]"
                    onClick={handleCreate}
                >
                    + New Canvas
                </button>

                {/* Canvas List */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {loading ? (
                        <div className="text-center py-12 px-6 text-text-secondary">Loading...</div>
                    ) : canvases.length === 0 ? (
                        <div className="text-center py-12 px-6 text-text-secondary">
                            No canvases yet. Create one to get started.
                        </div>
                    ) : (
                        canvases.map((canvas) => (
                            <div
                                key={canvas.id}
                                className="rounded-lg p-4 mb-3 border border-border-base transition-colors bg-surface-hover hover:border-slate-400"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-base font-medium text-text-primary">{canvas.name}</span>
                                    <span className="text-sm text-text-secondary">{formatDate(canvas.lastModified)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <ActionBtn variant="primary" onClick={() => handleLoad(canvas)}>Load</ActionBtn>
                                    <ActionBtn variant="secondary" onClick={() => handleRename(canvas)}>Rename</ActionBtn>
                                    <ActionBtn variant="danger" onClick={() => handleDelete(canvas)}>Delete</ActionBtn>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
