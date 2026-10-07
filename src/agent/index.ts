/**
 * AI control of the open canvas for coding agents (via the local bridge) and browser agents (via WebMCP).
 * The tools are transport-agnostic: getAgentTools() describes them, runAgentTool() runs one.
 */
export { connectBridge } from './bridge';
export type { AgentToolDescriptor, AgentToolResult } from './defineTool';
export { type AgentEvent, agentEvents, selectAgentCalls, useAgentEvents } from './events';
export { getAgentTools, runAgentTool } from './runner';
export { releaseLock, useAgentStore } from './store';
export { setAgentView } from './view';
export { isWebMcpSupported, registerWebMcpTool } from './webmcp';
