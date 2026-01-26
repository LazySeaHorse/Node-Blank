/**
 * Video Node Organism
 * Embeds YouTube, Vimeo, and other video sources
 */
import { createNodeContainer } from '../../utils/nodeUI.ts';
import type { NodeData, SelectNodeFn } from '../../src/types';

/**
 * Parse various video URL formats to embed URLs
 * Supports YouTube, Vimeo, and iframe embed codes
 */
function parseVideoUrl(input: string): string {
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

/**
 * Creates a video node for the canvas
 * @param data - Node data containing video URL
 * @param onSelect - Selection callback (unused but kept for API consistency)
 * @returns HTMLElement container with the video iframe
 */
export function createVideoNode(data: NodeData, onSelect?: SelectNodeFn): HTMLElement {
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
    // Using group-[.dragging]:pointer-events-none for node-level dragging
    // Using [[.canvas-interacting]_&]:pointer-events-none for global canvas interactions (panning, etc.)
    iframe.className = 'w-full h-full block border-none rounded-md pointer-events-auto group-[.dragging]:pointer-events-none [[.canvas-interacting]_&]:pointer-events-none';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('loading', 'lazy');
    iframe.title = 'Embedded video';

    div.appendChild(iframe);

    return div;
}
