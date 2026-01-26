/**
 * Graph Node Organism
 * Function plotting with function-plot library
 */
import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { createNodeContainer } from '../../utils/nodeUI.ts';
import functionPlot from 'function-plot';
import type { NodeData, SelectNodeFn } from '../../src/types';

interface GraphNodeContentProps {
    data: NodeData;
}

/**
 * Inner Preact component for graph node content
 */
function GraphNodeContent({ data }: GraphNodeContentProps) {
    const [content, setContent] = useState(data.content || 'x^2');
    const graphRef = useRef<HTMLDivElement>(null);
    const graphId = `g-${data.id}`;

    /**
     * Get current theme colors for graph styling
     */
    const getThemeColors = () => {
        const style = getComputedStyle(document.documentElement);
        const isDark = document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark';

        return {
            grid: isDark ? '#3f3f46' : '#e5e7eb', // zinc-700 : gray-200
            line: style.getPropertyValue('--color-accent').trim() || '#f59e0b',
            text: isDark ? '#a1a1aa' : '#6b7280'
        };
    };

    /**
     * Draw the graph using function-plot
     */
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

    const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        setContent(target.value);
    };

    return (
        <>
            <div className="border border-border-base rounded-md p-1 px-2 bg-surface-hover flex items-center">
                <span className="text-xs font-bold text-text-secondary mr-2">f(x)=</span>
                <input
                    type="text"
                    className="flex-1 text-base bg-transparent text-text-primary outline-none border-none p-0.5"
                    value={content}
                    onInput={handleInput}
                    placeholder="x^2"
                />
            </div>
            <div
                id={graphId}
                ref={graphRef}
                className="w-full h-[240px] overflow-hidden rounded-md border border-border-base bg-canvas"
                onWheel={(e) => e.stopPropagation()}
            />
        </>
    );
}

/**
 * Creates a graph node for the canvas
 * @param data - Node data containing function expression
 * @param onSelect - Selection callback (unused but kept for API consistency)
 * @returns HTMLElement container with the graph
 */
export function createGraphNode(data: NodeData, onSelect?: SelectNodeFn): HTMLElement {
    const container = createNodeContainer(data, {
        className: 'p-3 w-[350px] flex flex-col gap-2'
    });

    // Render Preact component into the container
    render(<GraphNodeContent data={data} />, container);

    return container;
}
