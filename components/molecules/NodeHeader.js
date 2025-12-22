/**
 * Node Header Molecule
 * Standardized header for all node types (Script, Table, Spreadsheet, etc.)
 */

/**
 * Creates a standardized node header with title and optional controls
 * @param {string} title - Title text (will be auto-uppercased)
 * @param {Array<HTMLElement>} controls - Array of control elements to display on the right (optional)
 * @returns {HTMLElement} - Header element
 */
export function createNodeHeader(title, controls = []) {
    const header = document.createElement('div');
    header.className = 'p-2 px-3 bg-surface-hover border-b border-border-base flex justify-between items-center cursor-grab select-none';

    const titleEl = document.createElement('span');
    titleEl.textContent = title.toUpperCase();
    titleEl.className = 'text-xs font-semibold text-text-secondary uppercase tracking-wider';

    if (controls.length > 0) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'flex gap-2 items-center';
        controls.forEach(control => controlsContainer.appendChild(control));

        header.appendChild(titleEl);
        header.appendChild(controlsContainer);
    } else {
        header.appendChild(titleEl);
    }

    return header;
}

/**
 * Creates a grouped button cluster (e.g., [- Label +])
 * @param {string} label - Button group label
 * @param {Function} onDecrement - Callback for minus button
 * @param {Function} onIncrement - Callback for plus button
 * @returns {HTMLElement} - Button group element
 */
export function createButtonGroup(label, onDecrement, onIncrement) {
    const group = document.createElement('div');
    group.className = 'flex bg-surface rounded border border-border-base overflow-hidden';

    const btnClass = 'px-2 py-1 bg-transparent border-none text-text-secondary cursor-pointer transition-colors duration-150 hover:bg-surface-hover active:bg-surface-active text-xs';

    const minusBtn = document.createElement('button');
    minusBtn.className = `${btnClass} border-r border-border-base`;
    minusBtn.textContent = '−';
    minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onDecrement();
    });

    const labelEl = document.createElement('span');
    labelEl.className = 'px-2 py-1 text-xs text-text-secondary select-none';
    labelEl.textContent = label;

    const plusBtn = document.createElement('button');
    plusBtn.className = `${btnClass} border-l border-border-base`;
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onIncrement();
    });

    group.appendChild(minusBtn);
    group.appendChild(labelEl);
    group.appendChild(plusBtn);

    return group;
}
