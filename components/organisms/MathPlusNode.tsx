/**
 * Math+ Node Organism
 * Enhanced math node with Compute Engine evaluation
 * Supports global variables shared across all Math+ nodes
 * Two-column layout: math-field on left, per-line results on right
 */
import 'mathlive';
import katex from 'katex';
import { interaction } from '../../state/appState.js';
import { createNodeContainer } from '../../utils/nodeUI.js';
import { evaluateLatex, isEngineReady, onEngineReady } from '../../utils/computeEngine.js';
import type { NodeData, SelectNodeFn } from '../../src/types';

// Extend HTMLElement for MathLive's math-field custom element
interface MathFieldElement extends HTMLElement {
    value: string;
    executeCommand: (command: [string, string]) => void;
    setAttribute: (name: string, value: string) => void;
}

interface EvalResult {
    latex: string;
    result: string;
    isAssignment: boolean;
    error: string | null;
}

/**
 * Creates a Math+ node for the canvas with computation capabilities
 * @param data - Node data containing LaTeX expressions
 * @param onSelect - Selection callback
 * @returns HTMLElement container with the Math+ interface
 */
export function createMathPlusNode(data: NodeData, onSelect: SelectNodeFn): HTMLElement {
    const div = createNodeContainer(data, {
        className: 'p-2 px-3 min-w-[200px] math-plus-node'
    });

    // Add a subtle indicator that this is a Math+ node
    div.style.borderLeft = '3px solid var(--color-accent, #6366f1)';

    // Create two-column container
    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'flex gap-3';
    columnsContainer.style.alignItems = 'stretch';

    // Left column: Math input
    const leftColumn = document.createElement('div');
    leftColumn.className = 'math-plus-input flex-1';
    leftColumn.style.minWidth = '100px';

    // Create the math field for input
    const mf = document.createElement('math-field') as MathFieldElement;
    mf.value = data.content || '';
    mf.setAttribute('smart-mode', 'true');
    mf.style.width = '100%';
    mf.style.minHeight = '1.5em';

    // Right column: Results
    const rightColumn = document.createElement('div');
    rightColumn.className = 'math-plus-results flex flex-col';
    rightColumn.style.minWidth = '80px';
    rightColumn.style.borderLeft = '1px solid var(--border-base, #e5e7eb)';
    rightColumn.style.paddingLeft = '0.75rem';
    rightColumn.style.paddingTop = '0.25rem';
    rightColumn.style.fontFamily = 'var(--font-mono, monospace)';
    rightColumn.style.fontSize = '0.875rem';

    /**
     * Split LaTeX by line breaks (\\) and evaluate each line
     */
    function parseAndEvaluateLines(latex: string): EvalResult[] {
        if (!latex || latex.trim() === '') {
            return [];
        }

        // MathLive wraps multiline content in \displaylines{...}
        // We need to strip this wrapper first
        let content = latex.trim();

        // Check for \displaylines{...} wrapper
        const displayLinesMatch = content.match(/^\\displaylines\s*\{([\s\S]*)\}$/);
        if (displayLinesMatch) {
            content = displayLinesMatch[1];
        }

        // Split by \\ (LaTeX line break)
        const lines = content.split(/\\\\/).map(line => line.trim()).filter(line => line !== '');

        const results: EvalResult[] = [];
        for (const line of lines) {
            if (!line) {
                results.push({ latex: '', result: '', error: null, isAssignment: false });
                continue;
            }

            const { result, isAssignment, error } = evaluateLatex(line);
            results.push({
                latex: line,
                result,
                isAssignment,
                error
            });
        }

        return results;
    }

    /**
     * Render a single result line
     */
    function renderResultLine(evalResult: EvalResult): HTMLElement {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'math-plus-result-line flex items-center gap-1';
        lineDiv.style.height = '2.2em';
        lineDiv.style.lineHeight = '2.2em';

        const prefix = document.createElement('span');
        prefix.textContent = '=';
        prefix.className = 'text-text-tertiary select-none text-xs';

        const valueSpan = document.createElement('span');
        valueSpan.className = 'math-plus-result-value';

        if (evalResult.error) {
            valueSpan.innerHTML = `<span class="text-red-400 text-xs" title="${evalResult.error}">⚠</span>`;
        } else if (evalResult.result) {
            try {
                katex.render(evalResult.result, valueSpan, {
                    throwOnError: false,
                    displayMode: false
                });
            } catch (e) {
                valueSpan.textContent = evalResult.result;
            }

            // Add assignment indicator
            if (evalResult.isAssignment) {
                const checkMark = document.createElement('span');
                checkMark.textContent = ' ✓';
                checkMark.className = 'text-green-500 text-xs';
                checkMark.title = 'Variable defined';
                valueSpan.appendChild(checkMark);
            }
        } else {
            valueSpan.innerHTML = '<span class="text-text-tertiary text-xs">...</span>';
        }

        lineDiv.appendChild(prefix);
        lineDiv.appendChild(valueSpan);

        return lineDiv;
    }

    /**
     * Update all results
     */
    function updateResults() {
        const latex = mf.value;

        // Clear previous results
        rightColumn.innerHTML = '';

        if (!latex || latex.trim() === '') {
            return;
        }

        if (!isEngineReady()) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'text-text-tertiary italic text-xs';
            loadingDiv.textContent = 'Loading...';
            rightColumn.appendChild(loadingDiv);
            return;
        }

        const evalResults = parseAndEvaluateLines(latex);

        for (const evalResult of evalResults) {
            const lineEl = renderResultLine(evalResult);
            rightColumn.appendChild(lineEl);
        }
    }

    // Event listeners
    mf.addEventListener('input', () => {
        data.content = mf.value;
        updateResults();
    });

    mf.addEventListener('focus', () => {
        interaction.activeInput = mf;
        onSelect(data.id);
    });

    // Handle Enter for multiline
    mf.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            mf.executeCommand(['insert', '\\\\']);
        }
    });

    // Assemble the node
    leftColumn.appendChild(mf);
    columnsContainer.appendChild(leftColumn);
    columnsContainer.appendChild(rightColumn);
    div.appendChild(columnsContainer);

    // Initialize results when engine is ready
    onEngineReady(() => {
        updateResults();
    });

    // Also update on initial render if engine is already ready
    if (isEngineReady()) {
        setTimeout(updateResults, 0);
    }

    return div;
}
