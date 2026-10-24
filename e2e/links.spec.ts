import { expect, test } from '@playwright/test';
import { nodes, openApp, placeNode } from './helpers';

test('nodes move again after leaving linking mode', async ({ page }) => {
  await openApp(page);
  await placeNode(page, 'Text', 300, 300);
  await placeNode(page, 'Text', 700, 300);
  await page.mouse.click(600, 700);
  await page.keyboard.press('l');
  const a = (await nodes(page).nth(0).boundingBox())!;
  const b = (await nodes(page).nth(1).boundingBox())!;
  await page.mouse.move(a.x + 20, a.y + 20);
  await page.mouse.down();
  await page.mouse.move(b.x + 20, b.y + 20, { steps: 10 });
  await page.mouse.up();
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  await page.keyboard.press('l');
  // The selected link's toolbar floats over the nodes; deselect it.
  await page.mouse.click(600, 750);

  const before = (await nodes(page).nth(0).boundingBox())!;
  await page.mouse.move(before.x + 20, before.y + 20);
  await page.mouse.down();
  await page.mouse.move(before.x + 20, before.y + 120, { steps: 10 });
  await page.mouse.up();
  const after = (await nodes(page).nth(0).boundingBox())!;
  expect(after.y).toBeGreaterThan(before.y + 50);
});
