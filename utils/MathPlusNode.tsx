/**
 * Math+ Node Component (TSX)
 */
import 'mathlive';
import katex from 'katex';
import { interaction } from '../state/appState';
import { createNodeContainer } from './nodeUI';
import { evaluateLatex, isEngineReady, onEngineReady } from '@utils/computeEngine';
import type { NodeData } from '../src/types/index';

export function createMathPlusNode(data: NodeData, onSelect?: (id: string, addToSelection?: boolean) => void): HTMLElement {
    const div = (createNodeContainer as any)(data, {
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
    const mf = document.createElement('math-field') as any;
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
    rightColumn.style.paddingTop = '0.25rem'; // Match mathfield padding
    rightColumn.style.fontFamily = 'var(--font-mono, monospace)';
    rightColumn.style.fontSize = '0.875rem';

    /**
     * Split LaTeX by line breaks (\\) and evaluate each line
     */
    function parseAndEvaluateLines(latex: string) {
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
        // MathLive uses \\ to separate lines within displaylines
        const lines = content.split(/\\\\/).map(line => line.trim()).filter(line => line !== '');

        const results = [];
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
    function renderResultLine(evalResult: any) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'math-plus-result-line flex items-center gap-1';
        // Match MathLive's displaylines line height (approximately 1.8em)
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
        if (onSelect) onSelect(data.id);
    });

    // Handle Shift+Enter for multiline (plain Enter reserved for MathLive popover)
    mf.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && e.shiftKey) {
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