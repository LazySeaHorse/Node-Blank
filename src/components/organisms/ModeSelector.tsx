import { useRef, useState, useEffect } from 'preact/hooks';
import { ModeButton } from '../molecules/ModeButton';
// @ts-ignore
import { appState, signals, effect } from '@state/appState.ts';
// @ts-ignore
import { TOOLS } from '@utils/toolRegistry.ts';

interface ModeSelectorProps {
    onModeChange: (mode: string) => void;
    onImageUpload: (input: HTMLInputElement) => void;
    onVideoAdd: () => void;
}

export function ModeSelector({ onModeChange, onImageUpload, onVideoAdd }: ModeSelectorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [config, setConfig] = useState(signals.toolConfig.value);
    const [currentMode, setCurrentMode] = useState(signals.mode.value);

    // Subscribe to signals
    useEffect(() => {
        const cleanup1 = effect(() => {
            setConfig(signals.toolConfig.value);
        });
        const cleanup2 = effect(() => {
            setCurrentMode(signals.mode.value);
        });
        return () => {
            cleanup1();
            cleanup2();
        };
    }, []);

    const handleImageAction = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            onImageUpload(input);
        }
    };

    return (
        <div className="flex bg-canvas p-1 rounded-lg border border-border-base gap-1 hidden md:flex">
            {config.toolbar.map((toolId: string) => {
                const tool = TOOLS[toolId];
                if (!tool) return null;

                const isActive = tool.type === 'mode' && currentMode === tool.id;

                const handleClick = () => {
                    if (tool.type === 'mode') {
                        onModeChange(tool.id);
                    } else if (tool.type === 'action') {
                        if (toolId === 'image') handleImageAction();
                        if (toolId === 'video') onVideoAdd();
                    }
                };

                return (
                    <ModeButton
                        key={toolId}
                        id={`btn-tool-${toolId}`}
                        iconName={tool.icon}
                        label={tool.label}
                        isActive={isActive}
                        onClick={handleClick}
                    />
                );
            })}

            {/* Hidden Input for Images */}
            <input
                type="file"
                ref={fileInputRef}
                id="global-img-upload"
                accept="image/*"
                className="hidden"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );
}
