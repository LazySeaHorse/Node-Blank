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
  await expect(addressBar(page)).toHaveAttribute('title', 'Page /one');
  await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();

  await addressBar(page).fill(`${HOST}/two`);
  await addressBar(page).press('Enter');
  // The page navigated itself and reported the result; the iframe element was not reloaded by the app.
  await expect(addressBar(page)).toHaveAttribute('title', 'Page /two');
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
