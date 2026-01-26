/**
 * Node UI Utilities
 * Shared logic for node structure, styling, and standard elements
 */
import type { NodeData, NodeContainerOptions, CreateNodeContainerFn } from '../src/types/index.js';

export const BASE_NODE_CLASSES = 'node group absolute rounded-lg transition-shadow duration-150 bg-surface text-text-primary shadow-md border border-transparent [&.selected]:shadow-focus [&.selected]:shadow-lg [&.selected]:z-[1000] [&.selected]:ring-2 [&.selected]:ring-accent [&.selected]:ring-offset-1 dark:[&.selected]:ring-offset-canvas [&.dragging]:cursor-grabbing [&.dragging]:opacity-90 cursor-grab';

/**
 * Creates the outer container for any node with standardized styling and properties.
 * 
 * @param data - The node data object (id, x, y, zIndex, width, height, etc.)
 * @param options - Configuration for the container
 * @returns The created div element
 */
export const createNodeContainer: CreateNodeContainerFn = (
    data: NodeData, 
    { className = '', withResize = false, flex = false }: NodeContainerOptions = {}
): HTMLElement => {
    const div = document.createElement('div');
    div.id = data.id;

    // Build class list
    let classes = BASE_NODE_CLASSES;
    if (flex) classes += ' flex flex-col overflow-hidden';
    if (className) classes += ` ${className}`;
    div.className = classes;

    // Set position and z-index
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex.toString();

    // Set dimensions if provided
    if (data.width) div.style.width = `${data.width}px`;
    if (data.height) div.style.height = `${data.height}px`;

    // Add resize handle if requested
    if (withResize) {
        const resizeHandle = document.createElement('div');
        // Standardized resize handle styling
        resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20 bg-[linear-gradient(135deg,transparent_50%,var(--color-slate-400)_50%)] opacity-50 hover:opacity-100';
        resizeHandle.dataset.nodeId = data.id;
        div.appendChild(resizeHandle);
    }

    return div;
};