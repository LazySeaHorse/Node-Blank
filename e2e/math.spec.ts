import { expect, test } from '@playwright/test';
import { nodes, openApp, placeNode } from './helpers';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });
test.beforeEach(async ({ page }) => openApp(page));

test('React Flow attribution is hidden', async ({ page }) => {
  await expect(page.locator('.react-flow__attribution')).toHaveCount(0);
});

for (const tool of ['Math', 'Math+']) {
  test(`${tool}: mouse places the caret and selects text`, async ({ page }) => {
    await placeNode(page, tool);
    const field = nodes(page).locator('math-field');
    await field.click();
    await expect(field).toBeFocused();
    await page.keyboard.type('abc');
    await expect.poll(() => field.evaluate((el: HTMLElement & { value: string }) => el.value)).toBe('abc');
    const box = await field.boundingBox();
    if (!box) throw new Error('missing field box');

    await page.mouse.click(box.x + 2, box.y + box.height / 2);
    expect(await field.evaluate((el: HTMLElement & { position: number }) => el.position)).toBe(0);

    await page.mouse.move(box.x + 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 40, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    expect(
      await field.evaluate((el: HTMLElement & { selectionIsCollapsed: boolean }) => el.selectionIsCollapsed),
    ).toBe(false);
  });
}

test('Math+: copy button puts the result LaTeX on the clipboard', async ({ page }) => {
  await placeNode(page, 'Math+');
  const field = nodes(page).locator('math-field');
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.type('1/3');
  const result = nodes(page).locator('li', { hasText: '=' }).first();
  await expect(result).toBeVisible();
  await result.hover();
  await result.getByRole('button', { name: 'Copy LaTeX' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('frac');
});

test('Ctrl+D waits while typing in a math field; Escape hands the node back to the canvas', async ({
  page,
}) => {
  await placeNode(page, 'Math');
  const field = nodes(page).locator('math-field');
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.press('ControlOrMeta+d');
  await expect(nodes(page)).toHaveCount(1);
  await page.keyboard.press('Escape');
  await page.keyboard.press('ControlOrMeta+d');
  await expect(nodes(page)).toHaveCount(2);
});
