import { expect, type Page, test, type WebSocketRoute } from '@playwright/test';
import { nodes, openApp, placeNode } from './helpers';

/** Plays the local bridge: the app dials ws://127.0.0.1:47801/page and this test answers. */
async function fakeBridge(page: Page) {
  const messages: { type: string; id?: number; tools?: { name: string }[]; result?: unknown }[] = [];
  let socket: WebSocketRoute | undefined;
  await page.routeWebSocket('ws://127.0.0.1:47801/page', (ws) => {
    socket = ws;
    ws.onMessage((data) => messages.push(JSON.parse(String(data))));
  });
  let nextId = 0;
  return {
    messages,
    connected: () => socket !== undefined,
    async call(name: string, input: unknown = {}) {
      const id = ++nextId;
      socket?.send(JSON.stringify({ type: 'call', id, name, input }));
      await expect.poll(() => messages.some((m) => m.type === 'result' && m.id === id)).toBe(true);
      const { result } = messages.find((m) => m.type === 'result' && m.id === id) as {
        result: { content: { text: string }[]; isError?: boolean };
      };
      return { text: result.content[0].text, isError: result.isError ?? false };
    },
  };
}

test('an agent connected through the bridge reads and edits the canvas', async ({ page }) => {
  const bridge = await fakeBridge(page);
  await openApp(page);
  await placeNode(page, 'Text', 400, 300);
  await placeNode(page, 'Math', 1100, 700);
  await expect(nodes(page)).toHaveCount(2);
  const before = await nodes(page).nth(1).boundingBox();

  // Turning AI control on asks first and organises the canvas.
  await page.getByRole('button', { name: 'AI control' }).click();
  await page.getByRole('switch', { name: /Allow AI agents/ }).click();
  await page.getByRole('button', { name: 'Organise and turn on' }).click();
  await expect(page.getByText('Bridge connected')).toBeVisible();
  await expect.poll(async () => (await nodes(page).nth(1).boundingBox())?.x).not.toBe(before?.x);

  const manifest = bridge.messages.find((m) => m.type === 'tools');
  expect(manifest?.tools?.map((t) => t.name)).toContain('get_overview');

  const overview = await bridge.call('get_overview');
  expect(overview.text).toContain('2 nodes (text 1, math 1)');

  const listed = await bridge.call('list_nodes');
  const textHandle = /^(n\d+) text/m.exec(listed.text)?.[1];
  expect(textHandle).toBeTruthy();

  const created = await bridge.call('create_nodes', {
    nodes: [{ kind: 'text', markdown: '# From the agent', near: textHandle }],
  });
  expect(created.text).toMatch(/^Created n3 text/);
  await expect(nodes(page)).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'From the agent' })).toBeVisible();

  // The user cannot edit while the agent works, and can take over.
  await expect(page.getByText('AI is editing. The canvas is read-only.')).toBeVisible();
  await page.getByRole('button', { name: 'Take over' }).click();
  await expect(page.getByText('AI is editing')).toHaveCount(0);
  // Taking over turns AI control off, which also disconnects the tab from the bridge.
  await expect(page.getByText('Bridge not connected')).toBeVisible();

  // The activity tab kept the history.
  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByText('Created 1 node')).toBeVisible();
});
