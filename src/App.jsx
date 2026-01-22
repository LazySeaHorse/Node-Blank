/**
 * Root Application Component
 * 
 * Currently wraps the legacy vanilla JS application.
 * Migration Strategy: Gradually replace internal logic with Preact components.
 */
import { useEffect, useRef } from 'preact/hooks';
import { MathCanvasApp } from '../app.js';

export function App() {
    const rootRef = useRef(null);
    const appInstance = useRef(null);

    useEffect(() => {
        // Initialize the legacy app once
        if (rootRef.current && !appInstance.current) {
            appInstance.current = new MathCanvasApp();
            appInstance.current.init(rootRef.current);

            // Allow global access for debugging/legacy scripts if needed
            window.nodeBlankApp = appInstance.current;
        }
    }, []);

    // The legacy app expects to take over the container completely
    return (
        <div
            ref={rootRef}
            id="app-legacy-root"
            style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
        />
    );
}
