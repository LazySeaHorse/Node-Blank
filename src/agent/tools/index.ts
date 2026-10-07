import type { AnyAgentTool } from '../defineTool';
import { runCode } from './code';
import { getOverview, listNodes, readNodes, searchNodes } from './read';
import { focusNodes, getGuide } from './view';
import { createNodes, deleteNodes, moveNodes, redoTool, undoTool, updateNodes } from './write';

export const ALL_TOOLS = [
  getGuide,
  getOverview,
  listNodes,
  readNodes,
  searchNodes,
  createNodes,
  updateNodes,
  moveNodes,
  deleteNodes,
  runCode,
  focusNodes,
  undoTool,
  redoTool,
] as AnyAgentTool[];
