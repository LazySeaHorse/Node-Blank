/**
 * Math Node Component (TSX)
 */
import 'mathlive';
import { interaction } from '../state/appState.js';
import { createNodeContainer } from './nodeUI.js';
import type { NodeData } from '../src/types/index.js';

export function createMathNode(data: NodeData, onSelect?: (id: string, addToSelection?: boolean) => void): HTMLElement {
    const div = createNodeContainer(data, {
        className: 'p-2 px-3 min-w-[60px]'
    });

    const mf = document.createElement('math-field') as any;
    mf.value = data.content || '';

    mf.addEventListener('input', () => {
        data.content = mf.value;
    });

    mf.addEventListener('focus', () => {
        interaction.activeInput = mf;
        if (onSelect) onSelect(data.id);
    });

    // Handle Enter for multiline
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