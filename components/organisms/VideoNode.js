/**
 * Video Node Organism
 */

/**
 * Parse various video URL formats to embed URLs
 */
function parseVideoUrl(input) {
    // If it's already an iframe, extract src
    const iframeMatch = input.match(/src=["']([^"']+)["']/);
    if (iframeMatch) {
        return iframeMatch[1];
    }

    // YouTube formats
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/;
    const youtubeMatch = input.match(youtubeRegex);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo formats
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = input.match(vimeoRegex);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Return as-is if it looks like a URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
    }

    // Default: assume it's a YouTube ID
    return `https://www.youtube.com/embed/${input}`;
}

export function createVideoNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    div.className = 'node absolute rounded-lg transition-shadow duration-150 bg-surface text-text-primary shadow-md border border-transparent [&.selected]:shadow-focus [&.selected]:shadow-lg [&.selected]:z-[1000] [&.selected]:border-accent [&.dragging]:cursor-grabbing [&.dragging]:opacity-90 cursor-grab';
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex;

    // Use stored dimensions or defaults
    const width = data.width || 560;
    const height = data.height || 315;

    const embedUrl = parseVideoUrl(data.content);

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    // .video-iframe { display: block; border: none; border-radius: var(--radius-md); }
    iframe.className = 'block border-none rounded-md pointer-events-auto';
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('loading', 'lazy');

    // Prevent iframe from capturing drag events
    iframe.addEventListener('mousedown', e => e.stopPropagation());

    div.appendChild(iframe);

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20 bg-[linear-gradient(135deg,transparent_50%,var(--color-slate-400)_50%)] opactiy-50 hover:opacity-100';
    resizeHandle.dataset.nodeId = data.id;
    div.appendChild(resizeHandle);

    return div;
}
