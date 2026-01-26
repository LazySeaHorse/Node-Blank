// ============================================================================
// MODULE DECLARATIONS
// ============================================================================

declare module '*.js' {
    const value: any;
    export default value;
    export const appState: any;
    export const signals: any;
    export const interaction: any;
    export const effect: any;
    export const TOOLS: any;
    export const createToolConfigModal: any;
    export const createNodeContainer: any;
    export const BASE_NODE_CLASSES: any;
    export const mdRenderer: any;
    export const createNodeHeader: any;
    export const createButtonGroup: any;
    export const createIconElement: any;
    export const evaluateLatex: any;
    export const isEngineReady: any;
    export const onEngineReady: any;
    // Add other specific exports if needed
}

// ============================================================================
// JSX INTRINSIC ELEMENTS (Custom Web Components)
// ============================================================================

declare namespace preact.JSX {
    interface IntrinsicElements {
        /** MathLive math field custom element */
        'math-field': {
            value?: string;
            'virtual-keyboard-mode'?: 'manual' | 'onfocus' | 'off';
            'smart-mode'?: string | boolean;
            class?: string;
            className?: string;
            style?: string | Record<string, string>;
            ref?: preact.Ref<HTMLElement>;
            onInput?: (e: Event) => void;
            onFocus?: (e: FocusEvent) => void;
            onBlur?: (e: FocusEvent) => void;
            onKeyDown?: (e: KeyboardEvent) => void;
            [key: string]: any;
        };
    }
}
