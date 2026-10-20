import { expect, type Page, test } from '@playwright/test';
import { nodes, openApp } from './helpers';

const HOST = 'https://web-test.example';

/**
 * Serves pages from a made-up host. `reporting` pages behave as if the extension's script ran in them:
 * they tell the app where they are, and follow its `navigate` command.
 */
async function serve(page: Page, reporting: boolean) {
  await page.route(`${HOST}/**`, (route) => {
    const body = `<!doctype html><title>Page ${new URL(route.request().url()).pathname}</title><h1>hello</h1>
      ${
        reporting
          ? `<script>
        parent.postMessage({ source: 'node-blank-web', type: 'state', url: location.href, title: document.title, canGoBack: true }, '*');
        addEventListener('message', (e) => { if (e.data?.command === 'navigate') location.href = e.data.url; });
      </script>`
          : ''
      }`;
    return route.fulfill({ contentType: 'text/html', body });
  });
}

async function insertWeb(page: Page, address: string) {
  await page.getByRole('button', { name: 'Insert web', exact: true }).click();
  await page.getByRole('textbox', { name: 'Web address' }).fill(address);
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(nodes(page)).toHaveCount(1);
  // A page waits for a click to load.
  await page.getByRole('button', { name: 'Load page' }).click();
}

const frame = (page: Page) => page.locator('.react-flow__node iframe');
const addressBar = (page: Page) =>
  page.locator('.react-flow__node').getByRole('textbox', { name: 'Web address' });

test.beforeEach(async ({ page }) => openApp(page));

test('inserts a web node and normalises a bare address', async ({ page }) => {
  await serve(page, false);
  await insertWeb(page, 'web-test.example/one');
  await expect(frame(page)).toHaveAttribute('src', `${HOST}/one`);
  await expect(frame(page)).toHaveAttribute('sandbox', /allow-scripts/);
  await expect(frame(page)).not.toHaveAttribute('sandbox', /allow-top-navigation/);
  await expect(addressBar(page)).toHaveValue(`${HOST}/one`);
});

test('the address bar loads a new page when the frame cannot report', async ({ page }) => {
  await serve(page, false);
  await insertWeb(page, `${HOST}/one`);
  await addressBar(page).fill('web-test.example/two');
  await addressBar(page).press('Enter');
  await expect(frame(page)).toHaveAttribute('src', `${HOST}/two`);
  await expect(addressBar(page)).toHaveValue(`${HOST}/two`);
});

test('follows what the framed page reports and navigates through it', async ({ page }) => {
  await serve(page, true);
  await insertWeb(page, `${HOST}/one`);
  await expect(page.locator('.react-flow__node').getByText('Page /one')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();

  await addressBar(page).fill(`${HOST}/two`);
  await addressBar(page).press('Enter');
  // The page navigated itself and reported the result; the iframe element was not reloaded by the app.
  await expect(page.locator('.react-flow__node').getByText('Page /two')).toBeVisible();
  await expect(addressBar(page)).toHaveValue(`${HOST}/two`);
  await expect(frame(page)).toHaveAttribute('src', `${HOST}/one`);
});

test('the framed page only receives pointer events once its node is selected', async ({ page }) => {
  await serve(page, false);
  await insertWeb(page, `${HOST}/one`);
  await expect(frame(page)).not.toHaveClass(/pointer-events-none/);
  await page.mouse.click(1380, 860);
  await expect(frame(page)).toHaveClass(/pointer-events-none/);
});

test('unloads the page when zoomed far out and resumes at the same address', async ({ page }) => {
  await serve(page, true);
  await insertWeb(page, `${HOST}/one`);
  await addressBar(page).fill(`${HOST}/two`);
  await addressBar(page).press('Enter');
  await expect(addressBar(page)).toHaveValue(`${HOST}/two`);

  // A selected node stays running, so deselect it before zooming out.
  await page.mouse.click(1380, 860);
  // Clicks made while the view is still animating can be lost, so keep zooming until the page is gone.
  await expect(async () => {
    await page.getByRole('button', { name: 'Zoom out' }).click();
    await expect(frame(page)).toHaveCount(0, { timeout: 400 });
  }).toPass();
  // Far out the node is a titled tile, so its stand-in is in the page but not shown.
  await expect(page.getByRole('button', { name: 'Load page' })).toBeAttached();

  // Coming back does not load it again: that takes a click, and it resumes at the same address.
  await page.getByRole('button', { name: /%$/ }).click();
  await expect(frame(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Load page' }).click();
  await expect(frame(page)).toHaveAttribute('src', `${HOST}/two`);
});

test('loads by itself when set to', async ({ page }) => {
  await serve(page, false);
  await insertWeb(page, `${HOST}/one`);
  // A selected page takes the mouse for itself, so deselect it first.
  await page.mouse.click(1380, 860);
  await page.locator('.react-flow__node').click({ button: 'right', position: { x: 20, y: 120 } });
  await page.getByRole('menuitem', { name: 'Load automatically' }).click();
  await page.waitForTimeout(800); // autosave debounce
  await page.reload();
  await expect(frame(page)).toHaveAttribute('src', `${HOST}/one`);
});

test('suggests the extension when it is not installed', async ({ page }) => {
  await serve(page, false);
  await insertWeb(page, `${HOST}/one`);
  await expect(page.getByText('Node-Blank Web extension lets them')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open in tab', exact: true })).toHaveCount(2);
});

test('stays quiet when the extension is installed', async ({ page }) => {
  // What the extension's content script does before the app starts.
  await page.addInitScript(() => {
    const mark = () => {
      document.documentElement.dataset.nodeBlankWeb = '1.0.0';
    };
    if (document.documentElement) mark();
    else document.addEventListener('readystatechange', mark, { once: true });
  });
  await openApp(page);
  await serve(page, true);
  await insertWeb(page, `${HOST}/one`);
  await expect(frame(page)).toBeVisible();
  await expect(page.getByText('Node-Blank Web extension lets them')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open in tab', exact: true })).toHaveCount(1);
});
