/**
 * Node Factory - Creates and manages nodes
 * Refactored for TSX component imports
 */
import { appState, interaction } from '../state/appState.ts';
import { createMathNode } from './MathNode';
import { createMathPlusNode } from './MathPlusNode';
import { createTextNode } from './TextNode';
import { createGraphNode } from './GraphNode';
import { createImageNode } from './ImageNode';
import { createTableNode } from './TableNode';
import { createVideoNode } from './VideoNode';
import { createScriptNode } from './ScriptNode';
import { createSpreadsheetNode } from './SpreadsheetNode';
import type { NodeData, NodeType, SelectNodeFn } from '../src/types';

/**
 * Create a new node data object and add it to appState.fields
 * @param x - X position in world coordinates
 * @param y - Y position in world coordinates
 * @param type - Node type (defaults to current mode)
 * @param content - Initial content (type-dependent format)
 * @returns The created NodeData object
 */
export function createNode(
    x: number,
    y: number,
    type: NodeType = appState.mode as NodeType,
    content: string = ""
): NodeData {
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // Default contents for each type
    if (!content) {
        if (type === 'text') content = "Double click to edit.\n\nSupports **Markdown** and $LaTeX$ math like $E=mc^2$.";
        if (type === 'graph') content = "x^2";
        if (type === 'table') content = JSON.stringify({
            rows: 3,
            cols: 3,
            cells: Array(3).fill(null).map(() => Array(3).fill(''))
        });
        if (type === 'spreadsheet') content = "[]"; // Handler will init default 5x5
        if (type === 'js') content = "// JavaScript Sandbox\nconsole.log('Hello from the worker!');\n\n// Try some math:\nconst sum = [1, 2, 3, 4].reduce((a, b) => a + b, 0);\nconsole.log('Sum:', sum);";
        if (type === 'math-plus') content = '';
    }

    const nodeData: NodeData = {
        id, x, y, type, content,
        zIndex: ++appState.zIndexCounter
    };

    // Add default dimensions for resizable nodes
    if (type === 'image') {
        nodeData.width = 300;
        nodeData.height = 300;
    } else if (type === 'video') {
        nodeData.width = 560;
        nodeData.height = 315;
    } else if (type === 'js') {
        nodeData.width = 400;
        nodeData.height = 350;
    }

    // Use immutable update for signals to detect change
    appState.fields = [...appState.fields, nodeData];
    return nodeData;
}

/**
 * Render a node to the canvas world
 * @param data - Node data object
 * @param world - The canvas world element to append to
 * @param selectNodeFn - Function to call when node is selected
 */
export function renderNode(data: NodeData, world: HTMLElement, selectNodeFn: SelectNodeFn): void {
    let nodeElement: HTMLElement | undefined;

    switch (data.type) {
        case 'math':
            nodeElement = createMathNode(data, selectNodeFn);
            break;
        case 'math-plus':
            nodeElement = createMathPlusNode(data, selectNodeFn);
            break;
        case 'text':
            nodeElement = createTextNode(data, selectNodeFn);
            break;
        case 'graph':
            nodeElement = createGraphNode(data, selectNodeFn);
            break;
        case 'image':
            nodeElement = createImageNode(data, selectNodeFn);
            break;
        case 'table':
            nodeElement = createTableNode(data, selectNodeFn);
            break;
        case 'video':
            nodeElement = createVideoNode(data, selectNodeFn);
            break;
        case 'spreadsheet':
            nodeElement = createSpreadsheetNode(data, selectNodeFn);
            break;
        case 'js':
            nodeElement = createScriptNode(data, selectNodeFn);
            break;
        default:
            return;
    }

    // Add drag handlers
    nodeElement.addEventListener('mousedown', (e: MouseEvent) => {
        // 1. Don't drag if clicking resize handle
        const target = e.target as HTMLElement;
        if (target.classList.contains('resize-handle')) {
            return;
        }

        // 2. Identify if we clicked an interactive child
        const targetTag = target.tagName.toLowerCase();
        const interactiveTags = ['input', 'textarea', 'math-field', 'button', 'select', 'a'];

        // Jspreadsheet/jSuites/MathLive specific selectors
        const isJssElement = target.closest('.jss_container') ||
            target.closest('.jexcel_container') ||
            target.closest('.jss') ||
            target.closest('.jexcel') ||
            target.closest('.jcontextmenu') ||
            target.closest('.spreadsheet-content');

        const isInteractive = interactiveTags.includes(targetTag) ||
            target.closest('.md-editor') ||
            target.closest('.mouse-interactive') ||
            target.closest('.spreadsheet-content') ||
            isJssElement ||
            target.closest('.graph-target') ||
            targetTag === 'math-field' ||
            target.closest('math-field');

        // 3. Selection Logic: Always select the node on mousedown if not dragging from elsewhere
        // But ONLY for the primary mouse button (0)
        if (e.button === 0 && !interaction.selectedIds.includes(data.id)) {
            selectNodeFn(data.id);
        }

        // 4. If it's an interactive element, we stop here and let the event bubble/perform default actions
        if (isInteractive) {
            return;
        }

        // 5. Only left button for node dragging (non-interactive areas)
        if (e.button !== 0) return;

        interaction.isDraggingNode = true;
        document.body.classList.add('canvas-interacting');
        interaction.selectedId = data.id;

        // Mark all selected nodes as dragging
        interaction.selectedIds.forEach((id: string) => {
            const el = document.getElementById(id);
            if (el) el.classList.add('dragging');
        });

        // For non-interactive areas, we block default choice/selection to enable clean dragging
        e.preventDefault();
        e.stopPropagation();
    });

    world.appendChild(nodeElement);
}

/**
 * Remove a node from the canvas and appState
 * @param id - ID of the node to remove
 */
export function removeNode(id: string): void {
    appState.fields = appState.fields.filter((f: NodeData) => f.id !== id);
    const el = document.getElementById(id);
    if (el) el.remove();

    // Remove from selection arrays
    interaction.selectedIds = interaction.selectedIds.filter((sid: string) => sid !== id);
    if (interaction.selectedId === id) {
        interaction.selectedId = interaction.selectedIds[0] || null;
    }
}

/**
 * Select a node (or clear selection)
 * @param id - ID of the node to select (null to clear)
 * @param addToSelection - If true, add to existing selection instead of replacing
 */
export function selectNode(id: string | null, addToSelection: boolean = false): void {
    if (!addToSelection) {
        // Clear all selections
        document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
        interaction.selectedIds = [];
        interaction.selectedId = null;
    }

    if (id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('selected');
            el.style.zIndex = String(++appState.zIndexCounter);
            const d = appState.fields.find((f: NodeData) => f.id === id);
            if (d) d.zIndex = appState.zIndexCounter;

            // Add to selection array if not already there
            if (!interaction.selectedIds.includes(id)) {
                interaction.selectedIds.push(id);
            }
            interaction.selectedId = id; // Keep for backwards compatibility
        }
    }
}
