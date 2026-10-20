import type { NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { NodeOf } from '@/model/types';
import { NodeShell } from '../NodeShell';
import { normaliseWebUrl } from './url';

/** No `allow-top-navigation`: a page that tries to break out of its frame stays in it. */
const SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals';
const ALLOW =
  'clipboard-read; clipboard-write; fullscreen; microphone; autoplay; encrypted-media; picture-in-picture';

export function WebNode({ data, selected, dragging }: NodeProps<NodeOf<'web'>>) {
  const [resizing, setResizing] = useState(false);
  // Only http(s) addresses reach the iframe: a `javascript:` URL from an imported file would run in this app.
  const src = normaliseWebUrl(data.url);
  // An iframe swallows mouse events, so it only becomes interactive once its node is selected and still.
  const interactive = selected && !dragging && !resizing;

  return (
    <NodeShell
      selected={selected}
      title="Web"
      customTitle={data.title}
      icon={Globe}
      resize={{ minWidth: 320, minHeight: 240, onResizing: setResizing }}
    >
      {src ? (
        <iframe
          src={src}
          title="Web page"
          sandbox={SANDBOX}
          allow={ALLOW}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className={cn('h-full w-full border-0 bg-white', !interactive && 'pointer-events-none')}
        />
      ) : (
        <p className="p-4 text-sm text-muted">Enter a web address.</p>
      )}
    </NodeShell>
  );
}
