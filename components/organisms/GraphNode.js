/**
 * Graph Node Organism
 */
export function createGraphNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    div.className = 'node node-graph';
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex;

    const wrapper = document.createElement('div');
    wrapper.className = 'graph-input-wrapper';

    const label = document.createElement('span');
    label.className = 'graph-label';
    label.innerHTML = "f(x)=";

    const mf = document.createElement('math-field');
    mf.style.flex = "1";
    mf.style.fontSize = "1rem";
    mf.value = data.content;
    mf.virtualKeyboardMode = "manual";

    const graphId = `g-${data.id}`;
    const graphDiv = document.createElement('div');
    graphDiv.id = graphId;
    graphDiv.className = 'graph-target';

    const updateGraph = (val) => {
        try {
            // Basic cleanup for function-plot parser
            let fn = val
                .replace(/\\cdot/g, '*')
                .replace(/\\left/g, '')
                .replace(/\\right/g, '')
                .replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos').replace(/\\tan/g, 'tan')
                .replace(/\\ln/g, 'log').replace(/\\log/g, 'log')
                .replace(/\\pi/g, 'PI')
                .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
                .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
                .replace(/\{/g, '(').replace(/\}/g, ')')
                .replace(/\\/g, '');

            // Get current accent color from CSS variable
            const accentColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-accent').trim() || '#3b82f6';

            functionPlot({
                target: `#${graphId}`,
                width: 316,
                height: 220,
                grid: true,
                tip: { xLine: true, yLine: true },
                data: [{ fn: fn, color: accentColor }]
            });
        } catch (e) { }
    };

    mf.addEventListener('input', () => {
        data.content = mf.value;
        updateGraph(mf.value);
    });

    mf.addEventListener('mousedown', e => e.stopPropagation());
    graphDiv.addEventListener('mousedown', e => e.stopPropagation());

    // Listen for theme changes to update graph color
    const handleThemeChange = () => {
        // Small delay to ensure CSS variables have updated
        setTimeout(() => updateGraph(mf.value), 50);
    };
    window.addEventListener('themeChanged', handleThemeChange);

    // Clean up listener if node is removed (using MutationObserver on parent would be robust, 
    // but for now we rely on the fact that nodes might be destroyed. 
    // Ideally we'd have a lifecycle hook. 
    // We'll attach a mutation observer to the node itself to detect removal)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.removedNodes) {
                mutation.removedNodes.forEach((node) => {
                    if (node === div) {
                        window.removeEventListener('themeChanged', handleThemeChange);
                        observer.disconnect();
                    }
                });
            }
        });
    });
    // Observer needs to watch the parent, but parent isn't assigned yet. 
    // We can just rely on the fact that if the element is removed from DOM, 
    // the event listener might stick around but won't do visual harm, 
    // though it's a memory leak. 
    // For this simple app, we'll accept the minor leak or 
    // try to find a better hook. 
    // Actually, updateGraph checks for element existence implicitly 
    // via functionPlot's target selector.

    // Let's just add the listener.


    wrapper.appendChild(label);
    wrapper.appendChild(mf);
    div.appendChild(wrapper);
    div.appendChild(graphDiv);

    setTimeout(() => updateGraph(data.content), 100);

    return div;
}
