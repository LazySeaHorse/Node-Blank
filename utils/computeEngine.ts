/**
 * Compute Engine Singleton
 * A shared compute engine instance for all Math+ nodes.
 * Variables defined in one node are accessible to all others.
 */

// Define simplified types for the potentially untyped library
interface ComputeEngineInstance {
    parse: (latex: string) => BoxedExpression | null;
    evaluate: (expr: any) => any;
    context: PropertyMap;
    [key: string]: any;
}

interface BoxedExpression {
    isNothing: boolean;
    head: string;
    evaluate: () => BoxedExpression;
    latex: string;
    value: any;
    [key: string]: any;
}

interface PropertyMap {
    ids?: Map<string, { value: any }>;
}

export interface EvaluationResult {
    result: string;
    isAssignment: boolean;
    error: string | null;
}

let engineInstance: ComputeEngineInstance | null = null;
let engineReady = false;
type EngineCallback = (engine: ComputeEngineInstance) => void;
const pendingCallbacks: EngineCallback[] = [];

/**
 * Initialize the compute engine asynchronously.
 * Call this once at app startup.
 */
export async function initComputeEngine(): Promise<ComputeEngineInstance> {
    if (engineInstance) return engineInstance;

    try {
        // Dynamic import of the compute engine
        // @ts-ignore - Importing local JS file without declaration
        const module = await import('../src/lib/compute-engine.js');
        const { ComputeEngine } = module;
        engineInstance = (new ComputeEngine() as unknown) as ComputeEngineInstance;
        engineReady = true;

        // Execute any pending callbacks
        if (engineInstance) {
            const instance = engineInstance;
            pendingCallbacks.forEach(cb => cb(instance));
        }
        pendingCallbacks.length = 0;

        console.log('Compute Engine initialized successfully');
        return engineInstance as ComputeEngineInstance;
    } catch (error) {
        console.error('Failed to initialize Compute Engine:', error);
        throw error;
    }
}

/**
 * Get the compute engine instance.
 * Returns null if not yet initialized.
 */
export function getComputeEngine(): ComputeEngineInstance | null {
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
    // Access the global scope's symbols
    // This is a simplified version - the actual API may differ
    try {
        const scope = engineInstance.context;
        if (scope && scope.ids) {
            for (const [name, def] of scope.ids) {
                if (def.value !== undefined) {
                    symbols.set(name, def.value);
                }
            }
        }
    } catch (e) {
        console.warn('Could not retrieve symbols:', e);
    }

    return symbols;
}
