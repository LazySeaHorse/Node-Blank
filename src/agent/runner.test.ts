import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type AppNode, DEFAULT_VIEWPORT } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { undo, useCanvasStore } from '@/store/canvasStore';
import { alias, resetAliases } from './aliases';
import { agentEvents, selectAgentCalls } from './events';
import { getAgentTools, runAgentTool } from './runner';
import { releaseLock, useAgentStore } from './store';

vi.mock('@/nodes/code/sandbox', () => ({
  runScript: (source: string, onLine: (l: { level: string; text: string }) => void, onDone: () => void) => {
    queueMicrotask(() => {
      onLine({ level: 'log', text: `ran ${source.length} chars` });
      onLine({ level: 'result', text: '10' });
      onDone();
    });
    return () => {};
  },
}));

const canvas = () => useCanvasStore.getState();
const at = (x: number, y: number) => ({ x, y });

/** Runs a tool and returns its text, failing the test on an error result. */
async function call(name: string, input: unknown = {}): Promise<string> {
  const result = await runAgentTool(name, input);
  const text = result.content.map((c) => (c.type === 'text' ? c.text : '')).join('');
  if (result.isError) throw new Error(text);
  return text;
}

async function callError(name: string, input: unknown = {}): Promise<{ error: string; message: string }> {
  const result = await runAgentTool(name, input);
  expect(result.isError).toBe(true);
  return JSON.parse(result.content[0].type === 'text' ? result.content[0].text : '{}');
}

function load(nodes: AppNode[]) {
  canvas().load({ nodes, viewport: DEFAULT_VIEWPORT });
  nodes.forEach((n) => {
    alias(n.id);
  });
}

beforeEach(() => {
  resetAliases();
  agentEvents.clear();
  useAgentStore.getState().setEnabled(true);
  load([]);
});
afterEach(() => {
  useAgentStore.getState().setEnabled(false);
  releaseLock();
});

describe('runner', () => {
  it('refuses every call while AI control is off', async () => {
    useAgentStore.getState().setEnabled(false);
    expect((await callError('get_overview')).error).toBe('agent_disabled');
  });

  it('reports invalid input with the path', async () => {
    const { error, message } = await callError('read_nodes', { ids: [] });
    expect(error).toBe('invalid_input');
    expect(message).toContain('ids');
  });

  it('logs one activity entry per call with its outcome', async () => {
    load([createNode('math', at(0, 0), { latex: 'x' })]);
    await call('update_nodes', { updates: [{ id: 'n1', set: { latex: 'y' } }] });
    const [entry] = selectAgentCalls(agentEvents.getLog());
    expect(entry).toMatchObject({ tool: 'update_nodes', phase: 'succeeded', summary: 'Updated 1 node' });
    expect(entry.affectedNodeIds).toEqual([canvas().nodes[0].id]);
  });

  it('exposes every tool with an object JSON schema', () => {
    const tools = getAgentTools();
    expect(tools.length).toBeGreaterThan(10);
    for (const t of tools) expect(t.inputSchema.type).toBe('object');
  });

  it('locks the canvas after a write but not after a read', async () => {
    load([createNode('math', at(0, 0))]);
    await call('get_overview');
    expect(useAgentStore.getState().locked).toBe(false);
    await call('move_nodes', { moves: [{ id: 'n1', dx: 10 }] });
    expect(useAgentStore.getState().locked).toBe(true);
    expect(useAgentStore.getState().touched.has(canvas().nodes[0].id)).toBe(true);
  });
});

describe('reading', () => {
  it('summarises the canvas in groups', async () => {
    load([
      createNode('text', at(0, 0), { markdown: '# Fourier\nseries' }),
      createNode('math', at(260, 0), { latex: 'e^{i\\pi}' }),
      createNode('graph', at(5000, 0)),
    ]);
    const text = await call('get_overview');
    expect(text).toContain('3 nodes (text 1, math 1, graph 1), 2 groups');
    expect(text).toMatch(/g1 2 0,0 \d+×\d+ text 1, math 1 "# Fourier series"/);
    expect(text).toContain('g2 1 5000,0');
    expect(canvas().groups).toHaveLength(2);
  });

  it('lists nodes in a group as compact lines, with paging', async () => {
    load(Array.from({ length: 5 }, (_, i) => createNode('math', at(i * 250, 0), { latex: `x_${i}` })));
    await call('get_overview');
    const text = await call('list_nodes', { group: 'g1', limit: 2 });
    expect(text.split('\n')).toEqual([
      'n1 math 0,0 240×120 g1 "x_0"',
      'n2 math 250,0 240×120 g1 "x_1"',
      '(1-2 of 5; pass offset=2 for more)',
    ]);
  });

  it('lists only the selection', async () => {
    load([createNode('math', at(0, 0)), { ...createNode('math', at(0, 500)), selected: true }]);
    expect(await call('list_nodes', { scope: 'selected' })).toMatch(/^n2 math/);
  });

  it('reads full content, cut at maxChars with a pointer to the rest', async () => {
    load([createNode('text', at(0, 0), { markdown: 'a'.repeat(250) })]);
    const text = await call('read_nodes', { ids: ['n1'], maxChars: 100 });
    expect(text).toContain('## n1 text 0,0');
    expect(text).toContain(`${'a'.repeat(100)}\n[chars 0-100 of 250; pass offset=100 for more]`);
  });

  it('reads sheets as grids with A1 labels', async () => {
    load([createNode('sheet', at(0, 0), { cells: [['1', '=A1*2']] })]);
    expect(await call('read_nodes', { ids: ['n1'] })).toContain('  | A | B\n1 | 1 | =A1*2');
  });

  it('reads Math+ with results that flow between nodes in reading order', async () => {
    load([
      createNode('mathPlus', at(0, 300), { latex: 'a+1' }),
      createNode('mathPlus', at(0, 0), { latex: 'a:=2' }),
    ]);
    const text = await call('read_nodes', { ids: ['n1'] });
    expect(text).toContain('a+1  ⟶ 3');
  }, 20_000);

  it('never sends image data', async () => {
    load([createNode('image', at(0, 0), { src: `data:image/png;base64,${'A'.repeat(4000)}` })]);
    const text = await call('read_nodes', { ids: ['n1'] });
    expect(text).toContain('uploaded image, 3 KB');
    expect(text).not.toContain('AAAA');
  });

  it('searches with snippets', async () => {
    load([createNode('text', at(0, 0), { markdown: 'The quick brown fox' }), createNode('math', at(0, 400))]);
    expect(await call('search_nodes', { query: 'BROWN' })).toBe('n1 text g1: The quick brown fox');
  });
});

describe('writing', () => {
  it('creates nodes next to a node without touching the selection, as one undo step', async () => {
    load([{ ...createNode('math', at(0, 0)), selected: true }]);
    const text = await call('create_nodes', {
      nodes: [
        { kind: 'text', markdown: 'hi', near: 'n1' },
        { kind: 'math', latex: 'y', near: 'n1' },
      ],
    });
    expect(text).toBe('Created n2 text at 264,0; n3 math at 0,144.');
    expect(canvas().nodes.map((n) => !!n.selected)).toEqual([true, false, false]);
    undo();
    expect(canvas().nodes).toHaveLength(1);
  });

  it('places nodes right of everything by default and validates kinds', async () => {
    load([createNode('math', at(0, 0))]);
    expect(await call('create_nodes', { nodes: [{ kind: 'graph', functions: ['x'] }] })).toContain(
      'at 400,0',
    );
    expect((await callError('create_nodes', { nodes: [{ kind: 'image', src: 'x' }] })).error).toBe(
      'invalid_input',
    );
    expect((await callError('create_nodes', { nodes: [{ kind: 'video', url: 'nope' }] })).error).toBe(
      'invalid_url',
    );
    expect(
      (await callError('create_nodes', { nodes: [{ kind: 'text', markdown: '', width: 300 }] })).error,
    ).toBe('not_resizable');
  });

  it('applies exact find/replace edits and rejects missing or ambiguous ones', async () => {
    load([createNode('text', at(0, 0), { markdown: 'one two two' })]);
    await call('update_nodes', { updates: [{ id: 'n1', edits: [{ find: 'one', replace: '1' }] }] });
    expect(canvas().nodes[0].data).toEqual({ markdown: '1 two two' });
    expect(
      (await callError('update_nodes', { updates: [{ id: 'n1', edits: [{ find: 'two', replace: '2' }] }] }))
        .error,
    ).toBe('edit_ambiguous');
    expect(
      (await callError('update_nodes', { updates: [{ id: 'n1', edits: [{ find: 'zzz', replace: '' }] }] }))
        .error,
    ).toBe('edit_not_found');
    await call('update_nodes', {
      updates: [{ id: 'n1', edits: [{ find: 'two', replace: '2', all: true }] }],
    });
    expect(canvas().nodes[0].data).toEqual({ markdown: '1 2 2' });
  });

  it('sets cells by reference, growing the grid', async () => {
    load([createNode('sheet', at(0, 0), { cells: [['a']] })]);
    await call('update_nodes', { updates: [{ id: 'n1', cells: [{ cell: 'C2', value: '=A1' }] }] });
    expect(canvas().nodes[0].data).toEqual({
      cells: [
        ['a', '', ''],
        ['', '', '=A1'],
      ],
    });
  });

  it('rejects fields that do not belong to the kind, applying nothing', async () => {
    load([createNode('math', at(0, 0), { latex: 'x' }), createNode('text', at(0, 400), { markdown: 'm' })]);
    const { error } = await callError('update_nodes', {
      updates: [
        { id: 'n2', set: { markdown: 'changed' } },
        { id: 'n1', set: { markdown: 'nope' } },
      ],
    });
    expect(error).toBe('invalid_field');
    expect(canvas().nodes[1].data).toEqual({ markdown: 'm' });
  });

  it('moves, resizes and deletes nodes', async () => {
    load([createNode('graph', at(0, 0)), createNode('math', at(0, 500))]);
    await call('move_nodes', { moves: [{ id: 'n1', x: 50, dy: 5, width: 500 }] });
    expect(canvas().nodes[0]).toMatchObject({ position: { x: 50, y: 5 }, width: 500 });
    expect((await callError('move_nodes', { moves: [{ id: 'n2', width: 500 }] })).error).toBe(
      'not_resizable',
    );
    await call('delete_nodes', { ids: ['n2'] });
    expect(canvas().nodes).toHaveLength(1);
    expect((await callError('delete_nodes', { ids: ['n2'] })).error).toBe('node_not_found');
  });

  it('runs scripts and returns their output', async () => {
    load([createNode('code', at(0, 0), { source: '1+9' })]);
    expect(await call('run_code', { id: 'n1' })).toBe('ran 3 chars\n=> 10');
    expect((await callError('run_code', { id: 'n9' })).error).toBe('node_not_found');
  });
});
