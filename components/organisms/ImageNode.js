import { createNodeContainer } from '../../utils/nodeUI.js';

export function createImageNode(data, onSelect) {
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

    div.appendChild(img);

    return div;
}
