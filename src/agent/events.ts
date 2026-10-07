import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

export type AgentEventPhase = 'started' | 'succeeded' | 'failed';

export interface AgentEvent {
  /** Shared by the started and succeeded/failed events of one call. */
  id: string;
  tool: string;
  phase: AgentEventPhase;
  input: unknown;
  /** One-line human-readable outcome (succeeded only). */
  summary?: string;
  /** Error message (failed only). */
  error?: string;
  /** Nodes the call created or changed. */
  affectedNodeIds?: string[];
  /** Epoch ms. */
  at: number;
}

export const AGENT_EVENT_LOG_LIMIT = 300;

/** Bounded in-memory log of this session's AI activity, oldest first. Every phase of every call is an entry. */
const logStore = createStore<{ events: AgentEvent[] }>(() => ({ events: [] }));

export const agentEvents = {
  emit(event: AgentEvent): void {
    logStore.setState((s) => ({ events: [...s.events, event].slice(-AGENT_EVENT_LOG_LIMIT) }));
  },
  getLog(): readonly AgentEvent[] {
    return logStore.getState().events;
  },
  clear(): void {
    logStore.setState({ events: [] });
  },
};

/** Reactive log for the activity panel. Pass a selector to narrow re-renders. */
export function useAgentEvents<T = readonly AgentEvent[]>(
  selector: (events: readonly AgentEvent[]) => T = (e) => e as unknown as T,
): T {
  return useStore(logStore, (s) => selector(s.events));
}

/** One entry per call (its latest phase), oldest call first. */
export function selectAgentCalls(events: readonly AgentEvent[]): AgentEvent[] {
  const latest = new Map<string, AgentEvent>();
  for (const e of events) latest.set(e.id, e);
  return [...latest.values()];
}
