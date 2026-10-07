import { ChevronDown, Eye } from 'lucide-react';
import { useState } from 'react';
import { Mascot } from '@/ui/Mascot';
import { CanvasManager } from './CanvasManager';
import { Panel } from './Panel';
import { ThemeToggle } from './ThemeToggle';
import { useCurrentCanvas } from './useCurrentCanvas';

/** Read-only chrome for small screens: switch canvases and theme, nothing else. */
export function MobileBar() {
  const [managerOpen, setManagerOpen] = useState(false);
  const canvas = useCurrentCanvas();
  return (
    <Panel className="h-14 w-full rounded-none border-x-0 border-t-0 px-3 shadow-md">
      <Mascot className="size-8 shrink-0" />
      <button
        type="button"
        onClick={() => setManagerOpen(true)}
        className="flex h-10 min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-xl px-2 text-sm font-medium"
      >
        <span className="truncate">{canvas?.name ?? '…'}</span>
        <ChevronDown className="size-3.5 shrink-0 text-muted" />
      </button>
      <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
        <Eye className="size-3.5" /> View only
      </span>
      <ThemeToggle />
      <CanvasManager open={managerOpen} onOpenChange={setManagerOpen} readOnly />
    </Panel>
  );
}
