/**
 * Registry of all available tools/nodes in the application.
 * Defines metadata for each tool including label, icon, and type.
 */
import type { NodeType, ToolConfig } from '../src/types/index.js';

export interface Tool {
    id: NodeType;
    label: string;
    icon: string;
    type: 'mode' | 'action';
    description: string;
}

export const TOOLS: Record<NodeType, Tool> = {
    math: {
        id: 'math',
        label: 'Math',
        icon: 'function',
        type: 'mode',
        description: 'Add mathematical equations'
    },
    'math-plus': {
        id: 'math-plus',
        label: 'Math+',
        icon: 'calculator',
        type: 'mode',
        description: 'Compute expressions with global variables'
    },
    text: {
        id: 'text',
        label: 'Text',
        icon: 'type',
        type: 'mode',
        description: 'Add properties markdown text'
    },
    graph: {
        id: 'graph',
        label: 'Graph',
        icon: 'chart',
        type: 'mode',
        description: 'Add 2D function graphs'
    },
    table: {
        id: 'table',
        label: 'Table',
        icon: 'table-2',
        type: 'mode',
        description: 'Add data tables'
    },
    spreadsheet: {
        id: 'spreadsheet',
        label: 'Sheet',
        icon: 'sheet',
        type: 'mode',
        description: 'Add Excel-like spreadsheet'
    },
    image: {
        id: 'image',
        label: 'Image',
        icon: 'image',
        type: 'action',
        description: 'Upload an image'
    },
    video: {
        id: 'video',
        label: 'Video',
        icon: 'video',
        type: 'action',
        description: 'Embed a video'
    },
    js: {
        id: 'js',
        label: 'Script',
        icon: 'terminal',
        type: 'mode',
        description: 'Run JavaScript code'
    }
};

export const DEFAULT_TOOL_CONFIG: ToolConfig = {
    toolbar: ['image', 'text', 'video'],
    more: ['graph', 'js', 'math', 'math-plus', 'spreadsheet', 'table']
};