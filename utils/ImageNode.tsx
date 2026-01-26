/**
 * Image Node Component (TSX)
 */
import { createNodeContainer } from './nodeUI.js';
import type { NodeData } from '../src/types/index.js';

export function createImageNode(data: NodeData, onSelect?: (id: string, addToSelection?: boolean) => void): HTMLElement {
    const div = createNodeContainer(data, {
        withResize: true,
        className: '[&.selected]:ring-4'
    });

    const img = document.createElement('img');
    img.src = data.content || '';
    img.className = 'w-full h-full rounded pointer-events-none object-contain block';
    img.style.borderRadius = 'var(--radius-md)';
    img.style.pointerEvents = 'none';

    div.appendChild(img);

    return div;
}