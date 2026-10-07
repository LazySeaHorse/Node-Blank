import { javascript } from '@codemirror/lang-javascript';
import { githubDarkInit, githubLightInit } from '@uiw/codemirror-theme-github';
import CodeMirror from '@uiw/react-codemirror';
import type { NodeProps } from '@xyflow/react';
import { Play, SquareTerminal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReadOnly } from '@/canvas/readOnly';
import { cn } from '@/lib/cn';
import type { NodeOf } from '@/model/types';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/ui/Button';
import { NodeShell } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';
import { type LogLevel, type LogLine, runScript } from './sandbox';

const extensions = [javascript()];
/** GitHub syntax colors on the node's own surface, so the editor matches the app theme. */
const surface = {
  background: 'var(--surface)',
  gutterBackground: 'var(--surface)',
  gutterBorder: 'var(--border)',
};
const lightTheme = githubLightInit({ settings: surface });
const darkTheme = githubDarkInit({ settings: surface });

const levelStyles: Record<LogLevel, string> = {
  log: 'text-fg',
  info: 'text-fg',
  result: 'text-accent',
  warn: 'bg-amber-500/10 text-amber-600',
  error: 'bg-danger/10 text-danger',
  system: 'text-muted italic',
};

export default function CodeNode({ id, data, selected }: NodeProps<NodeOf<'code'>>) {
  const readOnly = useReadOnly();
  const dark = useUiStore((s) => s.theme === 'dark');
  const update = useUpdateNodeData<'code'>(id);
  const [output, setOutput] = useState<LogLine[]>([]);
  const stopRef = useRef<() => void>(undefined);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => stopRef.current?.(), []);

  useEffect(() => {
    if (output.length) outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [output]);

  const run = () => {
    stopRef.current?.();
    setOutput([]);
    stopRef.current = runScript(data.source, (line) => setOutput((lines) => [...lines, line]));
  };

  const clear = () => {
    stopRef.current?.();
    setOutput([]);
  };

  return (
    <NodeShell
      selected={selected}
      title="Script"
      icon={SquareTerminal}
      resize={{ minWidth: 280, minHeight: 200 }}
      actions={
        <>
          <Button className="h-6 px-2 text-xs" onClick={clear}>
            Clear
          </Button>
          <Button variant="primary" className="h-6 px-2 text-xs" onClick={run}>
            <Play className="size-3" /> Run
          </Button>
        </>
      }
    >
      <CodeMirror
        value={data.source}
        onChange={(source) => update({ source })}
        extensions={extensions}
        theme={dark ? darkTheme : lightTheme}
        editable={!readOnly}
        basicSetup={{ foldGutter: false }}
        height="100%"
        className="nodrag nowheel nokey min-h-0 flex-1 overflow-hidden text-[13px]"
      />
      <div
        ref={outputRef}
        className="nodrag nowheel h-28 shrink-0 overflow-y-auto border-t border-border bg-surface-2 font-mono text-xs select-text"
      >
        {output.length === 0 ? (
          <p className="px-3 py-1.5 text-muted">{readOnly ? 'Output' : 'Press Run to execute'}</p>
        ) : (
          output.map((line, index) => (
            <pre
              // biome-ignore lint/suspicious/noArrayIndexKey: append-only log.
              key={index}
              className={cn('border-b border-border px-3 py-1 whitespace-pre-wrap', levelStyles[line.level])}
            >
              {line.text}
            </pre>
          ))
        )}
      </div>
    </NodeShell>
  );
}
