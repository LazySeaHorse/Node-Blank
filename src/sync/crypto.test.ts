// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { type Bytes, DecryptError, deriveKey, newSalt, open, seal } from './crypto';

// Few iterations: the tests are about the shape of the scheme, not the cost of the derivation.
const key = (password: string, salt: Bytes) => deriveKey(password, salt, 1000);
const bytes = (s: string) => new TextEncoder().encode(s);

describe('crypto', () => {
  it('opens what it sealed', async () => {
    const k = await key('hunter2', newSalt());
    const sealed = await seal(k, bytes('hello'), 'ctx');
    expect(new TextDecoder().decode(await open(k, sealed, 'ctx'))).toBe('hello');
  });

  it('seals the same message differently each time', async () => {
    const k = await key('hunter2', newSalt());
    expect(await seal(k, bytes('hello'), 'ctx')).not.toEqual(await seal(k, bytes('hello'), 'ctx'));
  });

  it('refuses a wrong password', async () => {
    const salt = newSalt();
    const sealed = await seal(await key('right', salt), bytes('hello'), 'ctx');
    await expect(open(await key('wrong', salt), sealed, 'ctx')).rejects.toBeInstanceOf(DecryptError);
  });

  it('refuses a different context, so data cannot be moved between canvases', async () => {
    const k = await key('hunter2', newSalt());
    const sealed = await seal(k, bytes('hello'), 'canvas:a');
    await expect(open(k, sealed, 'canvas:b')).rejects.toBeInstanceOf(DecryptError);
  });

  it('refuses tampered or truncated data', async () => {
    const k = await key('hunter2', newSalt());
    const sealed = await seal(k, bytes('hello'), 'ctx');
    const flipped = sealed.slice();
    flipped[flipped.length - 1] ^= 1;
    await expect(open(k, flipped, 'ctx')).rejects.toBeInstanceOf(DecryptError);
    await expect(open(k, sealed.slice(0, 5), 'ctx')).rejects.toBeInstanceOf(DecryptError);
  });
});
