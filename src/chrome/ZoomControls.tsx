import { useReactFlow, useViewport } from '@xyflow/react';
import { Maximize, Minus, Plus } from 'lucide-react';
import { IconButton, WithTooltip } from '@/ui/Button';
import { Panel } from './Panel';

const DURATION = { duration: 250 };

export function ZoomControls() {
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();
  const { zoom } = useViewport();
  return (
    <Panel className="flex-col">
      <IconButton icon={Plus} label="Zoom in" onClick={() => zoomIn(DURATION)} />
      <WithTooltip label="Reset to 100%">
        <button
          type="button"
          className="w-9 cursor-pointer rounded-md py-1 text-xs font-semibold text-muted tabular-nums hover:bg-surface-2 hover:text-fg"
          onClick={() => zoomTo(1, DURATION)}
        >
          {Math.round(zoom * 100)}%
        </button>
      </WithTooltip>
      <IconButton icon={Minus} label="Zoom out" onClick={() => zoomOut(DURATION)} />
      <IconButton
        icon={Maximize}
        label="Fit to content"
        onClick={() => fitView({ ...DURATION, padding: 0.2 })}
      />
    </Panel>
  );
}
