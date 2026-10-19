import { X } from 'lucide-react';
import { useMemo } from 'react';
import { detectShape } from '@/lib/markdownShape';
import { convertTextNode } from '@/store/convert';
import { Button } from '@/ui/Button';

const compact = 'rounded-md px-2 py-0.5 text-xs';

/** Offers to turn a text node that is only a table, or only math, into the node made for it. */
export function ShapeSuggestion({
  id,
  markdown,
  onDismiss,
}: {
  id: string;
  markdown: string;
  onDismiss: () => void;
}) {
  const shape = useMemo(() => detectShape(markdown), [markdown]);
  if (!shape) return null;

  return (
    <div className="nodrag flex items-center gap-2 border-t border-border bg-surface-2 px-3 py-1.5 text-xs text-muted">
      <span className="mr-auto">
        {shape.kind === 'table' ? 'This is only a table.' : 'This is only maths.'}
      </span>
      {shape.kind === 'table' ? (
        <>
          <Button variant="primary" className={compact} onClick={() => convertTextNode(id, shape, 'table')}>
            Table
          </Button>
          <Button variant="primary" className={compact} onClick={() => convertTextNode(id, shape, 'sheet')}>
            Sheet
          </Button>
        </>
      ) : (
        <Button variant="primary" className={compact} onClick={() => convertTextNode(id, shape, 'math')}>
          Math node
        </Button>
      )}
      <button
        type="button"
        aria-label="Dismiss suggestion"
        onClick={onDismiss}
        className="cursor-pointer rounded p-0.5 hover:bg-surface hover:text-fg"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
