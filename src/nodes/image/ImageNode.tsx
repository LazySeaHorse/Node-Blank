import type { NodeProps } from '@xyflow/react';
import type { NodeOf } from '@/model/types';
import { NodeShell } from '../NodeShell';

export function ImageNode({ data, selected }: NodeProps<NodeOf<'image'>>) {
  return (
    <NodeShell selected={selected} resize={{ minWidth: 40, minHeight: 40, keepAspectRatio: true }}>
      <img src={data.src} alt="" draggable={false} className="h-full w-full object-contain" />
    </NodeShell>
  );
}
