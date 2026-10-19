import type { NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';
import type { NodeOf } from '@/model/types';
import { NodeShell } from '../NodeShell';

export default function PdfNode({ data, selected }: NodeProps<NodeOf<'pdf'>>) {
  return (
    <NodeShell
      selected={selected}
      title="PDF"
      customTitle={data.title}
      icon={FileText}
      resize={{ minWidth: 200, minHeight: 160 }}
    >
      <p className="p-4 text-sm text-muted">{data.fileName}</p>
    </NodeShell>
  );
}
