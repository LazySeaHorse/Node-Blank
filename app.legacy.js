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
import { createSearchOverlay } from './components/organisms/SearchOverlay.js';
import { animateTo } from './utils/cameraAnimation.js';
import { initComputeEngine } from './utils/computeEngine.js';

class MathCanvasApp {
    constructor() {
        this.world = null;
        this.container = null;
    }

    async init(targetElement) {
        // Initialize IndexedDB
        await initDB();

        // Initialize Compute Engine for Math+ nodes
        initComputeEngine().catch(err => console.warn('Compute Engine init failed:', err));

        // Load or create initial canvas
        await this.initializeCanvas();

        // Create main layout
        const appContainer = targetElement || document.getElementById('app');

        appContainer.className = 'h-screen w-screen overflow-hidden flex flex-col font-sans text-text-primary';

        appContainer.classList.add('h-[100dvh]');

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

        // Create Search Overlay
        const searchOverlay = createSearchOverlay();

        // Append to DOM
        appContainer.appendChild(container);
        container.appendChild(header);
        container.appendChild(searchOverlay); // Add search overlay
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

        // Effect 3: Search Logic (Filter & Zoom)
        effect(() => {
            const query = signals.searchQuery.value.toLowerCase().trim();
            const nodes = appState.fields;

            if (!nodes || nodes.length === 0) return;

            // 1. Filter Visuals
            const matchedIds = [];
            nodes.forEach(node => {
                const el = document.getElementById(node.id);
                if (!el) return;

                // Determine match
                // Simple text content check on the node data
                const content = (node.content || '').toLowerCase();
                const matches = query === '' || content.includes(query);

                if (matches) matchedIds.push(node.id);

                // Apply Visual Styles
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

            // Update Match Count Signal
            signals.searchMatchCount.value = matchedIds.length;

            if (query.length > 0 && matchedIds.length > 0) {
                // Calculate bounding box of matched nodes
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

                // Add padding
                const padding = 100;
                minX -= padding;
                minY -= padding;
                maxX += padding;
                maxY += padding;

                const width = maxX - minX;
                const height = maxY - minY;
                const cx = minX + width / 2;
                const cy = minY + height / 2;

                // Calculate target scale to fit
                const containerRect = this.container.getBoundingClientRect();
                const scaleX = containerRect.width / width;
                const scaleY = containerRect.height / height;
                let targetScale = Math.min(scaleX, scaleY);

                // Clamp scale
                targetScale = Math.min(Math.max(targetScale, 0.1), 2);

                // Calculate Pan to center (cx, cy)
                // Viewport Center = pan + worldPoint * scale
                // pan = Viewport Center - worldPoint * scale
                const targetPan = {
                    x: (containerRect.width / 2) - (cx * targetScale),
                    y: (containerRect.height / 2) - (cy * targetScale)
                };

                animateTo(targetScale, targetPan, 1000);
            } else if (query.length > 0 && matchedIds.length === 0) {
                // No matches? Maybe don't move? Or zoom out to show emptiness?
                // Let's stay put.
            }
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
export { MathCanvasApp }; // Export the class
