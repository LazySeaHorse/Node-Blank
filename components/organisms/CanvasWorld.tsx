/**
 * Canvas World Organism
 */
import * as d3 from 'd3';
import { appState, interaction, screenToWorld, signals } from '../../state/appState.js';
import { createNode, renderNode, removeNode, selectNode } from '../../utils/nodeFactory.tsx';
import { cancelAnimation } from '../../utils/cameraAnimation.js';

function updateSelectionFromRect(left, top, width, height, container) {
    const rect = container.getBoundingClientRect();

    // Convert screen rect to world coordinates
    const worldLeft = (left - appState.pan.x) / appState.scale;
    const worldTop = (top - appState.pan.y) / appState.scale;
    const worldRight = ((left + width) - appState.pan.x) / appState.scale;
    const worldBottom = ((top + height) - appState.pan.y) / appState.scale;

    // Clear current selection
    selectNode(null);

    // Check each node for intersection
    appState.fields.forEach(field => {
        const nodeEl = document.getElementById(field.id);
        if (!nodeEl) return;

        const nodeRect = nodeEl.getBoundingClientRect();
        const nodeWorldLeft = field.x;
        const nodeWorldTop = field.y;
        const nodeWorldRight = field.x + (nodeRect.width / appState.scale);
        const nodeWorldBottom = field.y + (nodeRect.height / appState.scale);

        // Check if rectangles intersect
        const intersects = !(worldRight < nodeWorldLeft ||
            worldLeft > nodeWorldRight ||
            worldBottom < nodeWorldTop ||
            worldTop > nodeWorldBottom);

        if (intersects) {
            selectNode(field.id, true); // true = add to selection
        }
    });
}

export function createCanvasWorld() {
    const container = document.createElement('main');
    container.id = 'canvas-container';
    container.className = 'flex-1 relative overflow-hidden w-full h-full bg-canvas touch-none';

    // Restore grid pattern
    container.style.backgroundImage = `
        linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
        linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
    `;

    const world = document.createElement('div');
    world.id = 'canvas-world';
    world.className = 'absolute top-0 left-0 w-full h-full origin-top-left will-change-transform';

    // Selection rectangle
    const selectionRect = document.createElement('div');
    selectionRect.id = 'selection-rect';
    selectionRect.className = 'absolute border-2 border-accent bg-accent/10 pointer-events-none hidden z-[10000]';

    container.appendChild(world);
    container.appendChild(selectionRect);

    return { container, world, selectionRect };
}

export function updateTransform(world, container) {
    const { pan, scale } = appState; // Using getter from appState object for convenience
    // Or access signals directly if needed, but appState getter is fine.

    // 1. Update Visuals
    world.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;

    // Grid Updates
    const s = 40 * scale;
    container.style.backgroundSize = `${s}px ${s}px`;
    container.style.backgroundPosition = `${pan.x}px ${pan.y}px`;

    // Update Zoom Indicator
    const percent = Math.round(scale * 100);
    const indicator = document.getElementById('zoom-indicator');
    if (indicator) indicator.innerText = percent + '%';

    // 2. Sync D3 State (if mismatch)
    // This handles external updates (like animateTo or Reset Zoom)
    if (container.__zoomBehavior) {
        const current = d3.zoomTransform(container);
        // We use a small epsilon to avoid floating point loops
        if (Math.abs(current.k - scale) > 0.001 ||
            Math.abs(current.x - pan.x) > 0.1 ||
            Math.abs(current.y - pan.y) > 0.1) {

            d3.select(container).call(container.__zoomBehavior.transform, new d3.ZoomTransform(scale, pan.x, pan.y));
        }
    }
}

export function setupCanvasEvents(container, world) {
    const selectionRect = document.getElementById('selection-rect');

    // --- 1. D3 Zoom Setup ---
    // --- 1. D3 Zoom Setup ---
    const zoom = d3.zoom()
        .scaleExtent([0.1, 5])
        .filter((e) => {
            // 1. Zoom with Wheel
            if (e.type === 'wheel') return true;

            // 2. Touch Handling (Pan / Pinch)
            // Explicitly ALLOW touch pointer events
            if (e.pointerType === 'touch' || e.type === 'touchstart') return true;

            // 3. Mouse Handling: ALLOW Middle Click (1) -> Pan ALWAYS
            if (e.button === 1) return true;

            // 4. Prevent Zoom/Pan with other buttons when interacting with Nodes, Handles, or Context Menus
            if (e.target.closest('.node') || e.target.closest('.resize-handle') || e.target.closest('.jcontextmenu')) return false;

            // 5. BLOCK Left Click (0) -> Reserved for Selection
            if (e.button === 0) return false;

            // Default: strict middle mouse for pan (or touch)
            return false;
        })
        .on('start', (e) => {
            document.body.classList.add('canvas-interacting');
            // Optional: cursor changes
            if (e.sourceEvent && (e.sourceEvent.type === 'mousedown' || e.sourceEvent.type === 'pointerdown')) {
                container.style.cursor = 'grabbing';
            }
        })
        .on('zoom', (e) => {
            // Update App State (Batch for performance)
            // e.transform contains {k, x, y}
            const t = e.transform;

            appState.scale = t.k;
            appState.pan = { x: t.x, y: t.y };
        })
        .on('end', () => {
            document.body.classList.remove('canvas-interacting');
            container.style.cursor = 'crosshair'; // Logic from original
        });

    // Attach zoom behavior to container
    const selection = d3.select(container).call(zoom);
    container.__zoomBehavior = zoom; // Save for updateTransform (DO NOT use __zoom, it's reserved by D3)

    // Disable double-click to zoom (conflicts with double-click to create node)
    selection.on("dblclick.zoom", null);


    // --- 2. Custom Interaction (Selection, Node Drag, Resize) ---
    // We kept these manual because they involve specific node logic

    container.addEventListener('mousedown', (e) => {
        cancelAnimation();

        // 1. Resize Handle
        if (e.target.classList.contains('resize-handle')) {
            e.preventDefault();
            e.stopPropagation();
            const nodeId = e.target.dataset.nodeId;
            const nodeData = appState.fields.find(f => f.id === nodeId);
            if (nodeData) {
                document.body.classList.add('canvas-interacting');
                interaction.isResizingNode = true;
                interaction.resizeNodeId = nodeId;
                interaction.startPos = { x: e.clientX, y: e.clientY };
                interaction.resizeStartSize = {
                    width: nodeData.width || 300,
                    height: nodeData.height || 300
                };
                interaction.aspectRatio = interaction.resizeStartSize.width / interaction.resizeStartSize.height;
            }
            return;
        }

        // 2. Selection Rectangle (Left Click on background)
        // D3 Zoom filter returns false for button 0, so D3 ignores this. We handle it here.
        // We also check for pointerType='touch' to strictly prevent Touch from selecting/drawing box
        if (e.button === 0 && (!e.pointerType || e.pointerType !== 'touch') && (e.target === container || e.target === world)) {
            document.body.classList.add('canvas-interacting');
            interaction.isSelecting = true;
            const rect = container.getBoundingClientRect();
            interaction.selectionStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            selectNode(null);
            if (document.activeElement) document.activeElement.blur();
        }
    });

    // Prevent Context Menu (Right Click pan)
    container.addEventListener('contextmenu', e => {
        if (e.target === container || e.target === world) e.preventDefault();
    });

    // Global Mouse Move (for Drag/Resize/Select)
    window.addEventListener('mousemove', (e) => {
        // Resize Node
        if (interaction.isResizingNode) {
            e.preventDefault();
            const dx = (e.clientX - interaction.startPos.x) / appState.scale;
            const nodeData = appState.fields.find(f => f.id === interaction.resizeNodeId);
            if (nodeData) {
                const newWidth = Math.max(50, interaction.resizeStartSize.width + dx);
                nodeData.width = newWidth;
                nodeData.height = newWidth / interaction.aspectRatio;
                // Update DOM directly for performance (until Node is Preact)
                const el = document.getElementById(interaction.resizeNodeId);
                if (el) {
                    el.style.width = `${nodeData.width}px`;
                    el.style.height = `${nodeData.height}px`;
                }
            }
            return;
        }

        // Selection Rect
        if (interaction.isSelecting) {
            const rect = container.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;

            const left = Math.min(interaction.selectionStart.x, currentX);
            const top = Math.min(interaction.selectionStart.y, currentY);
            const width = Math.abs(currentX - interaction.selectionStart.x);
            const height = Math.abs(currentY - interaction.selectionStart.y);

            selectionRect.style.left = `${left}px`;
            selectionRect.style.top = `${top}px`;
            selectionRect.style.width = `${width}px`;
            selectionRect.style.height = `${height}px`;
            selectionRect.style.display = 'block';

            updateSelectionFromRect(left, top, width, height, container);
        }

        if (interaction.isDraggingNode) {
            const dx = e.movementX / appState.scale;
            const dy = e.movementY / appState.scale;

            interaction.selectedIds.forEach(id => {
                const nodeData = appState.fields.find(f => f.id === id);
                if (nodeData) {
                    nodeData.x += dx;
                    nodeData.y += dy;
                    // Direct DOM update for smooth 60fps
                    const el = document.getElementById(id);
                    if (el) {
                        el.style.left = `${nodeData.x}px`;
                        el.style.top = `${nodeData.y}px`;
                    }
                }
            });
        }
    });

    window.addEventListener('mouseup', () => {
        document.body.classList.remove('canvas-interacting');
        if (interaction.isResizingNode) {
            // Logic handled by tailwind class now
        }
        interaction.isDraggingNode = false;
        interaction.isResizingNode = false;
        interaction.isSelecting = false;
        interaction.resizeNodeId = null;
        selectionRect.style.display = 'none';
        container.style.cursor = 'crosshair';
        document.querySelectorAll('.node').forEach(n => n.classList.remove('dragging'));
    });

    // Double click (Create Node)
    container.addEventListener('dblclick', (e) => {
        if (e.target === container || e.target === world) {
            const rect = container.getBoundingClientRect();
            const pos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
            const nodeData = createNode(pos.x, pos.y);
            renderNode(nodeData, world, selectNode);
        }
    });

    // Keyboard (Delete, Duplicate) - Unchanged
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete') {
            const tag = document.activeElement.tagName.toLowerCase();
            if (tag !== 'input' && tag !== 'textarea' && tag !== 'math-field') {
                if (interaction.selectedIds.length > 0) {
                    [...interaction.selectedIds].forEach(id => removeNode(id));
                }
            }
        }
        // Duplicate
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (interaction.selectedIds.length > 0) {
                const newIds = [];
                interaction.selectedIds.forEach(id => {
                    const orig = appState.fields.find(f => f.id === id);
                    if (orig) {
                        const nodeData = createNode(orig.x + 30, orig.y + 30, orig.type, orig.content);
                        renderNode(nodeData, world, selectNode);
                        newIds.push(nodeData.id);
                    }
                });
                selectNode(null);
                newIds.forEach(id => selectNode(id, true));
            }
        }
        // Global Search Shortcuts
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            signals.isSearchOpen.value = true;
            setTimeout(() => {
                const searchInput = document.querySelector('input[placeholder="Search nodes..."]');
                if (searchInput) searchInput.focus();
            }, 50);
        }

        if (e.key === 'Escape') {
            // If search is active/has query, clear it
            if (signals.searchQuery.value || signals.isSearchOpen.value) {
                e.stopImmediatePropagation();
                signals.searchQuery.value = '';
                signals.isSearchOpen.value = false;
                if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                    document.activeElement.blur();
                }
            } else {
                // Standard Deselect Logic
                selectNode(null);
                if (document.activeElement) document.activeElement.blur();
            }
        }
    });
}
