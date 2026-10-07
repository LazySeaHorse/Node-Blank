/** Camera control registered by the canvas, so tools can show the user what the agent is working on. */
export interface AgentView {
  fitNodes: (ids: string[]) => void;
}

let view: AgentView | null = null;

export const setAgentView = (next: AgentView | null) => {
  view = next;
};

export const getAgentView = () => view;
