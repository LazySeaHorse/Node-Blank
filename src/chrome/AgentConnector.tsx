import { useEffect } from 'react';
import { connectBridge, getAgentTools, isWebMcpSupported, registerWebMcpTool, useAgentStore } from '@/agent';

/**
 * While AI control is on, registers the tools with the browser's WebMCP API and links them to the
 * local bridge for coding agents. Turning it off unregisters everything. Renders nothing.
 */
export function AgentConnector() {
  const enabled = useAgentStore((s) => s.enabled);

  useEffect(() => {
    const { setWebMcpTools } = useAgentStore.getState();
    if (!enabled || !isWebMcpSupported()) return;
    const unregister = getAgentTools()
      .map(registerWebMcpTool)
      .filter((off): off is () => void => off !== null);
    setWebMcpTools(unregister.length);
    return () => {
      for (const off of unregister) off();
      setWebMcpTools(0);
    };
  }, [enabled]);

  useEffect(() => {
    const { setBridgeConnected } = useAgentStore.getState();
    if (!enabled) return;
    const disconnect = connectBridge(getAgentTools(), setBridgeConnected);
    return () => {
      disconnect();
      setBridgeConnected(false);
    };
  }, [enabled]);

  return null;
}
