import { describe, expect, it, vi } from 'vitest';
import type { SyncError } from './errors';
import { jsonbin } from './jsonbin';

const reply = (status: number, body: unknown = {}) =>
  vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));
const kindOf = async (p: Promise<unknown>) => ((await p.catch((e) => e)) as SyncError).kind;

describe('jsonbin', () => {
  it('creates a private bin and returns its id', async () => {
    const fetcher = reply(200, { record: {}, metadata: { id: 'abc' } });
    expect(await jsonbin('K', 'master', fetcher).create({ a: 1 })).toBe('abc');
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe('https://api.jsonbin.io/v3/b');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"a":1}');
    expect(init?.headers).toMatchObject({ 'X-Master-Key': 'K', 'X-Bin-Private': 'true' });
  });

  it('sends an access key in its own header', async () => {
    const fetcher = reply(200, { record: 1 });
    await jsonbin('K', 'access', fetcher).read('abc');
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ 'X-Access-Key': 'K' });
    expect(fetcher.mock.calls[0][1]?.headers).not.toHaveProperty('X-Master-Key');
  });

  it('reads the latest record', async () => {
    const fetcher = reply(200, { record: { hi: 1 }, metadata: {} });
    expect(await jsonbin('K', 'master', fetcher).read('a/b')).toEqual({ hi: 1 });
    expect(fetcher.mock.calls[0][0]).toBe('https://api.jsonbin.io/v3/b/a%2Fb/latest');
  });

  it('updates with PUT and removes with DELETE', async () => {
    const fetcher = reply(200);
    const store = jsonbin('K', 'master', fetcher);
    await store.update('abc', [1]);
    await store.remove('abc');
    expect(fetcher.mock.calls.map(([, init]) => init?.method)).toEqual(['PUT', 'DELETE']);
  });

  it('tells a refused key from a record that is too big, though both are 403', async () => {
    const tooBig = {
      message:
        'Free users cannot update a record over 100kb. Upgrade to Pro plan http://api.jsonbin.io/pricing',
    };
    expect(await kindOf(jsonbin('K', 'master', reply(403, tooBig)).update('a', {}))).toBe('too-large');
    expect(
      await kindOf(jsonbin('K', 'master', reply(403, { message: 'Invalid Access Key' })).read('a')),
    ).toBe('auth');
    expect(await kindOf(jsonbin('K', 'master', reply(401)).read('a'))).toBe('auth');
  });

  it('maps the other failures', async () => {
    expect(await kindOf(jsonbin('K', 'master', reply(404)).read('a'))).toBe('not-found');
    expect(await kindOf(jsonbin('K', 'master', reply(429)).read('a'))).toBe('rate-limit');
    expect(await kindOf(jsonbin('K', 'master', reply(500, { message: 'oops' })).read('a'))).toBe('other');
    const offline = vi.fn<typeof fetch>(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await kindOf(jsonbin('K', 'master', offline).read('a'))).toBe('network');
  });
});
