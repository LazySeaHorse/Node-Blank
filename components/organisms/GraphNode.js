/**
 * Graph Node Organism
 */
import { html, useState, useEffect, useRef, render } from '../../utils/preact.js';

export function createGraphNode(data) {
    // Container for the component
    const container = document.createElement('div');

    // Set ID and cleanup/setup properties that the app expects on the node element
    container.id = data.id;
    container.className = 'node absolute rounded-lg transition-shadow duration-150 bg-surface text-text-primary shadow-md border border-transparent [&.selected]:shadow-focus [&.selected]:shadow-lg [&.selected]:z-[1000] [&.selected]:border-accent [&.dragging]:cursor-grabbing [&.dragging]:opacity-90 p-3 w-[340px] flex flex-col gap-2 cursor-grab';
    container.style.position = 'absolute';
    container.style.left = `${data.x}px`;
    container.style.top = `${data.y}px`;
    container.style.zIndex = data.zIndex;

    // Render the content
    render(html`<${GraphNodeContent} data=${data} />`, container);

    return container;
}

function GraphNodeContent({ data }) {
    const [content, setContent] = useState(data.content);
    const graphId = `g-${data.id}`;

    // Update graph when content changes
    useEffect(() => {
        data.content = content; // Sync back to data object
        updateGraph(content, graphId);
    }, [content, graphId]);

    // Handle theme changes
    useEffect(() => {
        const handleThemeChange = () => {
            // Small delay to ensure CSS variables have updated
            setTimeout(() => updateGraph(content, graphId), 50);
        };
        window.addEventListener('themeChanged', handleThemeChange);
        return () => window.removeEventListener('themeChanged', handleThemeChange);
    }, [content, graphId]);

    const handleInput = (e) => {
        setContent(e.target.value);
    };

    return html`
        <div class="border border-border-base rounded-md p-1 px-2 bg-surface-hover flex items-center">
            <span class="text-xs font-bold text-text-secondary mr-2">f(x)=</span>
            <math-field 
                class="flex-1 text-base bg-transparent outline-none border-none p-0.5 cursor-text"
                virtual-keyboard-mode="manual"
                value=${content}
                onInput=${handleInput}
                onMouseDown=${e => e.stopPropagation()}
            ></math-field>
        </div>
        <div 
            id=${graphId} 
            class="w-full h-[220px] overflow-hidden rounded-md border border-border-base"
            onMouseDown=${e => e.stopPropagation()}
        ></div>
    `;
}

function updateGraph(val, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous
    container.innerHTML = '';

    // Setup dimensions
    const width = 316;
    const height = 220;
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };

    // Create SVG
    const svg = d3.select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "visible"); // Allow overflow for axis labels if needed

    // Scales (Default -10 to 10 domain)
    const xScale = d3.scaleLinear().domain([-10, 10]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([-5, 5]).range([height - margin.bottom, margin.top]);

    // Grid/Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickSizeOuter(0);

    // Draw Grid lines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(5).tickSize(-(height - margin.top - margin.bottom)).tickFormat("").tickSizeOuter(0))
        .style("stroke-opacity", 0.1);

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5).tickSize(-(width - margin.left - margin.right)).tickFormat("").tickSizeOuter(0))
        .style("stroke-opacity", 0.1);

    // Draw Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("class", "text-border-base")
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "text-border-base")
        .call(yAxis);

    if (!val) return;

    try {
        // Pre-process LaTeX to MathJS compatible string
        // Note: mathjs handles some regex but might need help with LaTeX specific syntax like \frac
        let exprStr = val
            .replace(/\\cdot/g, '*')
            .replace(/\\left/g, '')
            .replace(/\\right/g, '')
            .replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos').replace(/\\tan/g, 'tan')
            .replace(/\\ln/g, 'log').replace(/\\log/g, 'log10')
            .replace(/\\pi/g, 'pi')
            .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
            .replace(/\{/g, '(').replace(/\}/g, ')')
            .replace(/\\/g, '');

        const compiled = math.compile(exprStr);

        // Generate data points
        const data = [];
        const samples = 200;
        const xMin = -10;
        const xMax = 10;
        const step = (xMax - xMin) / samples;

        for (let i = 0; i <= samples; i++) {
            const x = xMin + i * step;
            try {
                const y = compiled.evaluate({ x });
                if (typeof y === 'number' && isFinite(y)) {
                    data.push({ x, y });
                } else {
                    // Break line if undefined/infinity
                    data.push({ x, y: null });
                }
            } catch (err) {
                // Ignore individual point errors
            }
        }

        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#f59e0b';

        // Line generator
        const line = d3.line()
            .defined(d => d.y !== null)
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", accentColor)
            .attr("stroke-width", 2)
            .attr("d", line);

    } catch (e) {
        // console.warn("Invalid function:", e);
        // Optional: show error in UI
    }
}

