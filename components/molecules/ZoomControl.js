/**
 * Zoom Control Molecule
 */
export function createZoomControl({ onZoomIn, onZoomOut, onZoomReset, onFullReset, initialZoom = 100 }) {
    const container = document.createElement('div');
    container.className = 'zoom-controls';

    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'zoom-btn zoom-btn-top';
    zoomInBtn.textContent = '+';
    zoomInBtn.addEventListener('click', onZoomIn);

    const indicator = document.createElement('button');
    indicator.id = 'zoom-indicator';
    indicator.className = 'zoom-indicator';
    indicator.textContent = `${initialZoom}%`;
    let clickTimeout;
    indicator.addEventListener('click', (e) => {
        if (e.detail === 1) {
            clickTimeout = setTimeout(() => {
                onZoomReset();
            }, 250);
        } else if (e.detail === 2) {
            clearTimeout(clickTimeout);
            onFullReset();
        }
    });

    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'zoom-btn zoom-btn-bottom';
    zoomOutBtn.textContent = '-';
    zoomOutBtn.addEventListener('click', onZoomOut);

    container.appendChild(zoomInBtn);
    container.appendChild(indicator);
    container.appendChild(zoomOutBtn);

    return container;
}
