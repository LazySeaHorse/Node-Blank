/**
 * Script Node Organism (Sandboxed)
 */
import { interaction } from '../../state/appState.js';

export function createScriptNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    div.className = 'node node-script';
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex;
    div.style.width = `${data.width || 400}px`;
    div.style.height = `${data.height || 300}px`;

    // Header
    const header = document.createElement('div');
    header.className = 'script-header';

    const title = document.createElement('span');
    title.innerHTML = 'JS Sandbox';
    title.className = 'script-title';

    const controls = document.createElement('div');
    controls.className = 'script-controls';

    const runBtn = document.createElement('button');
    runBtn.textContent = '▶ Run';
    runBtn.className = 'script-run-btn';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'script-clear-btn';

    controls.appendChild(runBtn);
    controls.appendChild(clearBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // Body container
    const body = document.createElement('div');
    body.className = 'script-body';

    // Code Editor Area
    const editor = document.createElement('textarea');
    editor.value = data.content || "// console.log('Hello World');";
    editor.className = 'script-editor mouse-interactive';
    editor.placeholder = "// Write JavaScript here...";

    // Console Output Area
    const consoleOutput = document.createElement('div');
    consoleOutput.className = 'script-console mouse-interactive';

    body.appendChild(editor);
    body.appendChild(consoleOutput);

    // Resize Handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.dataset.nodeId = data.id;
    resizeHandle.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 15px;
        height: 15px;
        background: linear-gradient(135deg, transparent 50%, #94a3b8 50%);
        cursor: se-resize;
        z-index: 20;
    `;

    div.appendChild(header);
    div.appendChild(body);
    div.appendChild(resizeHandle);

    // Prevent dragging when typing
    editor.addEventListener('mousedown', e => e.stopPropagation());
    consoleOutput.addEventListener('mousedown', e => e.stopPropagation());
    // Also stop propagation on buttons so we don't drag when clicking them
    runBtn.addEventListener('mousedown', e => e.stopPropagation());
    clearBtn.addEventListener('mousedown', e => e.stopPropagation());

    // State management
    let worker = null;

    const logToConsole = (args, type = 'log') => {
        const line = document.createElement('div');
        line.className = 'console-line';

        if (type === 'error') {
            line.classList.add('console-error');
        } else if (type === 'warn') {
            line.classList.add('console-warn');
        }

        // Convert args to string representation
        const msg = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return '[Object]';
                }
            }
            return String(arg);
        }).join(' ');

        line.textContent = `> ${msg}`;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    };

    const runScript = () => {
        // Terminate existing worker if any
        if (worker) worker.terminate();

        const userCode = editor.value;
        const width = data.width || 400;
        const height = data.height || 300;

        // Create worker blob
        const workerScript = `
            self.console = {
                log: (...args) => self.postMessage({ type: 'log', args }),
                error: (...args) => self.postMessage({ type: 'error', args }),
                warn: (...args) => self.postMessage({ type: 'warn', args }),
                info: (...args) => self.postMessage({ type: 'info', args })
            };

            self.onmessage = function(e) {
                try {
                   // Execute user code
                   const result = eval(e.data);
                   if (result !== undefined) {
                       self.console.log(result);
                   }
                } catch (err) {
                    self.console.error(err.toString());
                }
            };
        `;

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);

        worker = new Worker(url);

        worker.onmessage = (e) => {
            const { type, args } = e.data;
            logToConsole(args, type);
        };

        worker.onerror = (e) => {
            logToConsole([e.message], 'error');
        };

        // Send code to worker
        worker.postMessage(userCode);

        // Clean up URL
        URL.revokeObjectURL(url);
    };

    runBtn.onclick = () => {
        logToConsole(['Running script...'], 'info');
        runScript();
    };

    clearBtn.onclick = () => {
        consoleOutput.innerHTML = '';
        if (worker) {
            worker.terminate();
            worker = null;
        }
    };

    // Save content on change using the blur event similar to TextNode
    editor.addEventListener('blur', () => {
        data.content = editor.value;
    });

    // Also save on keyup for debounced immediate save feeling if desired, 
    // but blur is safer for performance in simple apps.
    // Let's stick to blur for data consistency, but maybe we want to save width/height too if resized

    // The main canvas event loop handles x/y updates. 
    // Resizing is handled by the interaction manager updates to data.width/height
    // We just need to ensure the element reflects those data changes if re-rendered.
    // But since this element is created once and mutated, we should observe size changes?
    // The CanvasWorld updates style directly on drag/resize. 
    // BUT for custom styling like we have here (flex layout), we rely on outer div resizing.
    // Our CSS `flex: 1` on body and editor should handle it.

    return div;
}
