/**
 * Math Node Organism
 * Single MathLive math-field for LaTeX input
 */
import 'mathlive';
import { interaction } from '../../state/appState.ts';
import { createNodeContainer } from '../../utils/nodeUI.ts';
import type { NodeData, SelectNodeFn } from '../../src/types';

// Extend HTMLElement for MathLive's math-field custom element
interface MathFieldElement extends HTMLElement {
    value: string;
    virtualKeyboardMode?: 'manual' | 'onfocus' | 'off';
    executeCommand: (command: [string, string]) => void;
}

/**
 * Creates a math node for the canvas
 * @param data - Node data containing LaTeX content
 * @param onSelect - Selection callback
 * @returns HTMLElement container with the math field
 */
export function createMathNode(data: NodeData, onSelect: SelectNodeFn): HTMLElement {
    const div = createNodeContainer(data, {
        className: 'p-2 px-3 min-w-[60px]'
    });

    const mf = document.createElement('math-field') as MathFieldElement;
    mf.value = data.content;

    // Event: Input changes
    mf.addEventListener('input', () => {
        data.content = mf.value;
    });

    // Event: Focus to select node
    mf.addEventListener('focus', () => {
        interaction.activeInput = mf;
        onSelect(data.id);
    });

    // Handle Enter for multiline (insert LaTeX line break)
    mf.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            mf.executeCommand(['insert', '\\\\']);
        }
    });

    div.appendChild(mf);

    return div;
}
