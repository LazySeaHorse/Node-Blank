/**
 * Script Node Organism (Sandboxed JavaScript Execution)
 * Provides a code editor with Web Worker-based script execution
 */
import { interaction } from '../../state/appState.ts';
import { createIconElement } from '../../utils/icons.ts';
import { createNodeContainer } from '../../utils/nodeUI.ts';
import type { NodeData, SelectNodeFn } from '../../src/types';

type ConsoleType = 'log' | 'error' | 'warn' | 'info';

/**
 * Creates a script node for the canvas with sandboxed JS execution
 * @param data - Node data containing JavaScript code
 * @param onSelect - Selection callback
 * @returns HTMLElement container with the script editor
 */
export function createScriptNode(data: NodeData, onSelect: SelectNodeFn): HTMLElement {
    const div = createNodeContainer(data, {
        flex: true,
        withResize: true,
        className: 'border-border-base'
    });

    // Header
    const header = document.createElement('div');
    header.className = 'p-2 px-3 bg-surface-hover border-b border-border-base flex justify-between items-center cursor-grab';

    const title = document.createElement('span');
    title.innerHTML = 'JS SANDBOX';
    title.className = 'text-xs font-semibold text-text-secondary uppercase tracking-wider';

    const controls = document.createElement('div');
    controls.className = 'flex gap-2';

    const runBtn = document.createElement('button');
    runBtn.className = 'bg-accent text-white border-none px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent),black_10%)] flex items-center gap-1';

    // Add icon
    const icon = createIconElement('play', 12);
    icon.style.color = 'currentColor';
    runBtn.appendChild(icon);
    runBtn.appendChild(document.createTextNode('Run'));

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'bg-surface text-text-secondary border border-border-base px-2.5 py-1 rounded text-xs cursor-pointer transition-all duration-200 hover:bg-surface-hover hover:border-text-secondary hover:text-text-primary';

    controls.appendChild(runBtn);
    controls.appendChild(clearBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // Body container
    const body = document.createElement('div');
    body.className = 'flex flex-col flex-1 p-0 min-h-0 min-w-0';

    // Code Editor Area
    const editor = document.createElement('textarea');
    editor.value = data.content || "// console.log('Hello World');";
    editor.className = 'mouse-interactive flex-1 bg-surface text-text-primary border-none border-b border-border-base p-3 font-mono text-[13px] leading-relaxed resize-none outline-none w-full';
    editor.placeholder = "// Write JavaScript here...";

    // Console Output Area
    const consoleOutput = document.createElement('div');
    consoleOutput.className = 'mouse-interactive h-[100px] bg-surface-active text-text-secondary font-mono text-xs p-2 px-3 overflow-y-auto border-t border-border-base whitespace-pre-wrap';

    body.appendChild(editor);
    body.appendChild(consoleOutput);

    div.appendChild(header);
    div.appendChild(body);

    // State management
    let worker: Worker | null = null;

    /**
     * Log a message to the console output
     */
    const logToConsole = (args: any[], type: ConsoleType = 'log') => {
        const line = document.createElement('div');
        line.className = 'border-b border-border-base py-1 text-text-primary';

        if (type === 'error') {
            line.classList.add('text-red-500', 'bg-red-500/10');
        } else if (type === 'warn') {
            line.classList.add('text-amber-600', 'bg-amber-600/10');
        }

        // Convert args to string representation
        const msg = args.map((arg: any) => {
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

    /**
     * Run the script in a sandboxed Web Worker
     */
    const runScript = () => {
        // Terminate existing worker if any
        if (worker) worker.terminate();

        const userCode = editor.value;

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

        worker.onmessage = (e: MessageEvent) => {
            const { type, args } = e.data as { type: ConsoleType; args: any[] };
            logToConsole(args, type);
        };

        worker.onerror = (e: ErrorEvent) => {
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

    // Save content on change using the blur event
    editor.addEventListener('blur', () => {
        data.content = editor.value;
    });

    return div;
}
