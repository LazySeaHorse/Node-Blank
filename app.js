/**
 * Main Application Entry Point
 * Orchestrates all components using Atomic Design Methodology
 */
import { appState, interaction, effect, signals, computedValues, screenToWorld } from './state/appState.js';
import { exportJSON, importJSON, exportAllCanvasesJSON, importAllCanvasesJSON, exportSelectedNodesJSON, importNodesJSON } from './utils/storage.js';
import { initDB, getAllCanvases, getCanvasData, saveCanvasData, createCanvas, deleteCanvas } from './utils/indexedDB.js';
import { createNode, renderNode, selectNode } from './utils/nodeFactory.js';
import { updateModeSelector } from './components/organisms/ModeSelector.js';
import { createAppHeader } from './components/organisms/AppHeader.js';
import { createCanvasWorld, setupCanvasEvents, updateTransform } from './components/organisms/CanvasWorld.js';
import { createZoomControl } from './components/molecules/ZoomControl.js';
import { createCanvasManager } from './components/organisms/CanvasManager.js';
import { createThemeToggle } from './components/molecules/ThemeToggle.js';
import { animateTo } from './utils/cameraAnimation.js';

class MathCanvasApp {
    constructor() {
        this.world = null;
        this.container = null;
    }

    async init() {
        // Initialize IndexedDB
        await initDB();

        // Load or create initial canvas
        await this.initializeCanvas();

        // Create main layout
        const appContainer = document.getElementById('app');
        // Legacy: 'h-screen w-screen overflow-hidden text-slate-800 flex flex-col font-sans' is mostly correct but needs specific values from variables
        // We set most things via Tailwind classes now.
        // appContainer.style... lines are removed in favor of classes.
        // text-slate-800 -> text-text-primary (mapped to slate-800)
        // font-sans -> font-sans
        appContainer.className = 'h-screen w-screen overflow-hidden flex flex-col font-sans text-text-primary';

        // Explicit styles removed as they are covered by classes:
        // appContainer.style.height = '100dvh'; -> h-screen (or h-[100dvh] if needed, tailwind h-screen is usually 100vh. 100dvh is better for mobile)
        // Let's use arbitrary value for exact match if needed or just h-screen.
        // For mobile, we often want 100dvh.
        appContainer.classList.add('h-[100dvh]');

        // color: var(--color-slate-700) -> text-slate-700 in original code vs text-text-primary (slate-800)
        // The original code had `appContainer.className = ... text-slate-800` BUT `appContainer.style.color = 'var(--color-slate-700)'`.
        // The style overrides the class. Let's use text-text-primary which is defined as slate-800 in light mode variables.css, 
        // OR text-text-secondary for 700? 
        // Variables.css: text-primary is slate-800. text-secondary is slate-500. 
        // The detailed code in app.js line 38 used `var(--color-slate-700)`.
        // Let's stick to text-text-primary (slate-800) as per the class name intent, or text-slate-700 if strictly preserving.
        // Tailwind config maps text-primary to var(--text-primary) which is slate-800.
        // Let's allow it to be text-text-primary for consistency with the design system variables.

        // Create header
        const header = createAppHeader({
            onModeChange: (mode) => this.setMode(mode),
            onUndo: () => document.execCommand('undo'),
            onExport: (type) => this.handleExport(type),
            onImport: (input) => this.handleImport(input),
            onSave: () => this.manualSave(),
            onImageUpload: (input) => this.addImage(input),
            onVideoAdd: () => this.addVideo(),
            onClear: () => this.clearCanvas(),
            onCanvasManager: () => this.openCanvasManager()
        });

        // Create canvas
        const { container, world, selectionRect } = createCanvasWorld();
        this.container = container;
        this.world = world;
        this.selectionRect = selectionRect;

        // Create zoom controls
        const zoomControl = createZoomControl({
            onZoomIn: () => this.zoomIn(),
            onZoomOut: () => this.zoomOut(),
            onZoomReset: () => this.resetZoomOnly(),
            onFullReset: () => this.resetView(),
            initialZoom: Math.round(appState.scale * 100)
        });

        // Create theme toggle
        const themeToggle = createThemeToggle();

        // Create wrapper for bottom-right controls
        const controlsWrapper = document.createElement('div');
        controlsWrapper.style.position = 'absolute';
        controlsWrapper.style.bottom = 'calc(1.25rem + env(safe-area-inset-bottom))';
        controlsWrapper.style.right = '1.25rem';
        controlsWrapper.style.display = 'flex';
        controlsWrapper.style.flexDirection = 'column';
        controlsWrapper.style.alignItems = 'flex-end';
        controlsWrapper.style.zIndex = '30';
        controlsWrapper.style.pointerEvents = 'none'; // Allow clicking through spacing

        controlsWrapper.appendChild(themeToggle);
        controlsWrapper.appendChild(zoomControl);

        // Append to DOM
        appContainer.appendChild(container);
        container.appendChild(header);
        container.appendChild(controlsWrapper);

        // Setup events
        setupCanvasEvents(container, world);

        // ========== REACTIVE EFFECTS - Auto-update UI when state changes ==========

        // Effect 1: Transform updates (scale/pan changes)
        effect(() => {
            const transform = computedValues.transform.value;
            if (this.world && this.container) {
                updateTransform(this.world, this.container);
            }
        });

        // Effect 2: Mode selector updates
        effect(() => {
            const mode = signals.mode.value;
            updateModeSelector(mode);
        });

        // Render nodes from loaded canvas
        appState.fields.forEach(f => renderNode(f, world, selectNode));

        // Update transform
        updateTransform(world, container);

        // Auto-save every minute
        setInterval(() => this.saveCurrentCanvas(), 60000);
    }

    async initializeCanvas() {
        const canvases = await getAllCanvases();

        if (canvases.length === 0) {
            // First time - create default canvas
            const id = await createCanvas('Untitled Canvas');
            await this.loadCanvas(id);
        } else {
            // Load most recently modified canvas
            const latest = canvases.sort((a, b) => b.lastModified - a.lastModified)[0];
            await this.loadCanvas(latest.id);
        }
    }

    async loadCanvas(canvasId) {
        const data = await getCanvasData(canvasId);
        if (!data) return;

        // Update app state
        appState.currentCanvasId = canvasId;
        appState.pan = data.pan;
        appState.scale = data.scale;
        appState.fields = data.fields;
        appState.zIndexCounter = data.zIndexCounter;

        // Get canvas name
        const canvases = await getAllCanvases();
        const canvas = canvases.find(c => c.id === canvasId);
        if (canvas) {
            appState.currentCanvasName = canvas.name;
        }

        // Clear and re-render
        if (this.world) {
            this.world.innerHTML = '';
            appState.fields.forEach(f => renderNode(f, this.world, selectNode));
            updateTransform(this.world, this.container);
        }
    }

    async saveCurrentCanvas() {
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
    }

    async createNewCanvas(name) {
        // Save current canvas first
        await this.saveCurrentCanvas();

        // Create and load new canvas
        const id = await createCanvas(name);
        await this.loadCanvas(id);
    }

    openCanvasManager() {
        const manager = createCanvasManager({
            onLoad: async (id) => {
                await this.saveCurrentCanvas();
                await this.loadCanvas(id);
            },
            onCreate: async (name) => {
                await this.createNewCanvas(name);
            },
            onClose: () => {
                document.body.removeChild(manager);
            }
        });

        document.body.appendChild(manager);
    }

    handleExport(type) {
        if (type === 'nodes') {
            exportSelectedNodesJSON(interaction.selectedIds);
        } else if (type === 'single') {
            exportJSON();
        } else if (type === 'all') {
            exportAllCanvasesJSON();
        }
    }

    handleImport(input) {
        const importType = input.dataset.importType;
        console.log('Import type:', importType, 'File:', input.files[0]);

        if (importType === 'nodes') {
            importNodesJSON(input.files[0], (importedNodes) => {
                console.log('Importing nodes:', importedNodes);
                // Append nodes to current canvas
                appState.fields.push(...importedNodes);

                // Render the imported nodes
                importedNodes.forEach(node => {
                    renderNode(node, this.world, selectNode);
                });

                // Select the imported nodes
                selectNode(null);
                importedNodes.forEach(node => selectNode(node.id, true));

                console.log(`Imported ${importedNodes.length} node(s)`);
            });
        } else if (importType === 'single') {
            importJSON(input.files[0], async (data) => {
                // Create new canvas with imported data
                const name = data.canvasName || 'Imported Canvas';
                const id = await createCanvas(name);

                // Save imported data
                await saveCanvasData(id, {
                    pan: data.pan,
                    scale: data.scale,
                    fields: data.fields,
                    zIndexCounter: data.zIndexCounter
                });

                // Load the imported canvas
                await this.loadCanvas(id);
            });
        } else if (importType === 'all') {
            importAllCanvasesJSON(input.files[0], async () => {
                // Refresh canvas manager if open
                // For now, just show success message
                console.log('All canvases imported successfully');
            });
        }

        input.value = '';
    }

    setMode(mode) {
        appState.mode = mode;
        //updateModeSelector(mode);
    }

    zoomIn() {
        appState.scale *= 1.2;
        //updateTransform(this.world, this.container);
    }

    zoomOut() {
        appState.scale /= 1.2;
        //updateTransform(this.world, this.container);
    }

    resetZoomOnly() {
        if (!this.container) return;

        // 1. Get center of viewport
        const rect = this.container.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        // 2. Get world coordinates of center
        const centerWorld = screenToWorld(cx, cy);

        // 3. Reset Scale
        const targetScale = 1;

        // 4. Adjust Pan to keep centerWorld at centerScreen
        // cx = pan.x + centerWorld.x * scale
        const targetPan = {
            x: cx - centerWorld.x * targetScale,
            y: cy - centerWorld.y * targetScale
        };

        // Animate
        animateTo(targetScale, targetPan);
    }

    resetView() {
        animateTo(1, { x: 0, y: 0 });
    }

    async manualSave() {
        await this.saveCurrentCanvas();
        const btn = document.activeElement;

        // Don't interfere if it's not a button or doesn't have children (unexpected state)
        if (!btn || btn.tagName !== 'BUTTON') return;

        // Save original HTML content (including the SVG icon)
        const originalContent = btn.innerHTML;

        // Show "Saved!" message
        btn.textContent = "Saved!";

        // Restore original content (Icon + Tooltip/Label)
        setTimeout(() => {
            btn.innerHTML = originalContent;
        }, 1000);
    }

    addImage(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            // Load image to get natural dimensions
            const img = new Image();
            img.onload = () => {
                const cx = -appState.pan.x / appState.scale + 100;
                const cy = -appState.pan.y / appState.scale + 100;

                // Calculate dimensions (max 800px on longest side)
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

                const nodeData = createNode(cx, cy, 'image', e.target.result);
                nodeData.width = width;
                nodeData.height = height;
                renderNode(nodeData, this.world, selectNode);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        input.value = '';
    }

    addVideo() {
        const url = prompt('Enter video URL:\n\n• YouTube: youtube.com/watch?v=...\n• Vimeo: vimeo.com/...\n• Or paste embed code');
        if (!url || url.trim() === '') return;

        const cx = -appState.pan.x / appState.scale + 100;
        const cy = -appState.pan.y / appState.scale + 100;
        const nodeData = createNode(cx, cy, 'video', url.trim());
        renderNode(nodeData, this.world, selectNode);
    }

    async clearCanvas() {
        if (confirm("Clear entire canvas?")) {
            appState.fields = [];
            this.world.innerHTML = '';
            appState.pan = { x: 0, y: 0 };
            appState.scale = 1;
            //updateTransform(this.world, this.container);
            await this.saveCurrentCanvas();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new MathCanvasApp();
    app.init();
});
