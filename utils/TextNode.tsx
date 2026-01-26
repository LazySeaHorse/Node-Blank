/**
 * Text Node Component (TSX)
 */
import { mdRenderer } from './mdRenderer.ts';
import { interaction } from '../state/appState.ts';
import { createNodeContainer } from './nodeUI.ts';
import type { NodeData } from '../src/types/index.js';

export function createTextNode(data: NodeData, onSelect?: (id: string, addToSelection?: boolean) => void): HTMLElement {
    const div = createNodeContainer(data, {
        className: 'p-4 min-w-[250px] max-w-[500px] min-h-[60px]'
    });

    const preview = document.createElement('div');
    preview.className = 'md-preview';
    preview.innerHTML = mdRenderer(data.content || '');

    const textarea = document.createElement('textarea');
    textarea.className = 'hidden w-full min-h-[120px] border border-border-base rounded-md p-2.5 resize-both bg-canvas text-text-primary font-mono text-sm leading-relaxed outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
    textarea.value = data.content || '';

    // Toggle Edit
    div.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        preview.classList.add('hidden');
        textarea.classList.remove('hidden');
        textarea.focus();
        interaction.activeInput = textarea;
        div.style.cursor = 'auto';
    });

    // Save & Render
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