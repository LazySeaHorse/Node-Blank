import { Sparkles } from 'lucide-react';
import { useAgentStore } from '@/agent';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/store/uiStore';
import { WithTooltip } from '@/ui/Button';

/** Opens the AI panel. The dot shows whether AI control is off, on, or an agent is editing right now. */
export function AiButton() {
  const open = useUiStore((s) => s.aiPanelOpen);
  const toggle = useUiStore((s) => s.toggleAiPanel);
  const enabled = useAgentStore((s) => s.enabled);
  const locked = useAgentStore((s) => s.locked);
  return (
    <WithTooltip label={`AI control · ${enabled ? 'on' : 'off'}`}>
      <button
        type="button"
        aria-label="AI control"
        aria-pressed={open}
        onClick={toggle}
        className={cn(
          'flex h-9 cursor-pointer items-center gap-2 rounded-xl px-2.5 text-sm font-medium transition-colors',
          open ? 'bg-accent/15 text-accent' : 'text-fg hover:bg-accent/10 hover:text-accent',
        )}
      >
        <Sparkles className="size-[18px]" />
        <span className="hidden lg:inline">AI</span>
        <span
          className={cn(
            'size-2 rounded-full',
            enabled ? 'bg-emerald-500' : 'bg-border',
            locked && 'animate-pulse ring-4 ring-emerald-500/25',
          )}
        />
      </button>
    </WithTooltip>
  );
}
