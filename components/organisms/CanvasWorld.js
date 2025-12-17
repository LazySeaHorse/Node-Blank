/**
 * Canvas World Organism
 */
import { appState, interaction, screenToWorld } from '../../state/appState.js';
import { createNode, renderNode, removeNode, selectNode } from '../../utils/nodeFactory.js';

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
    // #canvas-container { bg-color: var(--bg-canvas); ... }
    // We already migrated app.js layout, so we just need internal sizing/bg here.
    // background-image logic remains in JS (updateTransform) or we can move it here if static? 
    // It depends on CSS variables. The CSS used var(--grid-color) etc.
    // We'll keep the JS dynamic background styles but strictly use Tailwind for layout.
    container.className = 'flex-1 relative overflow-hidden w-full h-full bg-canvas touch-none';

    // Restore grid pattern (previously in canvas-world.css)
    container.style.backgroundImage = `
        linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
        linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
    `;

    const world = document.createElement('div');
    world.id = 'canvas-world';
    // #canvas-world { position: absolute; ... }
    world.className = 'absolute top-0 left-0 w-full h-full origin-top-left will-change-transform';

    // Selection rectangle
    const selectionRect = document.createElement('div');
    selectionRect.id = 'selection-rect';
    // .selection-rect { position: absolute; border: 2px solid var(--color-accent); bg: color-mix(...); pointer-events: none; display: none; z-index: 10000; }
    selectionRect.className = 'absolute border-2 border-accent bg-accent/10 pointer-events-none hidden z-[10000]';

    // Disable default touch actions to allow custom handling
    container.style.touchAction = 'none';

    container.appendChild(world);
    container.appendChild(selectionRect);

    return { container, world, selectionRect };
}

export function updateTransform(world, container) {
    world.style.transform = `translate(${appState.pan.x}px, ${appState.pan.y}px) scale(${appState.scale})`;

    // Grid Updates
    const s = 40 * appState.scale;
    container.style.backgroundSize = `${s}px ${s}px`;
    container.style.backgroundPosition = `${appState.pan.x}px ${appState.pan.y}px`;

    // Update Zoom Indicator Text
    const percent = Math.round(appState.scale * 100);
    const indicator = document.getElementById('zoom-indicator');
    if (indicator) indicator.innerText = percent + '%';
}

export function setupCanvasEvents(container, world) {
    const selectionRect = document.getElementById('selection-rect');

    // Mouse down - distinguish between left and middle button
    container.addEventListener('mousedown', (e) => {
        // Check if clicking on resize handle
        if (e.target.classList.contains('resize-handle')) {
            e.preventDefault();
            e.stopPropagation();

            const nodeId = e.target.dataset.nodeId;
            const nodeData = appState.fields.find(f => f.id === nodeId);

            if (nodeData && (nodeData.type === 'image' || nodeData.type === 'video')) {
                interaction.isResizingNode = true;
                interaction.resizeNodeId = nodeId;
                interaction.startPos = { x: e.clientX, y: e.clientY };
                interaction.resizeStartSize = {
                    width: nodeData.width || (nodeData.type === 'image' ? 300 : 560),
                    height: nodeData.height || (nodeData.type === 'image' ? 300 : 315)
                };

                // Calculate aspect ratio
                interaction.aspectRatio = interaction.resizeStartSize.width / interaction.resizeStartSize.height;
            }
            return;
        }

        if (e.target === container || e.target === world) {
            // Middle button (1) or right button (2) - pan
            if (e.button === 1 || e.button === 2) {
                e.preventDefault();
                interaction.isDraggingCanvas = true;
                interaction.startPos = { x: e.clientX, y: e.clientY };
                interaction.panStart = { ...appState.pan };
                container.style.cursor = 'grabbing';
                return;
            }

            // Left button (0) - selection rectangle
            if (e.button === 0) {
                interaction.isSelecting = true;
                const rect = container.getBoundingClientRect();
                interaction.selectionStart = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                selectNode(null);
                if (document.activeElement) document.activeElement.blur();
            }
        }
    });

    // Prevent context menu on right click
    container.addEventListener('contextmenu', (e) => {
        if (e.target === container || e.target === world) {
            e.preventDefault();
        }
    });

    window.addEventListener('mousemove', (e) => {
        // Resize Node
        if (interaction.isResizingNode) {
            e.preventDefault();
            const nodeData = appState.fields.find(f => f.id === interaction.resizeNodeId);
            if (nodeData) {
                const dx = (e.clientX - interaction.startPos.x) / appState.scale;

                // Calculate new width maintaining aspect ratio (minimum 50px)
                const newWidth = Math.max(50, interaction.resizeStartSize.width + dx);
                const newHeight = newWidth / interaction.aspectRatio;

                nodeData.width = newWidth;
                nodeData.height = newHeight;

                // Update the DOM element
                const el = document.getElementById(interaction.resizeNodeId);
                if (el) {
                    const mediaEl = el.querySelector('img, iframe');
                    if (mediaEl) {
                        mediaEl.style.width = `${newWidth}px`;
                        mediaEl.style.height = `${newHeight}px`;
                        // Disable pointer events on iframe during resize
                        if (mediaEl.tagName === 'IFRAME') {
                            mediaEl.style.pointerEvents = 'none';
                        }
                    }
                }
            }
            return;
        }

        // Pan Canvas
        if (interaction.isDraggingCanvas) {
            const dx = e.clientX - interaction.startPos.x;
            const dy = e.clientY - interaction.startPos.y;
            appState.pan = {
                x: interaction.panStart.x + dx,
                y: interaction.panStart.y + dy
            };
            // updateTransform now called automatically via effect
        }

        // Selection Rectangle
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

            // Update selection
            updateSelectionFromRect(left, top, width, height, container);
        }

        // Drag Node(s)
        if (interaction.isDraggingNode) {
            const dx = e.movementX / appState.scale;
            const dy = e.movementY / appState.scale;

            // Move all selected nodes
            interaction.selectedIds.forEach(id => {
                const nodeData = appState.fields.find(f => f.id === id);
                if (nodeData) {
                    nodeData.x += dx;
                    nodeData.y += dy;
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
        // Re-enable pointer events on iframes after resize
        if (interaction.isResizingNode) {
            const el = document.getElementById(interaction.resizeNodeId);
            if (el) {
                const iframe = el.querySelector('iframe');
                if (iframe) {
                    iframe.style.pointerEvents = 'auto';
                }
            }
        }

        interaction.isDraggingCanvas = false;
        interaction.isDraggingNode = false;
        interaction.isResizingNode = false;
        interaction.isSelecting = false;
        interaction.resizeNodeId = null;
        interaction.dragStartPositions.clear();
        container.style.cursor = 'crosshair';
        selectionRect.style.display = 'none';
        document.querySelectorAll('.node').forEach(n => n.classList.remove('dragging'));
    });

    // Zoom with Ctrl+Scroll
    container.addEventListener('wheel', (e) => {
        if (e.target.tagName === 'TEXTAREA') return;

        if (e.ctrlKey) {
            e.preventDefault();
            const factor = Math.exp((e.deltaY < 0 ? 1 : -1) * 0.1);
            const newScale = Math.min(5, Math.max(0.1, appState.scale * factor));

            const rect = container.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const wx = (mx - appState.pan.x) / appState.scale;
            const wy = (my - appState.pan.y) / appState.scale;

            appState.pan.x = mx - wx * newScale;
            appState.pan.y = my - wy * newScale;
            appState.scale = newScale;
            //updateTransform(world, container);
        }
    }, { passive: false });

    // Double Click
    container.addEventListener('dblclick', (e) => {
        if (e.target === container || e.target === world) {
            const rect = container.getBoundingClientRect();
            const pos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
            const nodeData = createNode(pos.x, pos.y);
            renderNode(nodeData, world, selectNode);
        }
    });

    // Keyboard
    window.addEventListener('keydown', (e) => {
        // Delete
        if (e.key === 'Delete') {
            const tag = document.activeElement.tagName.toLowerCase();
            if (tag !== 'input' && tag !== 'textarea' && tag !== 'math-field') {
                if (interaction.selectedIds.length > 0) {
                    // Delete all selected nodes
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
                // Select the duplicated nodes
                selectNode(null);
                newIds.forEach(id => selectNode(id, true));
            }
        }
        // Escape
        if (e.key === 'Escape') {
            selectNode(null);
            if (document.activeElement) document.activeElement.blur();
            document.querySelectorAll('.md-editor:not(.hidden)').forEach(el => el.blur());
        }
    });

    // Touch Events for Mobile (Pan & Zoom)
    container.addEventListener('touchstart', (e) => {
        // Allow interaction with UI elements (buttons, etc.)
        if (e.target.closest('.app-header') || e.target.closest('.zoom-controls') || e.target.closest('.theme-toggle-btn')) {
            return;
        }

        // Prevent default browser zooming/scrolling for all touches in canvas
        e.preventDefault();

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            interaction.isDraggingCanvas = true;
            interaction.startPos = { x: touch.clientX, y: touch.clientY };
            interaction.panStart = { ...appState.pan };
        } else if (e.touches.length === 2) {
            interaction.isZooming = true;

            const t1 = e.touches[0];
            const t2 = e.touches[1];

            const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
            const cx = (t1.clientX + t2.clientX) / 2;
            const cy = (t1.clientY + t2.clientY) / 2;

            interaction.pinchStartDist = dist;
            interaction.pinchStartScale = appState.scale;
            interaction.pinchStartCenter = { x: cx, y: cy };
            interaction.panStart = { ...appState.pan };
        }
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
        // Prevent default processing
        e.preventDefault();

        if (e.touches.length === 1 && interaction.isDraggingCanvas) {
            const touch = e.touches[0];
            const dx = touch.clientX - interaction.startPos.x;
            const dy = touch.clientY - interaction.startPos.y;
            appState.pan = {
                x: interaction.panStart.x + dx,
                y: interaction.panStart.y + dy
            };
        } else if (e.touches.length === 2 && interaction.isZooming) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];

            const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
            const cx = (t1.clientX + t2.clientX) / 2;
            const cy = (t1.clientY + t2.clientY) / 2;

            if (interaction.pinchStartDist > 0) {
                const scaleFactor = dist / interaction.pinchStartDist;
                let newScale = interaction.pinchStartScale * scaleFactor;
                newScale = Math.min(5, Math.max(0.1, newScale));

                // Calculate new pan to zoom around center
                const rect = container.getBoundingClientRect();
                const startCxRel = interaction.pinchStartCenter.x - rect.left;
                const startCyRel = interaction.pinchStartCenter.y - rect.top;

                const wx = (startCxRel - interaction.panStart.x) / interaction.pinchStartScale;
                const wy = (startCyRel - interaction.panStart.y) / interaction.pinchStartScale;

                const currCxRel = cx - rect.left;
                const currCyRel = cy - rect.top;

                appState.pan = {
                    x: currCxRel - wx * newScale,
                    y: currCyRel - wy * newScale
                };
                appState.scale = newScale;
            }
        }
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            interaction.isZooming = false;
        }
        if (e.touches.length === 0) {
            interaction.isDraggingCanvas = false;
        }
    });



}
