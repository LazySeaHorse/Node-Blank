import type { z } from 'zod';

/** What a handler returns. The runner turns it into an MCP-style result. */
export interface ToolOutcome {
  /** Plain text for the agent. Kept compact: this is what costs tokens. */
  text: string;
  /** One-line description for the activity feed. */
  summary?: string;
  /** Real node ids the call created or changed, for highlighting and the activity feed. */
  affectedNodeIds?: string[];
}

export interface AgentToolConfig<S extends z.ZodType> {
  /** snake_case, unique. */
  name: string;
  title: string;
  /** Public documentation for the calling agent. */
  description: string;
  input: S;
  /** True when the tool never changes the canvas. Write tools lock the canvas for the user while the agent works. */
  readOnly: boolean;
  /** True when the tool removes user content (still undoable). */
  destructive?: boolean;
  /** Run one at a time with other exclusive tools. Defaults to !readOnly. */
  exclusive?: boolean;
  handler: (input: z.output<S>) => Promise<ToolOutcome> | ToolOutcome;
}

export interface AgentToolDefinition<S extends z.ZodType = z.ZodType> extends AgentToolConfig<S> {
  destructive: boolean;
  exclusive: boolean;
}

export function defineTool<S extends z.ZodType>(config: AgentToolConfig<S>): AgentToolDefinition<S> {
  return {
    ...config,
    destructive: config.destructive ?? false,
    exclusive: config.exclusive ?? !config.readOnly,
  };
}

export type AnyAgentTool = AgentToolDefinition<z.ZodType>;

export type AgentToolContent =
  | { type: 'text'; text: string }
  | { type: 'image'; data: string; mimeType: string };

/** MCP-style tool result. */
export interface AgentToolResult {
  content: AgentToolContent[];
  isError?: boolean;
}

/** A tool as exposed to a transport (WebMCP, the local bridge). */
export interface AgentToolDescriptor {
  name: string;
  title: string;
  description: string;
  /** JSON Schema (draft 2020-12) with type 'object'. */
  inputSchema: Record<string, unknown>;
  annotations: { title: string; readOnlyHint: boolean; destructiveHint: boolean };
  /** Validates, runs and never throws. */
  execute: (input: unknown) => Promise<AgentToolResult>;
}
