import { expect, test } from '@playwright/test';
import { nodes, openApp, placeNode } from './helpers';

test.beforeEach(async ({ page }) => openApp(page));

const menu = (page: import('@playwright/test').Page) => page.getByRole('menu');
const viewport = (page: import('@playwright/test').Page) =>
  page.locator('.react-flow__viewport').getAttribute('style');

test('right-clicking the empty canvas opens the canvas menu at the pointer', async ({ page }) => {
  await page.mouse.click(600, 400, { button: 'right' });
  await expect(menu(page)).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Add node' })).toBeVisible();
  const box = await menu(page).boundingBox();
  expect(Math.abs((box?.x ?? 0) - 600)).toBeLessThan(40);
  expect(Math.abs((box?.y ?? 0) - 400)).toBeLessThan(40);
  await page.keyboard.press('Escape');
  await expect(menu(page)).toHaveCount(0);
});

test('right-drag pans the canvas without opening a menu', async ({ page }) => {
  const before = await viewport(page);
  await page.mouse.move(600, 400);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(700, 480, { steps: 8 });
  await page.mouse.up({ button: 'right' });
  await expect.poll(() => viewport(page)).not.toBe(before);
  await expect(menu(page)).toHaveCount(0);
});

test('adding a node from the menu puts it at the click', async ({ page }) => {
  await page.mouse.click(600, 400, { button: 'right' });
  await page.getByRole('menuitem', { name: 'Add node' }).click();
  await page.getByRole('menuitem', { name: 'Text', exact: true }).click();
  const node = page.locator('.react-flow__node');
  await expect(node).toHaveCount(1);
  const box = await node.boundingBox();
  expect(Math.abs((box?.x ?? 0) - 600)).toBeLessThan(20);
  expect(Math.abs((box?.y ?? 0) - 400)).toBeLessThan(20);
});

test("right-clicking inside a math field opens MathLive's menu, not ours", async ({ page }) => {
  await placeNode(page, 'Math');
  await nodes(page).locator('math-field').click({ button: 'right' });
  await expect(page.locator('.ui-menu-container')).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Add node' })).toHaveCount(0);
});
