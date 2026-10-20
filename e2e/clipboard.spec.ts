import { expect, test } from '@playwright/test';
import { nodes, openApp, placeNode } from './helpers';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });
test.beforeEach(async ({ page }) => openApp(page));

test('copies a selected node and pastes it at the cursor', async ({ page }) => {
  await placeNode(page, 'Text', 400, 300);
  await nodes(page).first().click();
  await page.keyboard.press('ControlOrMeta+c');
  await page.mouse.move(900, 600);
  await page.keyboard.press('ControlOrMeta+v');
  await expect(nodes(page)).toHaveCount(2);
  // At the cursor, snapped to the 24px grid.
  const box = await nodes(page).nth(1).boundingBox();
  expect(Math.abs((box?.x ?? 0) - 900)).toBeLessThanOrEqual(12);
  expect(Math.abs((box?.y ?? 0) - 600)).toBeLessThanOrEqual(12);
  await page.keyboard.press('ControlOrMeta+v');
  await expect(nodes(page)).toHaveCount(3);
});

test('copy and paste inside a math field stay native', async ({ page }) => {
  await placeNode(page, 'Math');
  const field = nodes(page).locator('math-field');
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.type('xy');
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('ControlOrMeta+c');
  await page.keyboard.press('ControlOrMeta+v');
  await expect(nodes(page)).toHaveCount(1);
});
