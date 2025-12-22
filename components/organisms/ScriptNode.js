/**
 * Script Node Organism (Sandboxed)
 */
import { interaction } from '../../state/appState.js';
import { createIconElement } from '../../utils/icons.js';

export function createScriptNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    // Base node
    // .node-script { display: flex; flex-direction: column; bg: var(--bg-surface); color: var(--text-primary); radius: var(--radius-lg); shadow: var(--shadow-md); overflow: hidden; border: 1px solid var(--border-base); }
    div.className = 'node absolute rounded-lg transition-shadow duration-150 bg-surface text-text-primary shadow-md border border-border-base [&.selected]:shadow-focus [&.selected]:shadow-lg [&.selected]:z-[1000] [&.selected]:border-accent [&.dragging]:cursor-grabbing [&.dragging]:opacity-90 flex flex-col overflow-hidden';
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex;
    div.style.width = `${data.width || 400}px`;
    div.style.height = `${data.height || 300}px`;

    // Header
    const header = document.createElement('div');
    // .script-header { padding: 8px 12px; bg: var(--bg-surface-hover); border-bottom: 1px solid var(--border-base); flex; justify-between; align-center; cursor: grab; }
    header.className = 'p-2 px-3 bg-surface-hover border-b border-border-base flex justify-between items-center cursor-grab';

    const title = document.createElement('span');
    title.innerHTML = 'JS SANDBOX';
    // .script-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
    title.className = 'text-xs font-semibold text-text-secondary uppercase tracking-wider';


    const controls = document.createElement('div');
    // .script-controls { display: flex; gap: 8px; }
    controls.className = 'flex gap-2';

    const runBtn = document.createElement('button');
    // Using text-white explicitly as requested
    runBtn.className = 'bg-accent text-white border-none px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent),black_10%)] flex items-center gap-1';

    // Add icon
    // Add icon
    const icon = createIconElement('play', 12);
    // Ensure icon inherits color
    icon.style.color = 'currentColor';
    runBtn.appendChild(icon);
    runBtn.appendChild(document.createTextNode('Run'));

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    // .script-clear-btn { bg: var(--bg-surface); color: var(--text-secondary); border: 1px solid var(--border-base); padding: 4px 10px; radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
    // hover: bg-surface-hover, border-text-secondary, color-text-primary
    clearBtn.className = 'bg-surface text-text-secondary border border-border-base px-2.5 py-1 rounded text-xs cursor-pointer transition-all duration-200 hover:bg-surface-hover hover:border-text-secondary hover:text-text-primary';

    controls.appendChild(runBtn);
    controls.appendChild(clearBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // Body container
    const body = document.createElement('div');
    // .script-body { display: flex; flex-direction: column; flex: 1; padding: 0; min-height: 0; }
    body.className = 'flex flex-col flex-1 p-0 min-h-0';

    // Code Editor Area
    const editor = document.createElement('textarea');
    editor.value = data.content || "// console.log('Hello World');";
    // .script-editor { flex: 1; bg: var(--bg-surface); color: var(--text-primary); border: none; border-bottom: 1px solid var(--border-base); padding: 12px; font-family: monospace; font-size: 13px; line-height: 1.5; resize: none; outline: none; }
    editor.className = 'mouse-interactive flex-1 bg-surface text-text-primary border-none border-b border-border-base p-3 font-mono text-[13px] leading-relaxed resize-none outline-none';
    editor.placeholder = "// Write JavaScript here...";


    // Console Output Area
    const consoleOutput = document.createElement('div');
    // .script-console { height: 100px; bg: var(--bg-surface-active); color: var(--text-secondary); font-family: monospace; font-size: 12px; padding: 8px 12px; overflow-y: auto; border-top: 1px solid var(--border-base); white-space: pre-wrap; }
    // Note: CSS had border-top, but script-editor had border-bottom. Double border? 
    // Usually one is enough. Let's keep border-top here.
    consoleOutput.className = 'mouse-interactive h-[100px] bg-surface-active text-text-secondary font-mono text-xs p-2 px-3 overflow-y-auto border-t border-border-base whitespace-pre-wrap';

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
        background: linear-gradient(135deg, transparent 50%, var(--color-slate-400) 50%);
        cursor: se-resize;
        z-index: 20;
    `;

    div.appendChild(header);
    div.appendChild(body);
    div.appendChild(resizeHandle);

    // State management
    let worker = null;

    const logToConsole = (args, type = 'log') => {
        const line = document.createElement('div');
        // .console-line { border-bottom: 1px solid var(--border-base); padding: 4px 0; color: var(--text-primary); }
        line.className = 'border-b border-border-base py-1 text-text-primary';

        if (type === 'error') {
            // .console-error { color: var(--color-red-500); background-color: color-mix(in srgb, var(--color-red-500), transparent 90%); }
            line.classList.add('text-red-500', 'bg-red-500/10');
        } else if (type === 'warn') {
            // .console-warn { color: #d97706; background-color: color-mix(in srgb, #d97706, transparent 90%); }
            line.classList.add('text-amber-600', 'bg-amber-600/10');
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

    return div;
}
