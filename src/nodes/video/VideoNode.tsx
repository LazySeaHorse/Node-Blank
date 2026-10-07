import type { NodeProps } from '@xyflow/react';
import { SquarePlay } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { NodeOf } from '@/model/types';
import { NodeShell } from '../NodeShell';
import { toEmbedUrl } from './embedUrl';

export function VideoNode({ data, selected, dragging }: NodeProps<NodeOf<'video'>>) {
  const [resizing, setResizing] = useState(false);
  const src = toEmbedUrl(data.url);
  // An iframe swallows mouse events, so it only becomes interactive once its node is selected and still.
  const interactive = selected && !dragging && !resizing;

  return (
    <NodeShell
      selected={selected}
      title="Video"
      icon={SquarePlay}
      resize={{ minWidth: 240, minHeight: 160, onResizing: setResizing }}
    >
      {src ? (
        <iframe
          src={src}
          title="Embedded video"
          className={cn('h-full w-full border-0', !interactive && 'pointer-events-none')}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <p className="p-4 text-sm text-muted">Unsupported video URL: {data.url}</p>
      )}
    </NodeShell>
  );
}
