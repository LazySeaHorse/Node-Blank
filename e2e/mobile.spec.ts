import { expect, test } from '@playwright/test';
import { nodes, openApp } from './helpers';

test('mobile is a read-only viewer', async ({ page }) => {
  await openApp(page);
  // Seed a node through the store-backed IndexedDB by importing via the desktop flow is not possible here,
  // so create content directly in the database and reload.
  await page.evaluate(async () => {
    const request = indexedDB.open('node-blank');
    const db: IDBDatabase = await new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
    });
    const [canvas] = await new Promise<{ id: string }[]>((resolve) => {
      const r = db.transaction('canvases').objectStore('canvases').getAll();
      r.onsuccess = () => resolve(r.result);
    });
    await new Promise((resolve) => {
      const tx = db.transaction('contents', 'readwrite');
      tx.objectStore('contents').put({
        id: canvas.id,
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [{ id: 'n1', type: 'text', position: { x: 40, y: 200 }, data: { markdown: '# Read me' } }],
      });
      tx.oncomplete = resolve;
    });
  });
  await page.reload();

  await expect(page.getByText('View only')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undo' })).toHaveCount(0);
  await expect(nodes(page).locator('h1')).toHaveText('Read me');

  await nodes(page).first().click();
  await expect(page.locator('.react-flow__node.selected')).toHaveCount(0);
  await nodes(page).locator('.prose').dblclick();
  await expect(nodes(page).locator('textarea')).toHaveCount(0);

  await page.locator('.react-flow__pane').dblclick({ position: { x: 200, y: 600 } });
  await expect(nodes(page)).toHaveCount(1);
});
