import { NodeResizeControl, ResizeControlVariant } from '@xyflow/react';
import { useReadOnly } from '@/canvas/readOnly';

interface CornerResizerProps {
  selected: boolean;
  minWidth: number;
  minHeight: number;
  keepAspectRatio?: boolean;
  onResizing?: (resizing: boolean) => void;
}

/** The node's only resize control: a grip in the bottom-right corner (see `.corner-resizer` for its hit area). */
export function CornerResizer({ selected, onResizing, ...limits }: CornerResizerProps) {
  const readOnly = useReadOnly();
  if (!selected || readOnly) return null;
  return (
    <NodeResizeControl
      {...limits}
      position="bottom-right"
      variant={ResizeControlVariant.Handle}
      className="corner-resizer"
      onResizeStart={() => onResizing?.(true)}
      onResizeEnd={() => onResizing?.(false)}
    />
  );
}
