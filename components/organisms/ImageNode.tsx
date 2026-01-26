/**
 * Image Node Organism
 * Displays an image with resize capability
 */
import { createNodeContainer } from '../../utils/nodeUI.js';
import type { NodeData, SelectNodeFn } from '../../src/types';

/**
 * Creates an image node for the canvas
 * @param data - Node data containing image content (Base64)
 * @param onSelect - Selection callback (unused for images but kept for API consistency)
 * @returns HTMLElement container with the image
 */
export function createImageNode(data: NodeData, onSelect: SelectNodeFn): HTMLElement {
    const div = createNodeContainer(data, {
        withResize: true,
        className: '[&.selected]:ring-4'
    });

    // Use stored dimensions or defaults
    const width = data.width || 300;
    const height = data.height || 300;

    const img = document.createElement('img');
    img.src = data.content; // The Base64 string
    img.className = 'w-full h-full rounded pointer-events-none object-contain block';
    img.style.borderRadius = 'var(--radius-md)';
    img.style.pointerEvents = 'none';
    img.alt = 'User uploaded image';
    img.draggable = false;

    div.appendChild(img);

    return div;
}
