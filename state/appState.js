/**
 * Application State Management
 */
export const appState = {
    currentCanvasId: null,
    currentCanvasName: 'Untitled',
    scale: 1,
    pan: { x: 0, y: 0 },
    mode: 'math', // math | text | graph
    fields: [],   
    zIndexCounter: 1
};

export const interaction = {
    isDraggingCanvas: false,
    isDraggingNode: false,
    isResizingNode: false,
    isSelecting: false,
    startPos: { x: 0, y: 0 },
    panStart: { x: 0, y: 0 },
    selectedId: null,
    selectedIds: [],
    activeInput: null,
    selectionStart: { x: 0, y: 0 },
    dragStartPositions: new Map(),
    resizeStartSize: { width: 0, height: 0 },
    resizeNodeId: null
};

export function screenToWorld(x, y) {
    return {
        x: (x - appState.pan.x) / appState.scale,
        y: (y - appState.pan.y) / appState.scale
    };
}
