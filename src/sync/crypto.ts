/**
 * Password-based encryption for cloud saves. A key is derived from the password with PBKDF2 and a random
 * salt that is stored (in the clear) beside the data; AES-GCM then seals each message under a fresh IV.
 * `context` is authenticated but not stored, so a sealed message only opens where it was meant to be used.
 */

export const KDF_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

/** The password was wrong, or the data was changed or is not what it claims to be. */
export class DecryptError extends Error {
  constructor() {
    super('Could not decrypt: wrong password, or the data is damaged.');
  }
}

/** Web Crypto takes views over plain buffers only, not shared ones. */
export type Bytes = Uint8Array<ArrayBuffer>;

const text = new TextEncoder();

export const newSalt = (): Bytes => crypto.getRandomValues(new Uint8Array(SALT_BYTES));

export async function deriveKey(password: string, salt: Bytes, iterations = KDF_ITERATIONS) {
  const material = await crypto.subtle.importKey('raw', text.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** The IV followed by the ciphertext. */
export async function seal(key: CryptoKey, plain: Bytes, context: string): Promise<Bytes> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: text.encode(context) },
    key,
    plain,
  );
  const out = new Uint8Array(IV_BYTES + cipher.byteLength);
  out.set(iv);
  out.set(new Uint8Array(cipher), IV_BYTES);
  return out;
}

export async function open(key: CryptoKey, sealed: Bytes, context: string): Promise<Bytes> {
  if (sealed.length <= IV_BYTES) throw new DecryptError();
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: sealed.subarray(0, IV_BYTES), additionalData: text.encode(context) },
      key,
      sealed.subarray(IV_BYTES),
    );
    return new Uint8Array(plain);
  } catch {
    throw new DecryptError();
  }
}
