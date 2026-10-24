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

test('pasting multi-line math into a line of a multi-line field cannot nest it and break the node', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // MathLive rejecting a saved value is caught so the canvas survives, but it must not happen at all.
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await placeNode(page, 'Math');
  const field = nodes(page).locator('math-field');
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.type('a');
  await page.keyboard.press('Shift+Enter');
  await page.keyboard.type('b');
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('ControlOrMeta+c');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('End');
  await page.keyboard.press('ControlOrMeta+v');

  // What gets saved is never nested, so reopening or duplicating the node cannot crash MathLive.
  await page.waitForTimeout(800); // autosave debounce
  await page.reload();
  await expect(field).toBeVisible();
  await page.keyboard.press('Escape');
  await nodes(page)
    .first()
    .click({ position: { x: 2, y: 2 } });
  await page.keyboard.press('ControlOrMeta+d');
  await expect(nodes(page)).toHaveCount(2);
  await expect(nodes(page).locator('math-field')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('duplicating a multi-line Math+ node works', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await placeNode(page, 'Math+');
  const field = nodes(page).locator('math-field');
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.type('a:=2');
  await page.keyboard.press('Shift+Enter');
  await page.keyboard.type('a*3');
  await page.keyboard.press('Escape');
  await page.keyboard.press('ControlOrMeta+d');
  await expect(nodes(page)).toHaveCount(2);
  await expect(nodes(page).locator('math-field')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('a command committed from LaTeX mode takes the next key as its argument', async ({ page }) => {
  await placeNode(page, 'Math');
  const field = nodes(page).locator('math-field');
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.type('x+\\hat');
  await expect.poll(() => field.evaluate((el: HTMLElement & { mode: string }) => el.mode)).toBe('latex');
  await page.keyboard.press('Enter');
  await page.keyboard.type('U');
  await expect
    .poll(() => field.evaluate((el: HTMLElement & { value: string }) => el.value))
    .toBe('x+\\hat{U}');
});

test('a drag that ends inside a square root selects the whole root', async ({ page }) => {
  await placeNode(page, 'Math');
  const field = nodes(page).locator('math-field');
  await field.click();
  await expect(field).toBeFocused();
  await field.evaluate((el: HTMLElement & { setValue: (v: string) => void }) =>
    el.setValue('ab+\\sqrt{xyzw}'),
  );
  const box = await field.boundingBox();
  if (!box) throw new Error('missing field box');
  await page.mouse.move(box.x + 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  const selected = await field.evaluate(
    (el: HTMLElement & { selection: unknown; getValue: (s: unknown, f: string) => string }) =>
      el.getValue(el.selection, 'latex'),
  );
  expect(selected).toBe('ab+\\sqrt{xyzw}');
});

test('Ctrl+Z in a field steps back through the one canvas history, newest edit first', async ({ page }) => {
  await placeNode(page, 'Math', 400, 300);
  const field = nodes(page).locator('math-field');
  const math = () => field.evaluate((el: HTMLElement & { value: string }) => el.value);
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.type('x+1');
  await expect.poll(math).toBe('x+1');
  await page.keyboard.press('Escape');

  await placeNode(page, 'Text', 800, 500);
  await page.locator('.react-flow__node-text .p-4').dblclick();
  const textarea = page.locator('.react-flow__node-text textarea');
  await expect(textarea).toBeFocused();
  await page.waitForTimeout(500); // past the undo coalescing window, so the typing is its own step
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('ab');
  await expect(textarea).toHaveValue('ab');

  await page.keyboard.press('ControlOrMeta+z');
  await expect(textarea).not.toHaveValue('ab');
  expect(await math()).toBe('x+1');
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(textarea).toHaveValue('ab');
  expect(await math()).toBe('x+1');

  // In the math field too, Ctrl+Z is the canvas's: the newest edit is the text, not the math.
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(nodes(page).locator('.react-flow__node-text', { hasText: 'ab' })).toHaveCount(0);
  expect(await math()).toBe('x+1');
});

test('math written in black turns light in dark mode', async ({ page }) => {
  await placeNode(page, 'Math');
  const field = nodes(page).locator('math-field');
  await field.click();
  await expect(field).toBeFocused();
  await field.evaluate((el: HTMLElement & { setValue: (v: string) => void }) =>
    el.setValue('\\textcolor{black}{B}'),
  );
  await page.keyboard.press('Escape');
  const color = () =>
    field.evaluate((el) => {
      const atom = el.shadowRoot?.querySelector<HTMLElement>('[style*="color"]');
      return atom ? getComputedStyle(atom).color : null;
    });
  await expect.poll(color).toBe('rgb(0, 0, 0)');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect.poll(color).toBe('rgb(255, 255, 255)');
});
