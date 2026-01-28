/**
 * Type Definitions for Node-Blank Canvas Application
 * Phase 5: Full TSX Migration
 */

// ============================================================================
// NODE TYPES
// ============================================================================

/** Available node types in the canvas */
export type NodeType =
    | 'math'
    | 'math-plus'
    | 'text'
    | 'graph'
    | 'image'
    | 'table'
    | 'video'
    | 'spreadsheet'
    | 'js';

/** Core node data structure stored in appState.fields */
export interface NodeData {
    /** Unique identifier for the node */
    id: string;
    /** X position in world coordinates */
    x: number;
    /** Y position in world coordinates */
    y: number;
    /** Node type */
    type: NodeType;
    /** Node content (format varies by type) */
    content: string;
    /** Z-index for stacking */
    zIndex: number;
    /** Optional width for resizable nodes */
    width?: number;
    /** Optional height for resizable nodes */
    height?: number;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/** Selection callback function type */
export type SelectNodeFn = (id: string, addToSelection?: boolean) => void;

/** Base props shared by all node content components */
export interface BaseNodeProps {
    data: NodeData;
    onSelect: SelectNodeFn;
}

/** Props for node container creation */
export interface NodeContainerOptions {
    /** Additional CSS classes to apply */
    className?: string;
    /** Whether to add a resize handle */
    withResize?: boolean;
    /** Whether to use flexbox layout (flex-col overflow-hidden) */
    flex?: boolean;
}

// ============================================================================
// APP STATE TYPES
// ============================================================================

/** Pan coordinates */
export interface PanState {
    x: number;
    y: number;
}

/** Tool configuration for toolbar items */
export interface ToolConfig {
    toolbar: string[];
    more: string[];
}

/** Interaction state for canvas operations */
export interface InteractionState {
    isDraggingCanvas: boolean;
    isDraggingNode: boolean;
    isResizingNode: boolean;
    isSelecting: boolean;
    startPos: { x: number; y: number };
    panStart: { x: number; y: number };
    selectedId: string | null;
    selectedIds: string[];
    activeInput: HTMLElement | null;
    selectionStart: { x: number; y: number };
    dragStartPositions: Map<string, { x: number; y: number }>;
    resizeStartSize: { width: number; height: number };
    resizeNodeId: string | null;
    aspectRatio: number;
}

// ============================================================================
// CANVAS TYPES
// ============================================================================

/** Canvas metadata for saved canvases */
export interface CanvasMeta {
    id: string;
    name: string;
    lastModified: number;
}

/** Full canvas data for save/load */
export interface CanvasData {
    pan: PanState;
    scale: number;
    fields: NodeData[];
    zIndexCounter: number;
}

// ============================================================================
// TABLE NODE SPECIFIC
// ============================================================================

/** Table node content structure */
export interface TableData {
    rows: number;
    cols: number;
    cells: string[][];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Result of screen-to-world coordinate conversion */
export interface WorldCoordinates {
    x: number;
    y: number;
}

// ============================================================================
// FUNCTION TYPES
// ============================================================================

/** createNodeContainer function type */
export type CreateNodeContainerFn = (
    data: NodeData,
    options?: NodeContainerOptions
) => HTMLElement;
