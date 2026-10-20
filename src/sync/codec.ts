import type { Bytes } from './crypto';

/** Byte plumbing for cloud saves: gzip, base64 and splitting a long string into pieces that fit a bin. */

async function pipe(bytes: Bytes, stream: CompressionStream | DecompressionStream): Promise<Bytes> {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

export const gzip = (bytes: Bytes) => pipe(bytes, new CompressionStream('gzip'));
export const gunzip = (bytes: Bytes) => pipe(bytes, new DecompressionStream('gzip'));

const STEP = 0x8000;

export function toBase64(bytes: Bytes): string {
  let binary = '';
  // In slices, so a large array does not overflow the argument limit of `apply`.
  for (let i = 0; i < bytes.length; i += STEP) binary += String.fromCharCode(...bytes.subarray(i, i + STEP));
  return btoa(binary);
}

export function fromBase64(text: string): Bytes {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Cuts `text` into pieces of at most `size` characters; an empty string is one empty piece. */
export function splitText(text: string, size: number): string[] {
  const pieces: string[] = [];
  for (let i = 0; i < text.length; i += size) pieces.push(text.slice(i, i + size));
  return pieces.length > 0 ? pieces : [''];
}
