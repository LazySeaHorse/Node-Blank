/**
 * Compute Engine Singleton
 * A shared compute engine instance for all Math+ nodes.
 */
import type { ComputeEngine, BoxedExpression } from '@cortex-js/compute-engine';

export interface EvaluationResult {
    result: string;
    isAssignment: boolean;
    error: string | null;
}

// We hold a reference to the ComputeEngine instance
let engineInstance: ComputeEngine | null = null;
let engineReady = false;
type EngineCallback = (engine: ComputeEngine) => void;
const pendingCallbacks: EngineCallback[] = [];

/**
 * Initialize the compute engine asynchronously.
 * Call this once at app startup.
 */
export async function initComputeEngine(): Promise<ComputeEngine> {
    if (engineInstance) return engineInstance;

    try {
        // Dynamic import for code splitting
        const { ComputeEngine } = await import('@cortex-js/compute-engine');
        engineInstance = new ComputeEngine();
        engineReady = true;

        // Execute pending callbacks
        if (engineInstance) {
            const instance = engineInstance;
            pendingCallbacks.forEach(cb => cb(instance));
        }
        pendingCallbacks.length = 0;

        console.log('Compute Engine initialized successfully');
        return engineInstance;
    } catch (error) {
        console.error('Failed to initialize Compute Engine:', error);
        throw error;
    }
}

/**
 * Get the compute engine instance.
 * Returns null if not yet initialized.
 */
export function getComputeEngine(): ComputeEngine | null {
    return engineInstance;
}

/**
 * Check if the engine is ready.
 */
export function isEngineReady(): boolean {
    return engineReady;
}

/**
 * Register a callback to be called when engine is ready.
 * If already ready, callback is called immediately.
 */
export function onEngineReady(callback: EngineCallback): void {
    if (engineReady && engineInstance) {
        callback(engineInstance);
    } else {
        pendingCallbacks.push(callback);
    }
}

/**
 * Evaluate a LaTeX expression using the compute engine.
 * @param {string} latex - The LaTeX expression to evaluate
 */
export function evaluateLatex(latex: string): EvaluationResult {
    if (!engineInstance) {
        return { result: '', isAssignment: false, error: 'Engine not ready' };
    }

    try {
        // Parse the LaTeX
        const expr = engineInstance.parse(latex);

        if (!expr || expr.isNothing) {
            return { result: '', isAssignment: false, error: null };
        }

        // Check if it's an assignment (uses := operator)
        // The Compute Engine represents := as "Assign"
        const isAssignment = expr.head === 'Assign';

        // Evaluate the expression
        const evaluated = expr.evaluate();

        // Get the result as LaTeX
        const resultLatex = evaluated.latex || '';

        return {
            result: resultLatex,
            isAssignment,
            error: null
        };
    } catch (error: any) {
        return {
            result: '',
            isAssignment: false,
            error: error.message || 'Evaluation error'
        };
    }
}

/**
 * Get all currently defined symbols/variables.
 * @returns {Map<string, any>} Map of symbol names to their values
 */
export function getDefinedSymbols(): Map<string, any> {
    if (!engineInstance) return new Map();

    const symbols = new Map<string, any>();
    // Access the global scope's symbols.
    // Note: accessing context directly might depend on version internal structure
    try {
        const context = engineInstance.context;
        if (context) {
            // In some versions, it's context.ids or similar. 
            // We'll try to iterate if possible/known, otherwise return empty for now if strict.
            // For now, let's treat it as any to avoid build errors if definitions mismatch.
            const ctxAny = context as any;
            if (ctxAny.ids) {
                for (const [name, def] of ctxAny.ids) {
                    if (def && def.value !== undefined) {
                        symbols.set(name, def.value);
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Could not retrieve symbols:', e);
    }

    return symbols;
}
