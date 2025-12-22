/**
 * Math Node Organism
 */
import { interaction } from '../../state/appState.js';

export function createMathNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    div.className = 'node absolute rounded-lg transition-shadow duration-150 bg-surface text-text-primary shadow-md border border-transparent [&.selected]:shadow-focus [&.selected]:shadow-lg [&.selected]:z-[1000] [&.selected]:border-accent [&.dragging]:cursor-grabbing [&.dragging]:opacity-90 p-2 px-3 min-w-[60px] cursor-grab';
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex;

    const mf = document.createElement('math-field');
    mf.value = data.content;
    //mf.virtualKeyboardMode = "manual";

    mf.addEventListener('input', () => {
        data.content = mf.value;
    });

    mf.addEventListener('focus', () => {
        interaction.activeInput = mf;
        onSelect(data.id);
    });

    // Prevent drag when interacting with math field
    // Handled by nodeFactory

    // Handle Enter for multiline
    mf.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            mf.executeCommand(['insert', '\\\\']);
        }
    });

    div.appendChild(mf);

    return div;
}
