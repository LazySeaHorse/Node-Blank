import { CircleAlert, LoaderCircle, Power, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type AgentEvent, selectAgentCalls, useAgentEvents, useAgentStore } from '@/agent';
import { getAgentView } from '@/agent/view';
import { cn } from '@/lib/cn';
import { useCanvasStore } from '@/store/canvasStore';
import { organiseCanvas } from '@/store/groups';
import { useUiStore } from '@/store/uiStore';
import { Button, IconButton } from '@/ui/Button';
import { confirmAction } from '@/ui/dialogs';
import { Panel } from './Panel';

const MCP_URL = 'http://127.0.0.1:47801/mcp';
const RELEASES_URL = 'https://github.com/LazySeaHorse/Node-Blank/releases';
const SETUP_COMMANDS = [
  ['Claude Code', `claude mcp add --transport http node-blank ${MCP_URL}`],
  ['Codex', `codex mcp add node-blank --url ${MCP_URL}`],
  ['Gemini CLI', `gemini mcp add --transport http node-blank ${MCP_URL}`],
] as const;

/** Asks first, organises the canvas so agents can find their way around, then turns AI control on. */
export async function enableAiControl(): Promise<void> {
  const ok = await confirmAction({
    title: 'Turn on AI control?',
    message:
      'Connected agents will be able to read and edit this canvas. First, nearby nodes are grouped and spaced ' +
      'evenly (Organise); undo reverts that. While an agent is editing, the canvas is read-only for you.',
    confirmLabel: 'Organise and turn on',
  });
  if (!ok) return;
  if (useCanvasStore.getState().nodes.length > 0) organiseCanvas();
  useAgentStore.getState().setEnabled(true);
}

const time = (at: number) =>
  new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function ActivityRow({ event }: { event: AgentEvent }) {
  const nodes = useCanvasStore((s) => s.nodes);
  const targets = (event.affectedNodeIds ?? []).filter((id) => nodes.some((n) => n.id === id));
  const focus = () => targets.length > 0 && getAgentView()?.fitNodes(targets);
  return (
    <li>
      <button
        type="button"
        onClick={focus}
        disabled={targets.length === 0}
        className="flex w-full cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface-2 disabled:cursor-default disabled:hover:bg-transparent"
      >
        <span className="shrink-0 text-muted tabular-nums">{time(event.at)}</span>
        {event.phase === 'started' && (
          <LoaderCircle className="mt-px size-3.5 shrink-0 animate-spin text-accent" />
        )}
        {event.phase === 'failed' && <CircleAlert className="mt-px size-3.5 shrink-0 text-danger" />}
        <span className={cn('min-w-0 break-words', event.phase === 'failed' ? 'text-danger' : 'text-fg')}>
          {event.phase === 'failed' ? event.error : (event.summary ?? event.tool)}
        </span>
      </button>
    </li>
  );
}

function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={cn('size-2 rounded-full', ok ? 'bg-emerald-500' : 'bg-border')} />
      <span className={ok ? 'text-fg' : 'text-muted'}>{label}</span>
    </div>
  );
}

export function AiPanel() {
  const { enabled, bridgeConnected, webMcpTools, setEnabled } = useAgentStore();
  const close = useUiStore((s) => s.toggleAiPanel);
  const events = useAgentEvents();
  const calls = useMemo(() => selectAgentCalls(events), [events]);
  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <Panel className="pointer-events-auto flex max-h-full w-80 flex-col items-stretch gap-0 p-0">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold">AI control</h2>
        <Button
          variant={enabled ? 'primary' : 'ghost'}
          className="ml-auto h-7 px-2 text-xs"
          onClick={() => (enabled ? setEnabled(false) : void enableAiControl())}
          aria-pressed={enabled}
        >
          <Power className="size-3.5" /> {enabled ? 'On' : 'Off'}
        </Button>
        <IconButton icon={X} label="Close AI panel" size="sm" onClick={close} />
      </header>

      <section className="flex flex-col gap-1.5 border-b border-border px-3 py-2">
        <Status
          ok={enabled && bridgeConnected}
          label={bridgeConnected ? 'Bridge connected' : 'Bridge not connected'}
        />
        {webMcpTools > 0 && <Status ok label={`WebMCP: ${webMcpTools} tools registered`} />}
        <button
          type="button"
          className="cursor-pointer self-start text-xs text-accent hover:underline"
          onClick={() => setSetupOpen((o) => !o)}
        >
          {setupOpen ? 'Hide setup' : 'Connect a coding agent'}
        </button>
        {setupOpen && (
          <div className="flex flex-col gap-1.5 text-xs text-muted">
            <p>
              1. Download and run the bridge for your OS from the{' '}
              <a href={RELEASES_URL} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                latest bridge release
              </a>
              .
            </p>
            <p>2. Turn AI control on. This tab connects by itself.</p>
            <p>3. Add it to your agent once:</p>
            {SETUP_COMMANDS.map(([agent, command]) => (
              <div key={agent}>
                <span className="text-fg">{agent}</span>
                <code className="mt-0.5 block rounded bg-surface-2 px-2 py-1 font-mono text-[11px] break-all text-fg select-all">
                  {command}
                </code>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex min-h-0 flex-1 flex-col">
        <h3 className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">Activity</h3>
        {calls.length === 0 ? (
          <p className="px-3 pb-3 text-xs text-muted">Nothing yet. Agent calls will show up here.</p>
        ) : (
          <ol className="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
            {[...calls].reverse().map((event) => (
              <ActivityRow key={event.id} event={event} />
            ))}
          </ol>
        )}
      </section>
    </Panel>
  );
}

/** Shown while an agent is editing: the canvas is read-only until it pauses or the user takes over. */
export function AiLockBanner() {
  const locked = useAgentStore((s) => s.locked);
  if (!locked) return null;
  return (
    <Panel className="gap-3 py-1.5 pr-1.5 pl-3 text-sm" role="status">
      <LoaderCircle className="size-4 animate-spin text-accent" />
      <span>AI is editing. The canvas is read-only.</span>
      <Button className="h-7 px-2 text-xs" onClick={() => useAgentStore.getState().setEnabled(false)}>
        Take over
      </Button>
    </Panel>
  );
}
