/**
 * Image Node Organism
 */
export function createImageNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    div.className = 'node absolute rounded-lg transition-shadow duration-150 bg-surface text-text-primary shadow-md border border-transparent [&.selected]:shadow-focus [&.selected]:shadow-lg [&.selected]:z-[1000] [&.selected]:border-accent [&.dragging]:cursor-grabbing [&.dragging]:opacity-90 cursor-grab';
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex;

    // Use stored dimensions or defaults
    const width = data.width || 300;
    const height = data.height || 300;

    const img = document.createElement('img');
    img.src = data.content; // The Base64 string
    img.className = 'rounded pointer-events-none';
    img.style.borderRadius = 'var(--radius-md)';
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    img.style.objectFit = 'contain';
    img.style.pointerEvents = 'none';
    img.style.display = 'block';

    div.appendChild(img);

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20 bg-[linear-gradient(135deg,transparent_50%,var(--color-slate-400)_50%)] opactiy-50 hover:opacity-100';
    resizeHandle.dataset.nodeId = data.id;
    div.appendChild(resizeHandle);

    return div;
}
