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
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.backgroundColor = '#ffffff'; // White background
    div.style.color = '#1e293b'; // Slate 800
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    div.style.overflow = 'hidden';
    div.style.border = '1px solid #e2e8f0'; // Slate 200

    // Header
    const header = document.createElement('div');
    header.style.padding = '8px 12px';
    header.style.backgroundColor = '#f8fafc'; // Slate 50
    header.style.borderBottom = '1px solid #e2e8f0';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.cursor = 'grab';

    const title = document.createElement('span');
    title.innerHTML = 'JS Sandbox';
    title.style.fontSize = '12px';
    title.style.fontWeight = '600';
    title.style.color = '#64748b'; // Slate 500

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';

    const runBtn = document.createElement('button');
    runBtn.textContent = '▶ Run';
    runBtn.style.backgroundColor = '#3b82f6'; // Blue 500
    runBtn.style.color = 'white';
    runBtn.style.border = 'none';
    runBtn.style.padding = '4px 10px';
    runBtn.style.borderRadius = '4px';
    runBtn.style.fontSize = '12px';
    runBtn.style.fontWeight = '500';
    runBtn.style.cursor = 'pointer';
    runBtn.style.transition = 'background 0.2s';
    runBtn.onmouseover = () => runBtn.style.backgroundColor = '#2563eb';
    runBtn.onmouseout = () => runBtn.style.backgroundColor = '#3b82f6';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.backgroundColor = 'white';
    clearBtn.style.color = '#64748b';
    clearBtn.style.border = '1px solid #cbd5e1';
    clearBtn.style.padding = '4px 10px';
    clearBtn.style.borderRadius = '4px';
    clearBtn.style.fontSize = '12px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.transition = 'all 0.2s';
    clearBtn.onmouseover = () => { clearBtn.style.background = '#f1f5f9'; clearBtn.style.borderColor = '#94a3b8'; };
    clearBtn.onmouseout = () => { clearBtn.style.background = 'white'; clearBtn.style.borderColor = '#cbd5e1'; };

    controls.appendChild(runBtn);
    controls.appendChild(clearBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // Body container
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.flex = '1';
    body.style.padding = '0';
    body.style.minHeight = '0'; // Important for flex scrolling

    // Code Editor Area
    const editor = document.createElement('textarea');
    editor.value = data.content || "// console.log('Hello World');";
    editor.className = 'script-editor mouse-interactive'; // standard class to prevent dragging if needed
    editor.style.flex = '1';
    editor.style.backgroundColor = '#ffffff';
    editor.style.color = '#334155'; // Slate 700
    editor.style.border = 'none';
    editor.style.borderBottom = '1px solid #e2e8f0';
    editor.style.padding = '12px';
    editor.style.fontFamily = "'Fira Code', 'Roboto Mono', monospace";
    editor.style.fontSize = '13px';
    editor.style.lineHeight = '1.5';
    editor.style.resize = 'none';
    editor.style.outline = 'none';
    editor.placeholder = "// Write JavaScript here...";

    // Console Output Area
    const consoleOutput = document.createElement('div');
    consoleOutput.className = 'script-console mouse-interactive';
    consoleOutput.style.height = '100px';
    consoleOutput.style.backgroundColor = '#f8fafc'; // Slate 50
    consoleOutput.style.color = '#475569'; // Slate 600
    consoleOutput.style.fontFamily = "'Fira Code', 'Roboto Mono', monospace";
    consoleOutput.style.fontSize = '12px';
    consoleOutput.style.padding = '8px 12px';
    consoleOutput.style.overflowY = 'auto';
    consoleOutput.style.borderTop = '1px solid #e2e8f0';
    consoleOutput.style.whiteSpace = 'pre-wrap';

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
        line.style.borderBottom = '1px solid #f1f5f9';
        line.style.padding = '4px 0';

        if (type === 'error') {
            line.style.color = '#ef4444';
            line.style.backgroundColor = '#fef2f2';
        } else if (type === 'warn') {
            line.style.color = '#d97706';
            line.style.backgroundColor = '#fffbeb';
        } else {
            line.style.color = '#334155';
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
