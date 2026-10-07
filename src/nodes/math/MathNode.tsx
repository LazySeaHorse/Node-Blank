import type { NodeProps } from '@xyflow/react';
import { useReadOnly } from '@/canvas/readOnly';
import { MathField } from '@/lib/math/MathField';
import type { NodeOf } from '@/model/types';
import { NodeShell } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';

export default function MathNode({ id, data, selected }: NodeProps<NodeOf<'math'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'math'>(id);
  return (
    <NodeShell selected={selected} className="min-w-20 px-3 py-2">
      <MathField
        value={data.latex}
        onChange={(latex) => update({ latex })}
        readOnly={readOnly}
        multiline
        placeholder="\text{math}"
      />
    </NodeShell>
  );
}
