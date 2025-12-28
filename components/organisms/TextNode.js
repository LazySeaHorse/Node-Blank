/**
 * Text Node Organism
 */
import { mdRenderer } from '../../utils/mdRenderer.js';
import { interaction } from '../../state/appState.js';
import { createNodeContainer } from '../../utils/nodeUI.js';

export function createTextNode(data, onSelect) {
    const div = createNodeContainer(data, {
        className: 'p-4 min-w-[250px] max-w-[500px] min-h-[60px]'
    });

    const preview = document.createElement('div');
    preview.className = 'md-preview';
    preview.innerHTML = mdRenderer(data.content);

    const textarea = document.createElement('textarea');
    textarea.className = 'md-editor hidden';
    textarea.value = data.content;

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

    // Stop propagation in textarea so we can select text
    // Handled by nodeFactory

    div.appendChild(preview);
    div.appendChild(textarea);

    return div;
}
