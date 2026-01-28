/**
 * Root Application Component
 * 
 * Replaces the legacy MathCanvasApp class.
 * Orchestrates the application shell using Preact while wrapping legacy DOM components.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { appState, signals, interaction, effect, computedValues, screenToWorld } from '@state/appState';
import { initDB, getAllCanvases, getCanvasData, saveCanvasData, createCanvas, deleteCanvas, renameCanvas } from '@utils/indexedDB';
import { ModeSelector } from './components/organisms/ModeSelector';
import { AppHeader } from './components/organisms/AppHeader';
import { createCanvasWorld, setupCanvasEvents, updateTransform } from './components/organisms/CanvasWorld';
import { ZoomControl } from './components/molecules/ZoomControl';
import { CanvasManager } from './components/organisms/CanvasManager';
import { ThemeToggle } from './components/molecules/ThemeToggle';
import { SearchOverlay } from './components/organisms/SearchOverlay';
import { animateTo } from '@utils/cameraAnimation';
import { initComputeEngine } from '@utils/computeEngine';
import { createNode, renderNode, selectNode } from '@nodes/nodeFactory';
import { exportJSON, importJSON, exportAllCanvasesJSON, importAllCanvasesJSON, exportSelectedNodesJSON, importNodesJSON } from '@utils/storage';

declare global {
    interface Window {
        nodeBlankApp: any;
    }
}

export function App() {
    const rootRef = useRef<HTMLDivElement>(null);
    const legacyContainerRef = useRef<HTMLDivElement>(null);
    const worldRef = useRef<{ container: HTMLElement | null; world: HTMLElement | null }>({ container: null, world: null });
    const [showCanvasManager, setShowCanvasManager] = useState(false);

    // ============================================================================
    // ACTIONS (Ported from MathCanvasApp methods)
    // ============================================================================

    const setMode = (mode: string) => {
        appState.mode = mode;
        // updateModeSelector is handled by effect
    };

    const zoomIn = () => {
        appState.scale *= 1.2;
    };

    const zoomOut = () => {
        appState.scale /= 1.2;
    };

    const resetZoomOnly = () => {
        const { container } = worldRef.current;
        if (!container) return;

        // 1. Get center of viewport
        const rect = container.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        // 2. Get world coordinates of center
        const centerWorld = screenToWorld(cx, cy);

        // 3. Reset Scale
        const targetScale = 1;

        // 4. Adjust Pan to keep centerWorld at centerScreen
        const targetPan = {
            x: cx - centerWorld.x * targetScale,
            y: cy - centerWorld.y * targetScale
        };

        animateTo(targetScale, targetPan);
    };

    const resetView = () => {
        animateTo(1, { x: 0, y: 0 });
    };

    const saveCurrentCanvas = async () => {
        if (!appState.currentCanvasId) return;
        try {
            await saveCanvasData(appState.currentCanvasId, {
                pan: appState.pan,
                scale: appState.scale,
                fields: appState.fields,
                zIndexCounter: appState.zIndexCounter
            });
        } catch (error) {
            console.error('Failed to save canvas:', error);
        }
    };

    const loadCanvas = async (canvasId: string) => {
        const data = await getCanvasData(canvasId);
        if (!data) return;

        appState.currentCanvasId = canvasId;
        appState.pan = data.pan;
        appState.scale = data.scale;
        appState.fields = data.fields;
        appState.zIndexCounter = data.zIndexCounter;

        const canvases = await getAllCanvases();
        const canvas = canvases.find(c => c.id === canvasId);
        if (canvas) {
            appState.currentCanvasName = canvas.name;
        }

        // Clear and re-render
        const { world, container } = worldRef.current;
        if (world) {
            world.innerHTML = '';
            appState.fields.forEach(f => renderNode(f, world, selectNode));
            updateTransform(world, container);
        }
    };

    const createNewCanvas = async (name: string) => {
        await saveCurrentCanvas();
        const id = await createCanvas(name);
        await loadCanvas(id);
    };

    const manualSave = async () => {
        await saveCurrentCanvas();
        const btn = document.activeElement;
        if (!btn || btn.tagName !== 'BUTTON') return;

        const originalContent = btn.innerHTML;
        btn.textContent = "Saved!";
        setTimeout(() => {
            btn.innerHTML = originalContent;
        }, 1000);
    };

    const addImage = (input: HTMLInputElement) => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const cx = -appState.pan.x / appState.scale + 100;
                const cy = -appState.pan.y / appState.scale + 100;
                const maxSize = 800;
                let width = img.naturalWidth;
                let height = img.naturalHeight;

                if (width > maxSize || height > maxSize) {
                    const ratio = width / height;
                    if (width > height) {
                        width = maxSize;
                        height = maxSize / ratio;
                    } else {
                        height = maxSize;
                        width = maxSize * ratio;
                    }
                }

                const nodeData = createNode(cx, cy, 'image', e.target.result as string);
                nodeData.width = width;
                nodeData.height = height;
                const { world } = worldRef.current;
                renderNode(nodeData, world, selectNode);
            };
            img.src = e.target.result as string;
        };
        reader.readAsDataURL(file);
        input.value = '';
    };

    const addVideo = () => {
        const url = prompt('Enter video URL:\n\n• YouTube: youtube.com/watch?v=...\n• Vimeo: vimeo.com/...\n• Or paste embed code');
        if (!url || url.trim() === '') return;

        const cx = -appState.pan.x / appState.scale + 100;
        const cy = -appState.pan.y / appState.scale + 100;
        const nodeData = createNode(cx, cy, 'video', url.trim());
        const { world } = worldRef.current;
        renderNode(nodeData, world, selectNode);
    };

    const clearCanvas = async () => {
        if (confirm("Clear entire canvas?")) {
            appState.fields = [];
            const { world } = worldRef.current;
            world.innerHTML = '';
            appState.pan = { x: 0, y: 0 };
            appState.scale = 1;
            await saveCurrentCanvas();
        }
    };

    const handleExport = (type: string) => {
        if (type === 'nodes') exportSelectedNodesJSON(interaction.selectedIds);
        else if (type === 'single') exportJSON();
        else if (type === 'all') exportAllCanvasesJSON();
    };

    const handleImport = (input: HTMLInputElement) => {
        const importType = input.dataset.importType;
        const { world } = worldRef.current;

        if (importType === 'nodes') {
            importNodesJSON(input.files[0], (importedNodes) => {
                appState.fields.push(...importedNodes);
                importedNodes.forEach(node => renderNode(node, world, selectNode));
                selectNode(null);
                importedNodes.forEach(node => selectNode(node.id, true));
            });
        } else if (importType === 'single') {
            importJSON(input.files[0], async (data) => {
                const name = data.canvasName || 'Imported Canvas';
                const id = await createCanvas(name);
                await saveCanvasData(id, {
                    pan: data.pan,
                    scale: data.scale,
                    fields: data.fields,
                    zIndexCounter: data.zIndexCounter
                });
                await loadCanvas(id);
            });
        } else if (importType === 'all') {
            importAllCanvasesJSON(input.files[0], async () => {
                console.log('All canvases imported successfully');
            });
        }
        input.value = '';
    };

    const openCanvasManager = () => {
        setShowCanvasManager(true);
    };

    const closeCanvasManager = () => {
        setShowCanvasManager(false);
    };

    // ============================================================================
    // INITIALIZATION & EFFECTS
    // ============================================================================

    useEffect(() => {
        // Init Singletons
        initDB().then(async () => {
            // Load or find initial canvas
            const canvases = await getAllCanvases();
            if (canvases.length === 0) {
                const id = await createCanvas('Untitled Canvas');
                await loadCanvas(id);
            } else {
                const latest = canvases.sort((a, b) => b.lastModified - a.lastModified)[0];
                await loadCanvas(latest.id);
            }
        });

        initComputeEngine().catch(err => console.warn('Compute Engine init failed:', err));

        const appContainer = rootRef.current;
        if (!appContainer) return;

        // 1. Create Canvas World
        const { container, world, selectionRect } = createCanvasWorld();
        worldRef.current = { container, world };

        // 2. Append to Legacy Container Ref
        if (legacyContainerRef.current) {
            legacyContainerRef.current.appendChild(container); // Append wrapper
        }

        // 3. Setup Events (Search Overlay is now rendered in JSX)
        setupCanvasEvents(container, world);

        // 7. Initialize Auto-Save
        const saveInterval = setInterval(saveCurrentCanvas, 60000);

        // 8. Register global app for debugging
        window.nodeBlankApp = {
            manualSave,
            loadCanvas
        };

        // --- Reactive Effects Cleanup Map ---
        const cleanups = [];

        // Effect 1: Transform updates
        cleanups.push(effect(() => {
            const transform = computedValues.transform.value;
            if (world && container) {
                updateTransform(world, container); // Use local vars
            }
        }));

        // Effect 2: Mode selector updates
        // Mode selector updates are handled automatically by the ModeSelector component

        // Effect 3: Search Logic
        cleanups.push(effect(() => {
            const query = signals.searchQuery.value.toLowerCase().trim();
            const nodes = appState.fields;
            if (!nodes || nodes.length === 0) return;

            const matchedIds = [];
            nodes.forEach(node => {
                const el = document.getElementById(node.id);
                if (!el) return;

                const content = (node.content || '').toLowerCase();
                const matches = query === '' || content.includes(query);
                if (matches) matchedIds.push(node.id);

                if (query === '') {
                    el.style.opacity = '1';
                    el.style.filter = 'none';
                } else {
                    if (matches) {
                        el.style.opacity = '1';
                        el.style.filter = 'none';
                        el.style.zIndex = '100';
                    } else {
                        el.style.opacity = '0.4';
                        el.style.filter = 'grayscale(100%)';
                        el.style.zIndex = '1';
                    }
                }
            });

            signals.searchMatchCount.value = matchedIds.length;

            if (query.length > 0 && matchedIds.length > 0) {
                // Get container from worldRef
                const { container } = worldRef.current;
                if (!container) return;

                // ... (Bounding Box Calc & Animation Logic from app.js)
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                matchedIds.forEach(id => {
                    const node = nodes.find(n => n.id === id);
                    const el = document.getElementById(id);
                    if (!node || !el) return;
                    const elRect = el.getBoundingClientRect();
                    const w = elRect.width / appState.scale;
                    const h = elRect.height / appState.scale;
                    minX = Math.min(minX, node.x);
                    minY = Math.min(minY, node.y);
                    maxX = Math.max(maxX, node.x + w);
                    maxY = Math.max(maxY, node.y + h);
                });

                const padding = 100;
                minX -= padding;
                minY -= padding;
                maxX += padding;
                maxY += padding;
                const width = maxX - minX;
                const height = maxY - minY;
                const cx = minX + width / 2;
                const cy = minY + height / 2;

                const containerRect = container.getBoundingClientRect();
                const scaleX = containerRect.width / width;
                const scaleY = containerRect.height / height;
                let targetScale = Math.min(scaleX, scaleY);
                targetScale = Math.min(Math.max(targetScale, 0.1), 2);

                const targetPan = {
                    x: (containerRect.width / 2) - (cx * targetScale),
                    y: (containerRect.height / 2) - (cy * targetScale)
                };
                animateTo(targetScale, targetPan, 1000);
            }
        }));

        // Cleanup
        return () => {
            clearInterval(saveInterval);
            cleanups.forEach(fn => fn());
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        };
    }, []);

    return (
        <div
            ref={rootRef}
            className="flex flex-col h-screen w-screen overflow-hidden font-sans text-text-primary h-[100dvh]"
        >
            {/* Legacy Canvas Container */}
            <div ref={legacyContainerRef} className="absolute inset-0 z-0" />

            {/* Search Overlay */}
            <SearchOverlay />

            {/* React UI Shell */}
            <AppHeader
                onModeChange={setMode}
                onUndo={() => document.execCommand('undo')}
                onExport={handleExport}
                onImport={handleImport}
                onSave={manualSave}
                onImageUpload={addImage}
                onVideoAdd={addVideo}
                onClear={clearCanvas}
                onCanvasManager={openCanvasManager}
            />

            <div className="absolute bottom-5 right-5 flex flex-col items-end z-30 pointer-events-none gap-3">
                <ThemeToggle />
                <ZoomControl
                    onZoomIn={zoomIn}
                    onZoomOut={zoomOut}
                    onZoomReset={resetZoomOnly}
                    onFullReset={resetView}
                    initialZoom={Math.round(appState.scale * 100)}
                />
            </div>

            {/* Canvas Manager Modal */}
            {showCanvasManager && (
                <CanvasManager
                    onLoad={async (id) => {
                        await saveCurrentCanvas();
                        await loadCanvas(id);
                    }}
                    onCreate={async (name) => {
                        await createNewCanvas(name);
                    }}
                    onClose={closeCanvasManager}
                />
            )}
        </div>
    );
}
