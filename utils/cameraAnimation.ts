import { appState, batch } from '../state/appState.ts';
import * as d3 from 'd3';
import type { PanState } from '../src/types/index.js';

let activeTimer: d3.Timer | null = null;

/**
 * Stop any active animation.
 * Should be called on user interaction (mouse, touch, wheel).
 */
export function cancelAnimation(): void {
    if (activeTimer) {
        activeTimer.stop();
        activeTimer = null;
    }
}

/**
 * Smoothly animate the camera to a target scale and pan.
 * @param targetScale - The zoom level to animate to
 * @param targetPan - The x/y coordinates to animate to
 * @param duration - Animation duration in ms
 */
export function animateTo(targetScale: number, targetPan: PanState, duration: number = 750): void {
    // 1. Cancel any existing animation
    cancelAnimation();

    // Capture starting state
    const startScale = appState.scale;
    const startPan = { ...appState.pan };

    // Create interpolators
    const interpolateScale = d3.interpolate(startScale, targetScale);
    const interpolatePanX = d3.interpolate(startPan.x, targetPan.x);
    const interpolatePanY = d3.interpolate(startPan.y, targetPan.y);

    // D3 v6+ syntax: uses functions directly
    const ease = d3.easeCubicOut;

    // 3. Start timer
    activeTimer = d3.timer((elapsed) => {
        // Calculate progress (0 to 1)
        const t = Math.min(1, ease(elapsed / duration));

        // Update state
        batch(() => {
            appState.scale = interpolateScale(t);
            appState.pan = {
                x: interpolatePanX(t),
                y: interpolatePanY(t)
            };
        });

        // 4. Cleanup when done
        if (t >= 1) {
            cancelAnimation();
            return true; // Stop the timer
        }
    });
}