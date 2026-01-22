/**
 * Node Factory - Creates and manages nodes
 */
import { appState, interaction } from '../state/appState.js';
import { createMathNode } from '../components/organisms/MathNode.js';
import { createMathPlusNode } from '../components/organisms/MathPlusNode.js';
import { createTextNode } from '../components/organisms/TextNode.js';
import { createGraphNode } from '../components/organisms/GraphNode.js';
import { createImageNode } from '../components/organisms/ImageNode.js';
import { createTableNode } from '../components/organisms/TableNode.js';
import { createVideoNode } from '../components/organisms/VideoNode.js';
import { createScriptNode } from '../components/organisms/ScriptNode.js';
import { createSpreadsheetNode } from '../components/organisms/SpreadsheetNode.js';

export function createNode(x, y, type = appState.mode, content = "") {
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // Default contents
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

    const nodeData = {
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

export function renderNode(data, world, selectNodeFn) {
    let nodeElement;

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
    nodeElement.addEventListener('mousedown', (e) => {
        // 1. Don't drag if clicking resize handle
        if (e.target.classList.contains('resize-handle')) {
            return;
        }

        // 2. Identify if we clicked an interactive child
        const targetTag = e.target.tagName.toLowerCase();
        const interactiveTags = ['input', 'textarea', 'math-field', 'button', 'select', 'a'];

        // Jspreadsheet/jSuites/MathLive specific selectors
        const isJssElement = e.target.closest('.jss_container') ||
            e.target.closest('.jexcel_container') ||
            e.target.closest('.jss') ||
            e.target.closest('.jexcel') ||
            e.target.closest('.jcontextmenu') ||
            e.target.closest('.spreadsheet-content');

        const isInteractive = interactiveTags.includes(targetTag) ||
            e.target.closest('.md-editor') ||
            e.target.closest('.mouse-interactive') ||
            e.target.closest('.spreadsheet-content') ||
            isJssElement ||
            e.target.closest('.graph-target') ||
            targetTag === 'math-field' ||
            e.target.closest('math-field');

        // 3. Selection Logic: Always select the node on mousedown if not dragging from elsewhere
        // But ONLY for the primary mouse button (0)
        if (e.button === 0 && !interaction.selectedIds.includes(data.id)) {
            selectNodeFn(data.id);
        }

        // 4. If it's an interactive element, we stop here and let the event bubble/perform default actions
        if (isInteractive) {
            // We NO LONGER call e.stopPropagation() here because Jspreadsheet and other libraries
            // often rely on document-level listeners to manage focus and state.
            // Since CanvasWorld and D3 already have filters for .node, bubbling is safe.
            return;
        }

        // 5. Only left button for node dragging (non-interactive areas)
        if (e.button !== 0) return;

        interaction.isDraggingNode = true;
        document.body.classList.add('canvas-interacting');
        interaction.selectedId = data.id;

        // Mark all selected nodes as dragging
        interaction.selectedIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('dragging');
        });

        // For non-interactive areas, we block default choice/selection to enable clean dragging
        e.preventDefault();
        e.stopPropagation();
    });

    world.appendChild(nodeElement);
}

export function removeNode(id) {
    appState.fields = appState.fields.filter(f => f.id !== id);
    const el = document.getElementById(id);
    if (el) el.remove();

    // Remove from selection arrays
    interaction.selectedIds = interaction.selectedIds.filter(sid => sid !== id);
    if (interaction.selectedId === id) {
        interaction.selectedId = interaction.selectedIds[0] || null;
    }
}

export function selectNode(id, addToSelection = false) {
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
            el.style.zIndex = ++appState.zIndexCounter;
            const d = appState.fields.find(f => f.id === id);
            if (d) d.zIndex = appState.zIndexCounter;

            // Add to selection array if not already there
            if (!interaction.selectedIds.includes(id)) {
                interaction.selectedIds.push(id);
            }
            interaction.selectedId = id; // Keep for backwards compatibility
        }
    }
}
