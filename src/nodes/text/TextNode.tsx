import type { NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { useReadOnly } from '@/canvas/readOnly';
import { Markdown } from '@/lib/Markdown';
import type { NodeOf } from '@/model/types';
import { NodeShell } from '../NodeShell';
import { useUpdateNodeData } from '../useNodeData';

export function TextNode({ id, data, selected }: NodeProps<NodeOf<'text'>>) {
  const readOnly = useReadOnly();
  const update = useUpdateNodeData<'text'>(id);
  const [editing, setEditing] = useState(false);

  return (
    <NodeShell selected={selected} className="w-max min-w-56 max-w-xl">
      {editing ? (
        <textarea
          // biome-ignore lint/a11y/noAutofocus: entering edit mode is an explicit user action.
          autoFocus
          value={data.markdown}
          onChange={(e) => update({ markdown: e.target.value })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
          className="nodrag nowheel nokey min-h-32 w-[32rem] max-w-full resize-none bg-surface p-4 font-mono text-sm leading-relaxed text-fg outline-none [field-sizing:content]"
        />
      ) : (
        // biome-ignore lint/a11y/noStaticElementInteractions: double-click to edit mirrors desktop canvas apps.
        <div className="p-4" onDoubleClick={() => !readOnly && setEditing(true)}>
          <Markdown source={data.markdown} />
        </div>
      )}
    </NodeShell>
  );
}
