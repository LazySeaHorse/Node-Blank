import type { NodeProps } from '@xyflow/react';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import type { NodeOf } from '@/model/types';
import { IconButton } from '@/ui/Button';
import { NodeShell } from '../NodeShell';
import { toEmbedUrl } from './embedUrl';
import { command, listen, parsePlaying, playerKind } from './player';

export function VideoNode({ data, selected, dragging }: NodeProps<NodeOf<'video'>>) {
  const [resizing, setResizing] = useState(false);
  const src = toEmbedUrl(data.url);
  // An iframe swallows mouse events, so it only becomes interactive once its node is selected and still.
  const interactive = selected && !dragging && !resizing;
  const kind = playerKind(src);
  const frame = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!kind) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const next = parsePlaying(kind, event.origin, event.data);
      if (next !== null) setPlaying(next);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [kind]);

  return (
    <NodeShell
      kind="video"
      selected={selected}
      live={interactive}
      customTitle={data.title}
      tint={data.color}
      resize={{ minWidth: 240, minHeight: 160, onResizing: setResizing }}
      actions={
        kind && (
          <IconButton
            icon={playing ? Pause : Play}
            label={playing ? 'Pause' : 'Play'}
            size="sm"
            onClick={() =>
              frame.current?.contentWindow && command(frame.current.contentWindow, kind, !playing)
            }
          />
        )
      }
    >
      {src ? (
        <iframe
          ref={frame}
          src={src}
          onLoad={() => kind && frame.current?.contentWindow && listen(frame.current.contentWindow, kind)}
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
