import type { NodeProps } from '@xyflow/react';
import { ChartSpline, Plus, X } from 'lucide-react';
import { Coordinates, Mafs, Plot, Theme } from 'mafs';
import 'mafs/core.css';
import { useMemo, useRef } from 'react';
import { useReadOnly } from '@/canvas/readOnly';
import { type Engine, useEngine } from '@/lib/math/engine';
import { MathField } from '@/lib/math/MathField';
import { useElementSize } from '@/lib/useElementSize';
import type { NodeOf } from '@/model/types';
import { NodeShell } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';
import { compileFunction } from './compileFunction';

/** First curve uses the theme accent; the rest cycle through Mafs' palette. */
const COLORS = ['var(--accent)', Theme.orange, Theme.blue, Theme.green, Theme.violet, Theme.pink, Theme.red];
const colorAt = (index: number) => COLORS[index % COLORS.length];

export default function GraphNode({ id, data, selected }: NodeProps<NodeOf<'graph'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'graph'>(id);
  const engine = useEngine();
  const plotRef = useRef<HTMLDivElement>(null);
  const { height } = useElementSize(plotRef);
  const { functions } = data;

  const setFunction = (index: number, latex: string) =>
    update({ functions: functions.map((f, i) => (i === index ? latex : f)) });

  return (
    <NodeShell
      selected={selected}
      title="Graph"
      icon={ChartSpline}
      resize={{ minWidth: 260, minHeight: 240 }}
      actions={
        <button
          type="button"
          className="cursor-pointer rounded p-1 hover:bg-surface hover:text-fg"
          onClick={() => update({ functions: [...functions, ''] })}
          aria-label="Add function"
        >
          <Plus className="size-3.5" />
        </button>
      }
    >
      <ul className="shrink-0 divide-y divide-border border-b border-border">
        {functions.map((latex, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: functions are edited in place by position.
          <li key={index} className="flex items-center gap-2 px-3 py-1">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: colorAt(index) }} />
            <span className="text-xs text-muted">y =</span>
            <MathField
              value={latex}
              onChange={(value) => setFunction(index, value)}
              readOnly={readOnly}
              className="min-w-0 flex-1 text-base"
            />
            {!readOnly && functions.length > 1 && (
              <button
                type="button"
                className="nodrag cursor-pointer rounded p-0.5 text-muted hover:text-fg"
                onClick={() => update({ functions: functions.filter((_, i) => i !== index) })}
                aria-label="Remove function"
              >
                <X className="size-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
      <div ref={plotRef} className="nodrag nopan nowheel min-h-0 flex-1">
        {engine && height > 0 && <Plot2D engine={engine} functions={functions} height={height} />}
      </div>
    </NodeShell>
  );
}

function Plot2D({ engine, functions, height }: { engine: Engine; functions: string[]; height: number }) {
  const compiled = useMemo(
    () => functions.map((latex) => compileFunction(engine, latex)),
    [engine, functions],
  );
  return (
    <Mafs height={height} pan zoom viewBox={{ x: [-5, 5], y: [-5, 5] }} preserveAspectRatio={false}>
      <Coordinates.Cartesian />
      {compiled.map((fn, index) =>
        // biome-ignore lint/suspicious/noArrayIndexKey: one plot per function slot.
        fn ? <Plot.OfX key={index} y={fn} color={colorAt(index)} /> : null,
      )}
    </Mafs>
  );
}
