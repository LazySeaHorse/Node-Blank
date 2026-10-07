import { ChevronDown, Eye } from 'lucide-react';
import { useState } from 'react';
import { CanvasManager } from './CanvasManager';
import { Panel } from './Panel';
import { ThemeToggle } from './ThemeToggle';
import { useCurrentCanvas } from './useCurrentCanvas';

/** Read-only chrome for small screens: switch canvases and theme, nothing else. */
export function MobileBar() {
  const [managerOpen, setManagerOpen] = useState(false);
  const canvas = useCurrentCanvas();
  return (
    <Panel className="w-full">
      <button
        type="button"
        onClick={() => setManagerOpen(true)}
        className="flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-2 text-sm font-medium"
      >
        <span className="truncate">{canvas?.name ?? '…'}</span>
        <ChevronDown className="size-3.5 shrink-0 text-muted" />
      </button>
      <span className="flex items-center gap-1 px-2 text-xs text-muted">
        <Eye className="size-3.5" /> View only
      </span>
      <ThemeToggle />
      <CanvasManager open={managerOpen} onOpenChange={setManagerOpen} readOnly />
    </Panel>
  );
}
