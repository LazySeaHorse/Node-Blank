import { expect, type Locator, type Page, test } from '@playwright/test';
import { nodes, openApp, placeNode } from './helpers';

test.beforeEach(async ({ page }) => openApp(page));

const sheet = (page: Page) => nodes(page).filter({ has: page.locator('.Spreadsheet') });
const cell = (page: Page, row: number, col: number): Locator =>
  sheet(page)
    .locator('tr')
    .nth(row + 1)
    .locator('td.Spreadsheet__cell')
    .nth(col);

async function typeInto(page: Page, row: number, col: number, text: string) {
  // Enter moves the active cell down, and the grid's overlay for it covers the next click target.
  await cell(page, row, col).click({ force: true });
  await page.keyboard.type(text);
  await page.keyboard.press('Enter');
}

async function newSheet(page: Page) {
  await placeNode(page, 'Sheet', 500, 300);
  await expect(sheet(page)).toHaveCount(1);
}

test('Ctrl+Z on a selected cell undoes the cell edit, not an earlier edit elsewhere', async ({ page }) => {
  await placeNode(page, 'Math', 200, 600);
  const field = nodes(page).locator('math-field');
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.type('abc');
  await expect(field).toHaveJSProperty('value', 'abc');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500); // past the undo coalescing window, so the sheet edit is its own step

  await placeNode(page, 'Sheet', 700, 250);
  await expect(sheet(page)).toHaveCount(1);
  await page.waitForTimeout(500); // edits within 400ms of each other share one undo step; keep the sheet's own
  await typeInto(page, 0, 0, '12');
  await expect(cell(page, 0, 0)).toHaveText('12');
  await cell(page, 0, 0).click();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(cell(page, 0, 0)).toHaveText('');
  await expect(field).toHaveJSProperty('value', 'abc');
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(cell(page, 0, 0)).toHaveText('12');
});

test('formula bar shows and edits the active cell', async ({ page }) => {
  await newSheet(page);
  await typeInto(page, 0, 0, '2');
  await typeInto(page, 1, 0, '3');
  await typeInto(page, 2, 0, '=SUM(A1:A2)');
  await cell(page, 2, 0).click();
  const bar = page.getByLabel('Formula bar');
  await expect(bar).toHaveValue('=SUM(A1:A2)');
  await expect(sheet(page).getByText('A3', { exact: true })).toBeVisible();
  await bar.fill('=A1*10');
  await bar.press('Enter');
  await expect(cell(page, 2, 0)).toHaveText('20');
});

test('cell fills colour the selected cells', async ({ page }) => {
  await newSheet(page);
  await cell(page, 0, 0).click();
  await cell(page, 1, 1).click({ modifiers: ['Shift'] });
  await sheet(page).getByLabel('Cell fill').click();
  await page.getByLabel('Fill yellow').click();
  await page.keyboard.press('Escape');
  await expect(sheet(page).locator('td.sheet-fill-yellow')).toHaveCount(4);
});

test('row commands do exact arithmetic and report mistakes', async ({ page }) => {
  await newSheet(page);
  await sheet(page).getByRole('button', { name: 'a/b' }).click();
  await typeInto(page, 0, 0, '3');
  await typeInto(page, 0, 1, '2');
  await typeInto(page, 1, 0, '1');
  await typeInto(page, 1, 1, '1');
  const command = page.getByLabel('Row or column operation');

  await command.fill('R1 /= 3');
  await command.press('Enter');
  await expect(cell(page, 0, 0)).toHaveText('1');
  await expect(cell(page, 0, 1)).toHaveText('2/3');

  await command.fill('R2 -= R1');
  await command.press('Enter');
  await expect(cell(page, 1, 1)).toHaveText('1/3');

  await command.fill('R9 -= R1');
  await command.press('Enter');
  await expect(page.getByRole('alert')).toContainText('does not exist');
});

test('fraction mode keeps typed fractions as numbers in formulas and shows results as fractions', async ({
  page,
}) => {
  await newSheet(page);
  await sheet(page).getByRole('button', { name: 'a/b' }).click();
  await typeInto(page, 0, 0, '1/3');
  await typeInto(page, 1, 0, '1/6');
  await typeInto(page, 2, 0, '=A1+A2');
  await expect(cell(page, 0, 0)).toHaveText('1/3');
  await expect(cell(page, 2, 0)).toHaveText('1/2');
});

test('right-clicking a row header starts a row operation in the command box', async ({ page }) => {
  await newSheet(page);
  await sheet(page).locator('tr').nth(3).locator('th').click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Add a multiple of another row…' }).click();
  await expect(page.getByLabel('Row or column operation')).toHaveValue('R3 += ');
  await expect(page.getByLabel('Row or column operation')).toBeFocused();
});

async function typeNote(page: Page, text: string) {
  await placeNode(page, 'Text', 500, 300);
  await nodes(page).dblclick();
  await page.locator('textarea').fill(text);
  await page.keyboard.press('Escape');
  await page.mouse.click(1000, 700);
}

test('a note that is only a table offers a table or a sheet', async ({ page }) => {
  await typeNote(page, '| Item | Cost |\n| --- | --- |\n| Tea | 3 |');
  await expect(nodes(page).getByText('This is only a table.')).toBeVisible();
  await nodes(page).getByRole('button', { name: 'Sheet' }).click();
  await expect(sheet(page)).toHaveCount(1);
  await expect(cell(page, 1, 0)).toHaveText('Tea');
});

test('a note that is only maths offers a math node', async ({ page }) => {
  await typeNote(page, '$$x^2 + 1$$');
  await nodes(page).getByRole('button', { name: 'Math node' }).click();
  await expect(nodes(page).locator('math-field')).toHaveCount(1);
});

test('the offer can be dismissed and stays away', async ({ page }) => {
  await typeNote(page, '$$x^2 + 1$$');
  await nodes(page).getByRole('button', { name: 'Dismiss suggestion' }).click();
  await expect(nodes(page).getByText('This is only maths.')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.react-flow__pane')).toBeVisible();
  await expect(nodes(page).getByText('This is only maths.')).toHaveCount(0);
});

test('prose around a table gets no offer', async ({ page }) => {
  await typeNote(page, 'Prices:\n\n| Item | Cost |\n| --- | --- |\n| Tea | 3 |');
  await expect(nodes(page).getByText('This is only a table.')).toHaveCount(0);
});
