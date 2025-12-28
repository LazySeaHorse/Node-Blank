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

import { createNodeContainer } from '../../utils/nodeUI.js';

export function createVideoNode(data, onSelect) {
    const div = createNodeContainer(data, {
        withResize: true,
        className: '[&.selected]:ring-4'
    });

    // Use stored dimensions or defaults
    const width = data.width || 560;
    const height = data.height || 315;

    const embedUrl = parseVideoUrl(data.content);

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    // .video-iframe { display: block; border: none; border-radius: var(--radius-md); }
    iframe.className = 'w-full h-full block border-none rounded-md pointer-events-auto';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('loading', 'lazy');

    // Prevent iframe from capturing drag events
    // Handled by nodeFactory

    div.appendChild(iframe);

    return div;
}
