import type { NodeProps } from '@xyflow/react';
import { Copy, TriangleAlert } from 'lucide-react';
import { useReadOnly } from '@/canvas/readOnly';
import { copyText } from '@/lib/clipboard';
import { MathField } from '@/lib/math/MathField';
import { Tex } from '@/lib/math/Tex';
import type { NodeOf } from '@/model/types';
import { NodeShell } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';
import type { LineResult } from './evaluate';
import { useMathPlusResults } from './useMathPlusResults';

export default function MathPlusNode({ id, data, selected }: NodeProps<NodeOf<'mathPlus'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'mathPlus'>(id);
  const results = useMathPlusResults(id);

  return (
    <NodeShell
      kind="mathPlus"
      selected={selected}
      customTitle={data.title}
      tint={data.color}
      className="min-w-56"
    >
      <div className="px-3 py-2">
        <MathField
          value={data.latex}
          onChange={(latex) => update({ latex })}
          readOnly={readOnly}
          multiline
          placeholder="a := 2"
        />
      </div>
      {results === undefined ? (
        <p className="border-t border-border px-3 py-2 text-xs text-muted italic">Loading math engine…</p>
      ) : (
        results.length > 0 && (
          <ol className="border-t border-border bg-surface-2/50 px-3 py-2 text-sm">
            {results.map((result, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: results are positional, one per input line.
              <ResultLine key={index} result={result} />
            ))}
          </ol>
        )
      )}
    </NodeShell>
  );
}

function ResultLine({ result }: { result: LineResult }) {
  if (result.error) {
    return (
      <li className="flex items-center gap-1.5 text-xs text-danger">
        <TriangleAlert className="size-3.5" /> {result.error}
      </li>
    );
  }
  const copyButton =
    'nodrag cursor-pointer rounded p-1 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-2 hover:text-fg focus-visible:opacity-100 [@media(hover:none)]:opacity-100';
  return (
    <li className="group flex min-h-7 items-center gap-2">
      <span className="text-muted">=</span>
      <Tex latex={result.value ?? ''} />
      {result.approx && (
        <button
          type="button"
          className="nodrag cursor-pointer text-xs text-muted hover:text-fg"
          title="Copy approximate value"
          onClick={() => void copyText(result.approx ?? '', 'approximate value')}
        >
          ≈ {result.approx}
        </button>
      )}
      <button
        type="button"
        className={`${copyButton} ml-auto`}
        aria-label="Copy LaTeX"
        title="Copy LaTeX"
        onClick={() => void copyText(result.value ?? '', 'LaTeX')}
      >
        <Copy className="size-3.5" />
      </button>
    </li>
  );
}
