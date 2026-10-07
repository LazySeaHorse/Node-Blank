import type { NodeProps } from '@xyflow/react';
import { Check, TriangleAlert } from 'lucide-react';
import { useReadOnly } from '@/canvas/readOnly';
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
    <NodeShell selected={selected} className="min-w-56 border-l-4 border-l-accent">
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
  return (
    <li className="flex min-h-7 items-center gap-2">
      <span className="text-muted">=</span>
      <Tex latex={result.value ?? ''} />
      {result.approx && <span className="text-xs text-muted">≈ {result.approx}</span>}
      {result.assigned && <Check className="size-3.5 text-green-600" aria-label="Defined" />}
    </li>
  );
}
