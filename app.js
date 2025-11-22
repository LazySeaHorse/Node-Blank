/**
 * Main Application Entry Point
 * Orchestrates all components using Atomic Design Methodology
 */
import { appState, interaction } from './state/appState.js';
import { exportJSON, importJSON, exportAllCanvasesJSON, importAllCanvasesJSON, exportSelectedNodesJSON, importNodesJSON } from './utils/storage.js';
import { initDB, getAllCanvases, getCanvasData, saveCanvasData, createCanvas, deleteCanvas } from './utils/indexedDB.js';
import { createNode, renderNode, selectNode } from './utils/nodeFactory.js';
import { updateModeSelector } from './components/organisms/ModeSelector.js';
import { createAppHeader } from './components/organisms/AppHeader.js';
import { createCanvasWorld, setupCanvasEvents, updateTransform } from './components/organisms/CanvasWorld.js';
import { createZoomControl } from './components/molecules/ZoomControl.js';
import { createCanvasManager } from './components/organisms/CanvasManager.js';

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
        appContainer.className = 'h-screen w-screen overflow-hidden text-slate-800 flex flex-col font-sans';
        appContainer.style.height = '100vh';
        appContainer.style.width = '100vw';
        appContainer.style.overflow = 'hidden';
        appContainer.style.display = 'flex';
        appContainer.style.flexDirection = 'column';
        appContainer.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
        appContainer.style.color = '#334155';
        
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
            onReset: () => this.resetView(),
            initialZoom: Math.round(appState.scale * 100)
        });
        
        // Append to DOM
        appContainer.appendChild(container);
        container.appendChild(header);
        container.appendChild(zoomControl);
        
        // Setup events
        setupCanvasEvents(container, world);
        
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
        updateModeSelector(mode);
    }

    zoomIn() {
        appState.scale *= 1.2;
        updateTransform(this.world, this.container);
    }

    zoomOut() {
        appState.scale /= 1.2;
        updateTransform(this.world, this.container);
    }

    resetView() {
        appState.scale = 1;
        appState.pan = {x: 0, y: 0};
        updateTransform(this.world, this.container);
    }

    async manualSave() {
        await this.saveCurrentCanvas();
        const btn = document.activeElement;
        const originalText = btn.innerText;
        btn.innerText = "Saved!";
        setTimeout(() => btn.innerText = originalText, 1000);
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
        if(confirm("Clear entire canvas?")) {
            appState.fields = [];
            this.world.innerHTML = '';
            appState.pan = {x: 0, y: 0};
            appState.scale = 1;
            updateTransform(this.world, this.container);
            await this.saveCurrentCanvas();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new MathCanvasApp();
    app.init();
});
