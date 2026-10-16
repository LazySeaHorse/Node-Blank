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

test('node menu: Duplicate copies the node', async ({ page }) => {
  await placeNode(page, 'Text');
  await expect(nodes(page)).toHaveCount(1);
  await nodes(page).locator('.prose').click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Duplicate' }).click();
  await expect(nodes(page)).toHaveCount(2);
});

test('node menu: Delete removes the node and undo brings it back', async ({ page }) => {
  await placeNode(page, 'Text');
  await nodes(page).locator('.prose').click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(nodes(page)).toHaveCount(0);
  await page.keyboard.press('ControlOrMeta+z');
  await expect(nodes(page)).toHaveCount(1);
});

async function wrapTwoTexts(page: import('@playwright/test').Page) {
  await placeNode(page, 'Text', 500, 350);
  await placeNode(page, 'Text', 500, 600);
  await page.mouse.click(1300, 820);
  await page.mouse.move(300, 250);
  await page.mouse.down();
  await page.mouse.move(1100, 850, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.react-flow__node.selected')).toHaveCount(2);
}

test('selection menu wraps in a section; section menu ungroups it', async ({ page }) => {
  await wrapTwoTexts(page);
  await page
    .locator('.react-flow__nodesselection-rect')
    .click({ button: 'right', position: { x: 20, y: 20 } });
  await page.getByRole('menuitem', { name: 'Wrap in section' }).click();
  const section = page.locator('.react-flow__node-section');
  await expect(section).toHaveCount(1);
  await section.locator('input').press('Enter');

  await section.locator('.section-handle').click({ button: 'right', position: { x: 60, y: 20 } });
  await page.getByRole('menuitem', { name: 'Ungroup' }).click();
  await expect(section).toHaveCount(0);
  await expect(nodes(page)).toHaveCount(2);
});

test('section menu renames the section', async ({ page }) => {
  await wrapTwoTexts(page);
  await page.keyboard.press('ControlOrMeta+g');
  const section = page.locator('.react-flow__node-section');
  await section.locator('input').press('Enter');
  await section.locator('.section-handle').click({ button: 'right', position: { x: 60, y: 20 } });
  await page.getByRole('menuitem', { name: 'Rename' }).click();
  const title = section.locator('input');
  await expect(title).toBeFocused();
  await title.fill('Plan');
  await title.press('Enter');
  await expect(section.getByText('Plan')).toBeVisible();
});

test('selection menu aligns the selected nodes', async ({ page }) => {
  await wrapTwoTexts(page);
  const lefts = async () =>
    (await nodes(page).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().left))).map(Math.round);
  await page
    .locator('.react-flow__nodesselection-rect')
    .click({ button: 'right', position: { x: 20, y: 20 } });
  await page.getByRole('menuitem', { name: 'Align' }).click();
  await page.getByRole('menuitem', { name: 'Left', exact: true }).click();
  const [a, b] = await lefts();
  expect(a).toBe(b);
});
