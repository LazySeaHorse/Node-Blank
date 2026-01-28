/**
 * Application State Management with Reactive Signals
 * 100% backwards compatible - all existing code works unchanged
 */
import { signal, computed, effect, batch, Signal, ReadonlySignal } from '@preact/signals-core';
import { DEFAULT_TOOL_CONFIG } from '@utils/toolRegistry';
import type {
    NodeData,
    PanState,
    ToolConfig,
    InteractionState,
    WorldCoordinates
} from '@/types';

// Load config from localStorage
const savedConfig = localStorage.getItem('canvas_tool_config');
const initialToolConfig: ToolConfig = savedConfig ? JSON.parse(savedConfig) : DEFAULT_TOOL_CONFIG;

// ============================================================================
// CORE SIGNALS (Internal - use appState for access)
// ============================================================================
export const signals = {
    currentCanvasId: signal<string | null>(null),
    currentCanvasName: signal<string>('Untitled'),
    scale: signal<number>(1),
    panX: signal<number>(0),
    panY: signal<number>(0),
    mode: signal<string>('math'),
    fields: signal<NodeData[]>([]),
    zIndexCounter: signal<number>(1),
    toolConfig: signal<ToolConfig>(initialToolConfig),
    searchQuery: signal<string>(''),
    isSearchOpen: signal<boolean>(false),
    searchMatchCount: signal<number>(0)
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
    pan: computed<PanState>(() => ({
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
    get currentCanvasId(): string | null {
        return signals.currentCanvasId.value;
    },
    set currentCanvasId(v: string | null) {
        signals.currentCanvasId.value = v;
    },

    // currentCanvasName
    get currentCanvasName(): string {
        return signals.currentCanvasName.value;
    },
    set currentCanvasName(v: string) {
        signals.currentCanvasName.value = v;
    },

    // scale
    get scale(): number {
        return signals.scale.value;
    },
    set scale(v: number) {
        signals.scale.value = v;
    },

    // pan - Returns {x, y} object
    get pan(): PanState {
        return computedValues.pan.value;
    },
    set pan(v: PanState) {
        // Update both panX and panY in a single batch
        // This prevents double-rendering
        batch(() => {
            signals.panX.value = v.x;
            signals.panY.value = v.y;
        });
    },

    // mode
    get mode(): string {
        return signals.mode.value;
    },
    set mode(v: string) {
        signals.mode.value = v;
    },

    // fields - Returns plain array
    get fields(): NodeData[] {
        return signals.fields.value;
    },
    set fields(v: NodeData[]) {
        signals.fields.value = v;
    },

    // zIndexCounter
    get zIndexCounter(): number {
        return signals.zIndexCounter.value;
    },
    set zIndexCounter(v: number) {
        signals.zIndexCounter.value = v;
    },

    // toolConfig
    get toolConfig(): ToolConfig {
        return signals.toolConfig.value;
    },
    set toolConfig(v: ToolConfig) {
        signals.toolConfig.value = v;
    }
};

// ============================================================================
// INTERACTION STATE (Unchanged - ephemeral UI state doesn't need signals)
// ============================================================================
export const interaction: InteractionState = {
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
export function screenToWorld(x: number, y: number): WorldCoordinates {
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