// ============================================================================
// MODULE DECLARATIONS
// ============================================================================

declare module '*.js';

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
