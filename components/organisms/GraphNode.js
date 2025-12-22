/**
 * Graph Node Organism
 */
import { html, useState, useEffect, useRef, render } from '../../utils/preact.js';

export function createGraphNode(data) {
    // Container for the component
    const container = document.createElement('div');

    // Set ID and cleanup/setup properties that the app expects on the node element
    container.id = data.id;
    container.className = 'node absolute rounded-lg transition-shadow duration-150 bg-surface text-text-primary shadow-md border border-transparent [&.selected]:shadow-focus [&.selected]:shadow-lg [&.selected]:z-[1000] [&.selected]:border-accent [&.dragging]:cursor-grabbing [&.dragging]:opacity-90 p-3 w-[350px] flex flex-col gap-2 cursor-grab';
    container.style.position = 'absolute';
    container.style.left = `${data.x}px`;
    container.style.top = `${data.y}px`;
    container.style.zIndex = data.zIndex;

    // Render the content
    render(html`<${GraphNodeContent} data=${data} />`, container);

    return container;
}

function GraphNodeContent({ data }) {
    const [content, setContent] = useState(data.content || 'x^2');
    const graphRef = useRef(null);
    const graphId = `g-${data.id}`;

    // Helper to get current theme colors
    const getThemeColors = () => {
        const style = getComputedStyle(document.documentElement);
        const isDark = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';

        return {
            grid: isDark ? '#3f3f46' : '#e5e7eb', // zinc-700 : gray-200
            line: style.getPropertyValue('--color-accent').trim() || '#f59e0b',
            text: isDark ? '#a1a1aa' : '#6b7280'
        };
    };

    const drawGraph = () => {
        if (!graphRef.current) return;

        try {
            const colors = getThemeColors();
            const width = 324; // w-[350px] - padding
            const height = 240;

            // Clean previous content
            graphRef.current.innerHTML = '';

            // Use content directly (no LaTeX conversion needed)
            const fn = content;

            functionPlot({
                target: `#${graphId}`,
                width: width,
                height: height,
                yAxis: { domain: [-5, 5] },
                grid: true,
                data: [{
                    fn: fn,
                    color: colors.line,
                    graphType: 'polyline'
                }],
                style: {
                    fill: 'none',
                    stroke: colors.grid
                }
            });

        } catch (e) {
            // Squelch errors for invalid math while typing
        }
    };

    // Update graph when content changes
    useEffect(() => {
        data.content = content; // Sync back to data object

        // Debounce slightly 
        const timer = setTimeout(drawGraph, 50);
        return () => clearTimeout(timer);
    }, [content]);

    // Handle theme changes
    useEffect(() => {
        const handleThemeChange = () => {
            setTimeout(drawGraph, 50);
        };
        window.addEventListener('themeChanged', handleThemeChange);
        return () => window.removeEventListener('themeChanged', handleThemeChange);
    }, [content]);

    const handleInput = (e) => {
        setContent(e.target.value);
    };

    return html`
        <div class="border border-border-base rounded-md p-1 px-2 bg-surface-hover flex items-center">
            <span class="text-xs font-bold text-text-secondary mr-2">f(x)=</span>
            <input 
                type="text"
                class="flex-1 text-base bg-transparent text-text-primary outline-none border-none p-0.5"
                value=${content}
                onInput=${handleInput}
                placeholder="x^2"
            />
        </div>
        <div 
            id=${graphId} 
            ref=${graphRef}
            class="w-full h-[240px] overflow-hidden rounded-md border border-border-base bg-canvas"
            onWheel=${e => e.stopPropagation()} 
        ></div>
    `;
}
