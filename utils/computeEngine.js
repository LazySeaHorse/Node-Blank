/**
 * Compute Engine Singleton
 * A shared compute engine instance for all Math+ nodes.
 * Variables defined in one node are accessible to all others.
 */

let engineInstance = null;
let engineReady = false;
const pendingCallbacks = [];

/**
 * Initialize the compute engine asynchronously.
 * Call this once at app startup.
 */
export async function initComputeEngine() {
    if (engineInstance) return engineInstance;

    try {
        // Dynamic import of the compute engine
        const { ComputeEngine } = await import('../src/lib/compute-engine.js');
        engineInstance = new ComputeEngine();
        engineReady = true;

        // Execute any pending callbacks
        pendingCallbacks.forEach(cb => cb(engineInstance));
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
export function getComputeEngine() {
    return engineInstance;
}

/**
 * Check if the engine is ready.
 */
export function isEngineReady() {
    return engineReady;
}

/**
 * Register a callback to be called when engine is ready.
 * If already ready, callback is called immediately.
 */
export function onEngineReady(callback) {
    if (engineReady && engineInstance) {
        callback(engineInstance);
    } else {
        pendingCallbacks.push(callback);
    }
}

/**
 * Evaluate a LaTeX expression using the compute engine.
 * @param {string} latex - The LaTeX expression to evaluate
 * @returns {{ result: string, isAssignment: boolean, error: string | null }}
 */
export function evaluateLatex(latex) {
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
    } catch (error) {
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
export function getDefinedSymbols() {
    if (!engineInstance) return new Map();

    const symbols = new Map();
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
