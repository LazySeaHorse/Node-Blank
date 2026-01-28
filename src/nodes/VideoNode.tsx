/**
 * Video Node Component (TSX)
 */
import { createNodeContainer } from '@utils/nodeUI';
import type { NodeData } from '@/types';

/**
 * Parse various video URL formats to embed URLs
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

export function createVideoNode(data: NodeData, onSelect?: (id: string, addToSelection?: boolean) => void): HTMLElement {
    const div = createNodeContainer(data, {
        withResize: true,
        className: '[&.selected]:ring-4'
    });

    const embedUrl = parseVideoUrl(data.content || '');

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.className = 'w-full h-full block border-none rounded-md pointer-events-auto group-[.dragging]:pointer-events-none [[.canvas-interacting]_&]:pointer-events-none';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('loading', 'lazy');

    div.appendChild(iframe);

    return div;
}