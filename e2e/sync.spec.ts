import { expect, type Page, test } from '@playwright/test';
import { openApp } from './helpers';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

/** Plays JSONBin: bins in memory, answering the way the real API does. Returns the bins for inspection. */
async function serveJsonbin(page: Page) {
  const bins = new Map<string, unknown>();
  let n = 0;
  await page.route('https://api.jsonbin.io/**', async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const id = new URL(request.url()).pathname.split('/')[3];
    const json = (status: number, body: unknown) =>
      route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) });
    if (request.headers()['x-master-key'] !== 'good-key')
      return json(401, { message: 'Invalid X-Master-Key' });
    switch (request.method()) {
      case 'POST': {
        const created = `bin${++n}`;
        bins.set(created, request.postDataJSON());
        return json(200, { record: {}, metadata: { id: created } });
      }
      case 'GET':
        return bins.has(id)
          ? json(200, { record: bins.get(id), metadata: { id } })
          : json(404, { message: 'Bin not found' });
      case 'PUT':
        bins.set(id, request.postDataJSON());
        return json(200, { record: {}, metadata: { id } });
      default:
        return bins.delete(id) ? json(200, {}) : json(404, { message: 'Bin not found' });
    }
  });
  return bins;
}

async function openCanvases(page: Page) {
  await page.getByRole('button', { name: 'Node-Blank menu' }).click();
  await page.getByRole('menuitem', { name: 'All canvases' }).first().click();
  return page.getByRole('dialog', { name: 'Canvases' });
}

test('sets up cloud sync, pushes a canvas encrypted, and shows it in sync', async ({ page }) => {
  const bins = await serveJsonbin(page);
  await openApp(page);
  const manager = await openCanvases(page);

  await manager.getByRole('button', { name: 'Cloud sync settings' }).click();
  const settings = page.getByRole('dialog', { name: 'Cloud sync' });
  await settings.getByLabel('JSONBin key').fill('bad-key');
  await settings.getByLabel('Encryption password', { exact: true }).fill('hunter2');
  await settings.getByLabel('Repeat password').fill('hunter2');
  await settings.getByRole('button', { name: 'Start cloud save' }).click();
  await expect(settings.getByRole('alert')).toContainText('refused the key');

  await settings.getByLabel('JSONBin key').fill('good-key');
  await settings.getByRole('button', { name: 'Start cloud save' }).click();
  await expect(settings).toBeHidden();

  await manager.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(manager.getByText('Not in the cloud')).toBeVisible();

  await manager.getByRole('button', { name: 'Push all (1)' }).click();
  await expect(manager.getByText('In sync')).toBeVisible();
  await expect(manager.getByRole('button', { name: 'Push all' })).toBeDisabled();

  // The cloud holds the manifest and one piece, and neither shows the canvas's name.
  expect(bins.size).toBe(2);
  expect(JSON.stringify([...bins.values()])).not.toContain('Untitled canvas');
});
