import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { type BrowserContext, chromium, expect, test } from '@playwright/test';

const EXTENSION = resolve(import.meta.dirname, '../extension');
const APP = 'http://localhost:4173/app/';

/** A site that refuses to be framed, the way Gemini does. */
async function listenUnframable() {
  const server = createServer((req, res) => {
    res.writeHead(200, {
      'content-type': 'text/html',
      'x-frame-options': 'DENY',
      'content-security-policy': "frame-ancestors 'none'",
    });
    res.end(`<!doctype html><title>Unframable ${req.url}</title><h1>framed ok</h1><a href="/next">next</a>`);
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const { port } = server.address() as { port: number };
  // Not 127.0.0.1 or localhost: the extension counts those as Unlined itself (see `launch`).
  return { url: `http://unframable.test:${port}`, close: () => server.close() };
}

async function launch(withExtension: boolean) {
  const dir = await mkdtemp(join(tmpdir(), 'unlined-ext-'));
  const context = await chromium.launchPersistentContext(dir, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1440, height: 900 },
    args: [
      '--host-resolver-rules=MAP unframable.test 127.0.0.1',
      ...(withExtension ? [`--disable-extensions-except=${EXTENSION}`, `--load-extension=${EXTENSION}`] : []),
    ],
  });
  if (withExtension && context.serviceWorkers().length === 0)
    await context.waitForEvent('serviceworker', { timeout: 15_000 });
  const cleanup = async () => {
    await context.close();
    await rm(dir, { recursive: true, force: true });
  };
  return { context, cleanup };
}

async function openSite(context: BrowserContext, site: string) {
  const page = await context.newPage();
  await page.goto(APP);
  await page.getByRole('button', { name: 'Insert web', exact: true }).click();
  await page.getByRole('textbox', { name: 'Web address' }).fill(site);
  await page.getByRole('button', { name: 'OK' }).click();
  // A page waits for a click to load.
  await page.getByRole('button', { name: 'Load page' }).click();
  return page;
}

test('the extension lets a site that forbids framing load, and reports back', async () => {
  const site = await listenUnframable();
  const { context, cleanup } = await launch(true);
  try {
    const page = await openSite(context, site.url);
    const frame = page.frameLocator('.react-flow__node iframe');
    await expect(frame.getByRole('heading', { name: 'framed ok' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-unlined-web', /\d/);
    await expect(page.locator('.react-flow__node').getByText(`Unframable /`)).toBeVisible();
    await expect(page.getByText('Unlined Web extension lets them')).toHaveCount(0);

    // Following a link inside the frame keeps working, and the app learns the new address.
    await frame.getByRole('link', { name: 'next' }).click();
    await expect(page.getByRole('textbox', { name: 'Web address' })).toHaveValue(`${site.url}/next`);
    await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();

    // Other tabs are left alone: a page there still cannot be framed.
    const other = await context.newPage();
    await other.goto(`${site.url}/other`);
    await other.evaluate((src) => {
      const f = document.createElement('iframe');
      f.src = src;
      f.id = 'probe';
      document.body.append(f);
    }, site.url);
    await other.waitForTimeout(1000);
    await expect(other.frameLocator('#probe').getByRole('heading', { name: 'framed ok' })).toHaveCount(0);
  } finally {
    await cleanup();
    site.close();
  }
});

test('without the extension the same site is refused', async () => {
  const site = await listenUnframable();
  const { context, cleanup } = await launch(false);
  try {
    const page = await openSite(context, site.url);
    await expect(page.getByText('Unlined Web extension lets them')).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(
      page.frameLocator('.react-flow__node iframe').getByRole('heading', { name: 'framed ok' }),
    ).toHaveCount(0);
  } finally {
    await cleanup();
    site.close();
  }
});

test('the extension answers a grab request with the playing video as a JPEG', async () => {
  const server = createServer((_, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!doctype html><title>Player</title><video id="v" muted autoplay playsinline></video><script>
      const c = Object.assign(document.createElement('canvas'), { width: 320, height: 180 });
      const x = c.getContext('2d');
      setInterval(() => { x.fillStyle = '#d33'; x.fillRect(0, 0, 320, 180); }, 50);
      v.srcObject = c.captureStream(20);
    </script>`);
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const { port } = server.address() as { port: number };
  const { context, cleanup } = await launch(true);
  try {
    const page = await openSite(context, `http://unframable.test:${port}`);
    await expect(page.locator('html')).toHaveAttribute('data-unlined-web', /\d/);
    const reply = await page.evaluate(
      () =>
        new Promise<{ type: string; width: number; black: boolean; error?: string; size: number }>(
          (resolve) => {
            const frame =
              document.querySelector<HTMLIFrameElement>('.react-flow__node iframe')?.contentWindow;
            const ask = () =>
              frame?.postMessage({ source: 'unlined-web', type: 'command', command: 'grab', id: 7 }, '*');
            window.addEventListener('message', (e) => {
              if (e.data?.type !== 'frame' || e.data.id !== 7) return;
              // The video may not have a picture yet: ask again.
              if (e.data.error === 'no-video') return void setTimeout(ask, 200);
              resolve({ ...e.data, size: e.data.blob?.size ?? 0 });
            });
            ask();
          },
        ),
    );
    expect(reply.error).toBeUndefined();
    expect(reply.width).toBe(320);
    expect(reply.black).toBe(false);
    expect(reply.size).toBeGreaterThan(0);
  } finally {
    await cleanup();
    server.close();
  }
});
