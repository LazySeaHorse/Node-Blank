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

test('right-clicking selected cells offers a fill for all of them', async ({ page }) => {
  await newSheet(page);
  await cell(page, 0, 0).click();
  await cell(page, 1, 1).click({ modifiers: ['Shift'] });
  await cell(page, 1, 1).click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Fill' }).click();
  await page.getByRole('menuitem', { name: 'Yellow' }).click();
  await expect(sheet(page).locator('td.sheet-fill-yellow')).toHaveCount(4);
  await expect(sheet(page).getByRole('button', { name: 'Cell fill' })).toHaveCount(0);
});

const rowHeader = (page: Page, row: number) =>
  sheet(page)
    .locator('tr')
    .nth(row + 1)
    .locator('th');
const columnHeader = (page: Page, column: number) =>
  sheet(page)
    .locator('tr')
    .first()
    .locator('th')
    .nth(column + 1);

test('a selected row takes operations from the right-click menu, and the formula bar lives in the header', async ({
  page,
}) => {
  await newSheet(page);
  await expect(sheet(page).locator('header').getByLabel('Formula bar')).toBeVisible();
  await sheet(page).getByRole('button', { name: 'a/b' }).click();
  await typeInto(page, 0, 0, '3');
  await typeInto(page, 0, 1, '2');
  await typeInto(page, 1, 0, '1');
  await typeInto(page, 1, 1, '1');

  await rowHeader(page, 0).click();
  await rowHeader(page, 0).click({ button: 'right' });
  const box = page.getByLabel('Operation on R1');
  await expect(box).toBeFocused();
  await box.fill('/= 3');
  await box.press('Enter');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(cell(page, 0, 0)).toHaveText('1');
  await expect(cell(page, 0, 1)).toHaveText('2/3');

  // Right-clicking a header that is not selected selects it first; mistakes are reported in the menu.
  await rowHeader(page, 1).click({ button: 'right' });
  await page.getByLabel('Operation on R2').fill('-= R9');
  await page.getByLabel('Operation on R2').press('Enter');
  await expect(page.getByRole('alert')).toContainText('does not exist');
  await page.getByLabel('Operation on R2').fill('-= R1');
  await page.getByLabel('Operation on R2').press('Enter');
  await expect(cell(page, 1, 1)).toHaveText('1/3');
});

test('row operations on formulas write formulas that stay live', async ({ page }) => {
  await newSheet(page);
  await typeInto(page, 0, 0, '2');
  await typeInto(page, 1, 0, '5');
  await typeInto(page, 0, 1, '=A1*10');
  await typeInto(page, 1, 1, '7');
  await rowHeader(page, 1).click();
  await rowHeader(page, 1).click({ button: 'right' });
  await page.getByLabel('Operation on R2').fill('-= R1');
  await page.getByLabel('Operation on R2').press('Enter');
  await expect(cell(page, 1, 0)).toHaveText('3');
  await expect(cell(page, 1, 1)).toHaveText('-13');
  await cell(page, 1, 1).click();
  await expect(page.getByLabel('Formula bar')).toHaveValue('=7-(A1*10)');
  // Change what the formula depends on: the new cell follows.
  await typeInto(page, 0, 0, '3');
  await expect(cell(page, 1, 1)).toHaveText('-23');
});

test('a selected column takes operations too', async ({ page }) => {
  await newSheet(page);
  await typeInto(page, 0, 0, '1');
  await typeInto(page, 1, 0, '2');
  await typeInto(page, 0, 1, '5');
  await typeInto(page, 1, 1, '6');
  await columnHeader(page, 1).click();
  await columnHeader(page, 1).click({ button: 'right' });
  await page.getByLabel('Operation on C2').fill('-= 2*C1');
  await page.getByLabel('Operation on C2').press('Enter');
  await expect(cell(page, 0, 1)).toHaveText('3');
  await expect(cell(page, 1, 1)).toHaveText('2');
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

test('typed fractions are numbers in decimal mode too', async ({ page }) => {
  await newSheet(page);
  await typeInto(page, 0, 0, '1/4');
  await typeInto(page, 1, 0, '1/4');
  await typeInto(page, 2, 0, '=A1+A2');
  await expect(cell(page, 2, 0)).toHaveText('0.5');
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
