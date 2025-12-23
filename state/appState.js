/**
 * Application State Management with Reactive Signals
 * 100% backwards compatible - all existing code works unchanged
 */
import { signal, computed, effect, batch } from '@preact/signals-core';
import { DEFAULT_TOOL_CONFIG } from '../utils/toolRegistry.js';

// Load config from localStorage
const savedConfig = localStorage.getItem('canvas_tool_config');
const initialToolConfig = savedConfig ? JSON.parse(savedConfig) : DEFAULT_TOOL_CONFIG;


// ============================================================================
// CORE SIGNALS (Internal - use appState for access)
// ============================================================================
export const signals = {
    currentCanvasId: signal(null),
    currentCanvasName: signal('Untitled'),
    scale: signal(1),
    panX: signal(0),
    panY: signal(0),
    mode: signal('math'),
    fields: signal([]),
    zIndexCounter: signal(1),
    toolConfig: signal(initialToolConfig),
    searchQuery: signal(''),
    isSearchOpen: signal(false),
    searchMatchCount: signal(0)
};

// Persist tool config changes
effect(() => {
    localStorage.setItem('canvas_tool_config', JSON.stringify(signals.toolConfig.value));
});

// ============================================================================
// COMPUTED VALUES (Auto-update when dependencies change)
// ============================================================================
export const computedValues = {
    // Combine panX and panY into a {x, y} object
    pan: computed(() => ({
        x: signals.panX.value,
        y: signals.panY.value
    })),

    // Transform data for canvas updates
    transform: computed(() => ({
        scale: signals.scale.value,
        pan: {
            x: signals.panX.value,
            y: signals.panY.value
        }
    }))
};

// ============================================================================
// BACKWARDS COMPATIBILITY LAYER (Public API)
// This makes ALL existing code work without changes!
// ============================================================================
export const appState = {
    // currentCanvasId
    get currentCanvasId() {
        return signals.currentCanvasId.value;
    },
    set currentCanvasId(v) {
        signals.currentCanvasId.value = v;
    },

    // currentCanvasName
    get currentCanvasName() {
        return signals.currentCanvasName.value;
    },
    set currentCanvasName(v) {
        signals.currentCanvasName.value = v;
    },

    // scale
    get scale() {
        return signals.scale.value;
    },
    set scale(v) {
        signals.scale.value = v;
    },

    // pan - Returns {x, y} object
    get pan() {
        return computedValues.pan.value;
    },
    set pan(v) {
        // Update both panX and panY in a single batch
        // This prevents double-rendering
        batch(() => {
            signals.panX.value = v.x;
            signals.panY.value = v.y;
        });
    },

    // mode
    get mode() {
        return signals.mode.value;
    },
    set mode(v) {
        signals.mode.value = v;
    },

    // fields - Returns plain array
    get fields() {
        return signals.fields.value;
    },
    set fields(v) {
        signals.fields.value = v;
    },

    // zIndexCounter
    get zIndexCounter() {
        return signals.zIndexCounter.value;
    },
    set zIndexCounter(v) {
        signals.zIndexCounter.value = v;
    },

    // toolConfig
    get toolConfig() {
        return signals.toolConfig.value;
    },
    set toolConfig(v) {
        signals.toolConfig.value = v;
    }
};

// ============================================================================
// INTERACTION STATE (Unchanged - ephemeral UI state doesn't need signals)
// ============================================================================
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
    resizeNodeId: null,
    aspectRatio: 1
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export function screenToWorld(x, y) {
    const pan = computedValues.pan.value;
    const scale = signals.scale.value;
    return {
        x: (x - pan.x) / scale,
        y: (y - pan.y) / scale
    };
}

// ============================================================================
// EXPORT UTILITIES FOR USE IN APP
// ============================================================================
export { effect, batch };
