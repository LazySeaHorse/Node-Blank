import { SyncError } from './errors';

const API = 'https://api.jsonbin.io/v3/b';

/** Which header the key goes in: a master key, or an access key with narrower permissions. */
export type KeyKind = 'master' | 'access';

/** The few things the sync needs from a store of JSON records. */
export interface BinStore {
  /** Makes a private bin holding `data` and returns its id. */
  create(data: unknown): Promise<string>;
  read(id: string): Promise<unknown>;
  update(id: string, data: unknown): Promise<void>;
  remove(id: string): Promise<void>;
}

/** A free plan refuses writes over 100 kB with a 403, the same status as a refused key; the message tells them apart. */
const SIZE_MESSAGE = /\b(?:100\s?kb|1\s?mb)\b|upgrade/i;

async function fail(response: Response): Promise<never> {
  const message = await response
    .json()
    .then((body: { message?: unknown }) => (typeof body.message === 'string' ? body.message : ''))
    .catch(() => '');
  switch (response.status) {
    case 401:
      throw new SyncError('auth', 'JSONBin refused the key.');
    case 403:
      throw SIZE_MESSAGE.test(message)
        ? new SyncError('too-large', 'This is too big for your JSONBin plan.')
        : new SyncError('auth', 'JSONBin refused the key, or the key is not allowed to do this.');
    case 404:
      throw new SyncError('not-found', 'JSONBin has no such bin.');
    case 429:
      throw new SyncError('rate-limit', 'JSONBin is limiting requests. Try again in a while.');
    default:
      throw new SyncError('other', message || `JSONBin answered ${response.status}.`);
  }
}

export function jsonbin(key: string, kind: KeyKind, fetcher: typeof fetch = fetch): BinStore {
  const headers = {
    'Content-Type': 'application/json',
    [kind === 'master' ? 'X-Master-Key' : 'X-Access-Key']: key,
  };

  const call = async (url: string, init: RequestInit): Promise<Response> => {
    let response: Response;
    try {
      response = await fetcher(url, { ...init, headers: { ...headers, ...init.headers } });
    } catch {
      throw new SyncError('network', 'Could not reach JSONBin. Check your connection.');
    }
    if (!response.ok) await fail(response);
    return response;
  };

  return {
    async create(data) {
      const response = await call(API, {
        method: 'POST',
        headers: { 'X-Bin-Private': 'true' },
        body: JSON.stringify(data),
      });
      const body = (await response.json()) as { metadata?: { id?: unknown } };
      if (typeof body.metadata?.id !== 'string')
        throw new SyncError('other', 'JSONBin did not say which bin it made.');
      return body.metadata.id;
    },
    async read(id) {
      const response = await call(`${API}/${encodeURIComponent(id)}/latest`, { method: 'GET' });
      return ((await response.json()) as { record: unknown }).record;
    },
    async update(id, data) {
      await call(`${API}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async remove(id) {
      await call(`${API}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  };
}
