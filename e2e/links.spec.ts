import { expect, type Page, test } from '@playwright/test';
import { nodes, openApp, placeNode } from './helpers';

test.beforeEach(async ({ page }) => openApp(page));

const edges = (page: Page) => page.locator('.react-flow__edge');
const linkButton = (page: Page) => page.getByRole('button', { name: 'Link nodes' });

/** Drags from the middle of one locator to the middle of another. */
async function dragBetween(page: Page, from: ReturnType<Page['locator']>, to: ReturnType<Page['locator']>) {
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  if (!a || !b) throw new Error('missing box');
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
}

/** A text node on the left and a math node on the right, with linking mode on. */
async function twoNodes(page: Page) {
  await placeNode(page, 'Text', 300, 300);
  await placeNode(page, 'Math', 900, 400);
  await expect(nodes(page)).toHaveCount(2);
  await page.mouse.click(1300, 800);
  await page.keyboard.press('l');
  await expect(linkButton(page)).toHaveAttribute('aria-pressed', 'true');
  return { text: nodes(page).nth(0), math: nodes(page).nth(1) };
}

test('linking mode toggles from the button and the L key, and Escape leaves it', async ({ page }) => {
  await expect(linkButton(page)).toHaveAttribute('aria-pressed', 'false');
  await linkButton(page).click();
  await expect(linkButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.react-flow.linking')).toHaveCount(1);
  await linkButton(page).click();
  await expect(linkButton(page)).toHaveAttribute('aria-pressed', 'false');

  await page.mouse.click(1300, 800);
  await page.keyboard.press('l');
  await expect(page.locator('.react-flow.linking')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.react-flow.linking')).toHaveCount(0);
});

test('dragging from one node to another links them without moving either, and stays in linking mode', async ({
  page,
}) => {
  const { text, math } = await twoNodes(page);
  // Position only: the math node's size settles as MathLive loads.
  const corner = async (n: typeof text) => {
    const box = await n.boundingBox();
    return [box?.x, box?.y];
  };
  const before = [await corner(text), await corner(math)];
  await dragBetween(page, text, math);
  await expect(edges(page)).toHaveCount(1);
  await expect(page.locator('.react-flow__edge.selected')).toHaveCount(1);
  expect([await corner(text), await corner(math)]).toEqual(before);
  await expect(linkButton(page)).toHaveAttribute('aria-pressed', 'true');

  // The same direction again is refused and says so; the reverse is a second link.
  await dragBetween(page, text, math);
  await expect(page.getByText(/already linked/)).toBeVisible();
  await expect(edges(page)).toHaveCount(1);
  await dragBetween(page, math, text);
  await expect(edges(page)).toHaveCount(2);
});

test('a drag inside the same node makes no link', async ({ page }) => {
  const { text } = await twoNodes(page);
  const box = await text.boundingBox();
  if (!box) throw new Error('missing box');
  await page.mouse.move(box.x + 20, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 60, box.y + 60, { steps: 5 });
  await page.mouse.up();
  await expect(edges(page)).toHaveCount(0);
});

test('outside linking mode a drag moves the node and creates no link', async ({ page }) => {
  await placeNode(page, 'Text', 300, 300);
  await placeNode(page, 'Math', 900, 400);
  await page.mouse.click(1300, 800);
  const text = nodes(page).nth(0);
  const before = await text.boundingBox();
  await dragBetween(page, text.locator('.prose'), nodes(page).nth(1));
  await expect(edges(page)).toHaveCount(0);
  const after = await text.boundingBox();
  expect(after?.x).toBeGreaterThan((before?.x ?? 0) + 100);
});

test('a link can end on a live web node and on a section', async ({ page }) => {
  await page.route('https://web-test.example/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>x</title><h1>hello</h1>' }),
  );
  await page.getByRole('button', { name: 'Insert web', exact: true }).click();
  await page.getByRole('textbox', { name: 'Web address' }).fill('web-test.example');
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('button', { name: 'Load page' }).click();
  await expect(page.locator('.react-flow__node iframe')).toBeVisible();
  await placeNode(page, 'Text', 150, 250);
  await page.mouse.click(1350, 850);
  await page.keyboard.press('l');
  const web = nodes(page).filter({ has: page.locator('iframe') });
  const text = nodes(page).filter({ has: page.locator('.prose') });
  await dragBetween(page, text, web);
  await expect(edges(page)).toHaveCount(1);

  // A section around the text node, then a link from the web node to the section.
  await page.keyboard.press('Escape');
  await text.click();
  await page.keyboard.press('ControlOrMeta+g');
  await page.locator('.react-flow__node-section input').press('Enter');
  await page.mouse.click(1350, 850);
  await page.keyboard.press('l');
  await dragBetween(page, web, page.locator('.react-flow__node-section .node-tab'));
  await expect(edges(page)).toHaveCount(2);
});

test('Delete removes a selected link and Ctrl+Z brings it back in one step', async ({ page }) => {
  const { text, math } = await twoNodes(page);
  await dragBetween(page, text, math);
  await expect(edges(page)).toHaveCount(1);
  await page.keyboard.press('Delete');
  await expect(edges(page)).toHaveCount(0);
  await expect(nodes(page)).toHaveCount(2);
  await page.keyboard.press('ControlOrMeta+z');
  await expect(edges(page)).toHaveCount(1);
  await expect(nodes(page)).toHaveCount(2);
});

test('deleting a node takes its link with it, and one undo restores both', async ({ page }) => {
  const { text, math } = await twoNodes(page);
  await dragBetween(page, text, math);
  await expect(edges(page)).toHaveCount(1);
  await page.keyboard.press('Escape'); // leave linking mode
  await page.mouse.click(1300, 800);
  await nodes(page)
    .nth(0)
    .click({ position: { x: 20, y: 40 } });
  await page.keyboard.press('Delete');
  await expect(nodes(page)).toHaveCount(1);
  await expect(edges(page)).toHaveCount(0);
  await page.keyboard.press('ControlOrMeta+z');
  await expect(nodes(page)).toHaveCount(2);
  await expect(edges(page)).toHaveCount(1);
});

test('links survive a reload', async ({ page }) => {
  const { text, math } = await twoNodes(page);
  await dragBetween(page, text, math);
  await expect(edges(page)).toHaveCount(1);
  await page.waitForTimeout(800); // autosave debounce
  await page.reload();
  await expect(edges(page)).toHaveCount(1);
  await expect(nodes(page)).toHaveCount(2);
});

/**
 * A point on the pipe of the nth link, in page coordinates, that nothing else (the link's own toolbar, a node)
 * covers right now.
 */
async function pointOnLink(page: Page, index = 0) {
  return page
    .locator('.react-flow__edge-interaction')
    .nth(index)
    .evaluate((path: SVGPathElement) => {
      const length = path.getTotalLength();
      for (const fraction of [0.3, 0.12, 0.88, 0.5, 0.2, 0.7, 0.05, 0.95]) {
        const at = path.getPointAtLength(length * fraction);
        const p = new DOMPoint(at.x, at.y).matrixTransform(path.getScreenCTM() as DOMMatrix);
        if (document.elementFromPoint(p.x, p.y) === path) return { x: p.x, y: p.y };
      }
      throw new Error('the whole link is covered');
    });
}

/** Links the two nodes, leaves linking mode and deselects everything. */
async function linkedPair(page: Page) {
  const { text, math } = await twoNodes(page);
  await dragBetween(page, text, math);
  await expect(edges(page)).toHaveCount(1);
  await page.keyboard.press('Escape');
  await page.mouse.click(1300, 800);
  await expect(page.locator('.react-flow__edge.selected')).toHaveCount(0);
  return { text, math };
}

const toolbar = (page: Page) => page.getByRole('toolbar', { name: 'Link options' });

test('clicking a link shows its options, and each change is one undo step', async ({ page }) => {
  await linkedPair(page);
  await expect(toolbar(page)).toHaveCount(0);
  const p = await pointOnLink(page);
  await page.mouse.click(p.x, p.y);
  await expect(page.locator('.react-flow__edge.selected')).toHaveCount(1);
  await expect(toolbar(page)).toBeVisible();

  await toolbar(page).getByRole('button', { name: 'blue' }).click();
  await expect(page.locator('.link')).toHaveAttribute('style', /--link-blue/);
  await toolbar(page).getByRole('button', { name: 'Head: dot' }).click();
  await expect(page.locator('.link-end circle')).toHaveCount(1);
  await expect(page.locator('.link-end polygon')).toHaveCount(0);
  await toolbar(page).getByRole('button', { name: 'Tail: bar' }).click();
  await expect(page.locator('.link-end line')).toHaveCount(1);
  await toolbar(page).getByRole('button', { name: 'Dashed' }).click();
  await expect(page.locator('.link.dashed')).toHaveCount(1);

  await page.keyboard.press('ControlOrMeta+z');
  await expect(page.locator('.link.dashed')).toHaveCount(0);
  await expect(page.locator('.link-end line')).toHaveCount(1);
  await page.keyboard.press('ControlOrMeta+z');
  await expect(page.locator('.link-end line')).toHaveCount(0);

  await page.mouse.click(1300, 800);
  await expect(toolbar(page)).toHaveCount(0);
});

test('swapping turns the link round, and the toolbar can delete it', async ({ page }) => {
  const { text, math } = await linkedPair(page);
  const p = await pointOnLink(page);
  await page.mouse.click(p.x, p.y);
  const arrow = page.locator('.link-end polygon');
  const mathBox = await math.boundingBox();
  const textBox = await text.boundingBox();
  if (!mathBox || !textBox) throw new Error('missing box');
  expect((await arrow.boundingBox())?.x).toBeGreaterThan(mathBox.x - 30);
  await toolbar(page).getByRole('button', { name: 'Swap direction' }).click();
  expect((await arrow.boundingBox())?.x).toBeLessThan(textBox.x + textBox.width + 30);
  await toolbar(page).getByRole('button', { name: 'Delete link' }).click();
  await expect(edges(page)).toHaveCount(0);
  await expect(toolbar(page)).toHaveCount(0);
});

test('right-clicking a link opens its menu', async ({ page }) => {
  await linkedPair(page);
  const p = await pointOnLink(page);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await expect(page.locator('.react-flow__edge.selected')).toHaveCount(1);
  await expect(page.getByRole('menuitem', { name: 'Swap direction' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Dashed' }).click();
  await expect(page.locator('.link.dashed')).toHaveCount(1);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await page.getByRole('menuitem', { name: 'Delete link' }).click();
  await expect(edges(page)).toHaveCount(0);
  await page.keyboard.press('ControlOrMeta+z');
  await expect(edges(page)).toHaveCount(1);
});

const labelInput = (page: Page) => page.getByRole('textbox', { name: 'Link label' });

test('double-clicking a link names it; one undo takes the name away', async ({ page }) => {
  await linkedPair(page);
  const p = await pointOnLink(page);
  await page.mouse.dblclick(p.x, p.y);
  await expect(labelInput(page)).toBeFocused();
  await expect(toolbar(page)).toHaveCount(0);
  await labelInput(page).fill('force');
  await labelInput(page).press('Enter');
  await expect(labelInput(page)).toHaveCount(0);
  await expect(page.locator('.link-label:not(.link-label-halo)')).toHaveText('force');
  await expect(toolbar(page)).toBeVisible();

  await page.mouse.click(1300, 800);
  await page.keyboard.press('ControlOrMeta+z');
  await expect(page.locator('.link-label:not(.link-label-halo)')).toHaveCount(0);
  await expect(edges(page)).toHaveCount(1);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(page.locator('.link-label:not(.link-label-halo)')).toHaveText('force');
});

test('Escape cancels a rename and Delete inside the field leaves the link alone', async ({ page }) => {
  await linkedPair(page);
  const p = await pointOnLink(page);
  await page.mouse.dblclick(p.x, p.y);
  await labelInput(page).fill('draft');
  await labelInput(page).press('Delete');
  await labelInput(page).press('Backspace');
  await expect(edges(page)).toHaveCount(1);
  await labelInput(page).press('Escape');
  await expect(labelInput(page)).toHaveCount(0);
  await expect(page.locator('.link-label:not(.link-label-halo)')).toHaveCount(0);
  await expect(edges(page)).toHaveCount(1);
});

test('a label with a formula renders with KaTeX, and an emptied name clears the label', async ({ page }) => {
  await linkedPair(page);
  const p = await pointOnLink(page);
  await page.mouse.dblclick(p.x, p.y);
  await labelInput(page).fill('rate $\\alpha^2$');
  await labelInput(page).press('Enter');
  await expect(page.locator('.link-label-math .katex')).toBeVisible();
  await expect(page.locator('.link-label-math')).toContainText('rate');

  await page.locator('.link-label-math').dblclick();
  await expect(labelInput(page)).toHaveValue('rate $\\alpha^2$');
  await labelInput(page).fill('');
  await labelInput(page).press('Enter');
  await expect(page.locator('.link-label-math')).toHaveCount(0);
});

test('the menu names a link too', async ({ page }) => {
  await linkedPair(page);
  const p = await pointOnLink(page);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await page.getByRole('menuitem', { name: 'Add label' }).click();
  await expect(labelInput(page)).toBeFocused();
  await labelInput(page).fill('k');
  await labelInput(page).press('Enter');
  await expect(page.locator('.link-label:not(.link-label-halo)')).toHaveText('k');
});

test('a link between Math+ nodes passes the result on as a variable named by its label', async ({ page }) => {
  await placeNode(page, 'Math+', 300, 300);
  await nodes(page).first().locator('math-field').click();
  await expect(nodes(page).first().locator('math-field')).toBeFocused();
  await page.keyboard.type('2+3');
  await page.mouse.click(1300, 800);
  await placeNode(page, 'Math+', 900, 450);
  await nodes(page).nth(1).locator('math-field').click();
  await expect(nodes(page).nth(1).locator('math-field')).toBeFocused();
  await page.keyboard.type('k*2+1');
  await page.mouse.click(1300, 800);
  await expect(nodes(page).nth(1)).toContainText('2k+1');

  await page.keyboard.press('l');
  await dragBetween(page, nodes(page).nth(0), nodes(page).nth(1));
  await expect(edges(page)).toHaveCount(1);
  await page.keyboard.press('Escape');
  await page.mouse.click(1300, 800);

  // Unnamed, the value is called ans, which the formula does not read: a muted chip and nothing changes.
  const chip = nodes(page).nth(1).locator('li[title^="From"]');
  await expect(chip).toContainText('ans');
  await expect(chip).toContainText('5');
  await expect(nodes(page).nth(1)).toContainText('2k+1');

  const p = await pointOnLink(page);
  await page.mouse.dblclick(p.x, p.y);
  await labelInput(page).fill('k');
  await labelInput(page).press('Enter');
  await expect(chip).toContainText('k');
  await expect(nodes(page).nth(1).locator('ol')).toContainText('11');
  await expect(nodes(page).nth(1).locator('ol')).not.toContainText('2k+1');
});

test('a plain click in linking mode does not arm a link that outlives it', async ({ page }) => {
  await placeNode(page, 'Text', 200, 250);
  await placeNode(page, 'Math', 700, 250);
  await placeNode(page, 'Text', 700, 550);
  await page.mouse.click(1300, 800);
  const [a, , c] = [nodes(page).nth(0), nodes(page).nth(1), nodes(page).nth(2)];
  await page.keyboard.press('l');
  await a.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.react-flow.linking')).toHaveCount(0);
  await page.keyboard.press('l');
  await c.click();
  await expect(edges(page)).toHaveCount(0);
});

test('a click followed by a drag elsewhere makes no link from the clicked node', async ({ page }) => {
  await placeNode(page, 'Text', 200, 250);
  await placeNode(page, 'Math', 700, 250);
  await placeNode(page, 'Text', 700, 550);
  await placeNode(page, 'Text', 200, 600);
  await page.mouse.click(1300, 800);
  await page.keyboard.press('l');
  await nodes(page).nth(0).click();
  await dragBetween(page, nodes(page).nth(1), nodes(page).nth(2));
  await expect(edges(page)).toHaveCount(1);
  await nodes(page).nth(3).click();
  await expect(edges(page)).toHaveCount(1);
});

test('Escape in the label field cancels the edit and leaves linking mode on', async ({ page }) => {
  const { text, math } = await twoNodes(page);
  await dragBetween(page, text, math);
  const p = await pointOnLink(page);
  await page.mouse.dblclick(p.x, p.y);
  await labelInput(page).fill('draft');
  await labelInput(page).press('Escape');
  await expect(labelInput(page)).toHaveCount(0);
  await expect(page.locator('.link-label:not(.link-label-halo)')).toHaveCount(0);
  await expect(page.locator('.react-flow.linking')).toHaveCount(1);
});

test('the link toolbar stays on a narrow canvas, wraps, and does not pass the wheel to the canvas', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 700 });
  await placeNode(page, 'Text', 120, 250);
  await placeNode(page, 'Math', 420, 380);
  await page.mouse.click(700, 650);
  await page.keyboard.press('l');
  await dragBetween(page, nodes(page).nth(0), nodes(page).nth(1));
  await expect(toolbar(page)).toBeVisible();
  const box = await toolbar(page).boundingBox();
  expect(box?.x).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(768);

  const viewport = page.locator('.react-flow__viewport');
  const before = await viewport.getAttribute('style');
  const at = await toolbar(page).boundingBox();
  if (!at) throw new Error('no toolbar');
  await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
  await page.mouse.wheel(0, -400);
  await page.waitForTimeout(200);
  expect(await viewport.getAttribute('style')).toBe(before);

  // With the AI panel open the toolbar keeps out from under it.
  await page.getByRole('button', { name: 'AI control' }).click();
  const panel = page.getByRole('switch', { name: /Allow AI agents/ });
  await expect(panel).toBeVisible();
  const panelBox = await panel.boundingBox();
  const moved = await toolbar(page).boundingBox();
  expect(moved && panelBox && moved.x + moved.width <= panelBox.x + 4).toBe(true);
});
