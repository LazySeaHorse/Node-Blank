/**
 * Math Node Organism
 */
import 'mathlive';
import { interaction } from '../../state/appState.js';
import { createNodeContainer } from '../../utils/nodeUI.js';

export function createMathNode(data, onSelect) {
    const div = createNodeContainer(data, {
        className: 'p-2 px-3 min-w-[60px]'
    });

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
