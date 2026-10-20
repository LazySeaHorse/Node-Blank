import type { NodeProps } from '@xyflow/react';
import { ImageOff } from 'lucide-react';
import type { NodeOf } from '@/model/types';
import { NodeShell } from '../NodeShell';

export function ImageNode({ data, selected }: NodeProps<NodeOf<'image'>>) {
  return (
    <NodeShell
      kind="image"
      selected={selected}
      customTitle={data.title}
      tint={data.color}
      resize={{ minWidth: 40, minHeight: 40, keepAspectRatio: true }}
    >
      {data.src ? (
        <img src={data.src} alt="" draggable={false} className="h-full w-full object-contain" />
      ) : (
        // Cloud sync leaves pictures behind, so a canvas pulled onto a new device has empty image nodes.
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-muted text-xs">
          <ImageOff className="size-5" />
          Image not synced
        </div>
      )}
    </NodeShell>
  );
}
