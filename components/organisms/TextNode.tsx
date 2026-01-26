/**
 * Text Node Organism
 * Markdown editor with preview/edit toggle
 */
import { mdRenderer } from '../../utils/mdRenderer.js';
import { interaction } from '../../state/appState.js';
import { createNodeContainer } from '../../utils/nodeUI.js';
import type { NodeData, SelectNodeFn } from '../../src/types';

/**
 * Creates a text node for the canvas with markdown support
 * @param data - Node data containing markdown content
 * @param onSelect - Selection callback
 * @returns HTMLElement container with preview and editor
 */
export function createTextNode(data: NodeData, onSelect: SelectNodeFn): HTMLElement {
    const div = createNodeContainer(data, {
        className: 'p-4 min-w-[250px] max-w-[500px] min-h-[60px]'
    });

    // Preview element (rendered markdown)
    const preview = document.createElement('div');
    preview.className = 'md-preview';
    preview.innerHTML = mdRenderer(data.content);

    // Editor element (hidden by default)
    const textarea = document.createElement('textarea');
    textarea.className = 'md-editor hidden';
    textarea.value = data.content;

    // Double-click to toggle edit mode
    div.addEventListener('dblclick', (e: MouseEvent) => {
        e.stopPropagation();
        preview.classList.add('hidden');
        textarea.classList.remove('hidden');
        textarea.focus();
        interaction.activeInput = textarea;
        div.style.cursor = 'auto';
    });

    // Blur to save and render
    textarea.addEventListener('blur', () => {
        data.content = textarea.value;
        preview.innerHTML = mdRenderer(data.content);
        textarea.classList.add('hidden');
        preview.classList.remove('hidden');
        interaction.activeInput = null;
        div.style.cursor = 'grab';
    });

    div.appendChild(preview);
    div.appendChild(textarea);

    return div;
}
