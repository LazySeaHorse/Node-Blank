// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { fromBase64, gunzip, gzip, splitText, toBase64 } from './codec';

describe('gzip', () => {
  it('round-trips and shrinks repetitive text', async () => {
    const bytes = new TextEncoder().encode('{"a":1}'.repeat(5000));
    const packed = await gzip(bytes);
    expect(packed.length).toBeLessThan(bytes.length / 10);
    expect(await gunzip(packed)).toEqual(bytes);
  });
});

describe('base64', () => {
  it('round-trips every byte value, including past the slice size', () => {
    const bytes = Uint8Array.from({ length: 100_000 }, (_, i) => i % 256);
    expect(fromBase64(toBase64(bytes))).toEqual(bytes);
  });
});

describe('splitText', () => {
  it('cuts into pieces no longer than the size, keeping order', () => {
    const pieces = splitText('abcdefghij', 4);
    expect(pieces).toEqual(['abcd', 'efgh', 'ij']);
    expect(pieces.join('')).toBe('abcdefghij');
  });

  it('gives an empty string one empty piece', () => {
    expect(splitText('', 4)).toEqual(['']);
  });
});
