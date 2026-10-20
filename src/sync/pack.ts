import type { AppNode, CanvasContent } from '@/model/types';
import { exportCanvases, ImportError, parseExportFile } from '@/persistence/io';
import { fromBase64, gunzip, gzip, splitText, toBase64 } from './codec';
import { open, seal } from './crypto';
import { SyncError } from './errors';

/**
 * A canvas as it travels to the cloud: the export format, gzipped, sealed with the password's key, written as
 * base64 and cut into pieces that each fit in one bin. Images are left out for now (see `withoutImages`).
 */

/** Base64 characters per piece. JSONBin's free plan takes 100 kB a record; this leaves room for the envelope. */
export const PIECE_CHARS = 90_000;
/** A canvas needing more bins than this is refused rather than half uploaded. */
export const MAX_PIECES = 24;

export interface CloudCanvas {
  name: string;
  content: CanvasContent;
}

/** What a sealed message may be used for: this canvas, at this revision. */
const contextOf = (id: string, rev: string) => `canvas:${id}:${rev}`;

const isEmbedded = (src: string) => src.startsWith('data:');

/**
 * Images are stored in the node as data URLs, far too big for a bin, so they are not synced yet: the node
 * keeps its place, size and title, and its picture stays on the device that has it.
 */
export const withoutImages = (nodes: AppNode[]): AppNode[] =>
  nodes.map((n) =>
    n.type === 'image' && isEmbedded(n.data.src) ? { ...n, data: { ...n.data, src: '' } } : n,
  );

/** The reverse for a pull: an image that arrived without its picture gets the one this device already has. */
export function keepLocalImages(incoming: AppNode[], local: AppNode[]): AppNode[] {
  const pictures = new Map<string, string>();
  for (const n of local) if (n.type === 'image' && n.data.src) pictures.set(n.id, n.data.src);
  return incoming.map((n) => {
    const src = n.type === 'image' && !n.data.src ? pictures.get(n.id) : undefined;
    return n.type === 'image' && src ? { ...n, data: { ...n.data, src } } : n;
  });
}

export async function packCanvas(
  key: CryptoKey,
  id: string,
  rev: string,
  { name, content }: CloudCanvas,
  pieceChars = PIECE_CHARS,
): Promise<string[]> {
  const file = exportCanvases([{ name, ...content, nodes: withoutImages(content.nodes) }]);
  const packed = await gzip(new TextEncoder().encode(JSON.stringify(file)));
  const pieces = splitText(toBase64(await seal(key, packed, contextOf(id, rev))), pieceChars);
  if (pieces.length > MAX_PIECES)
    throw new SyncError('too-large', `"${name}" is too big to sync (it would need ${pieces.length} bins).`);
  return pieces;
}

export async function unpackCanvas(
  key: CryptoKey,
  id: string,
  rev: string,
  pieces: string[],
): Promise<CloudCanvas> {
  const packed = await open(key, fromBase64(pieces.join('')), contextOf(id, rev));
  try {
    const file = parseExportFile(new TextDecoder().decode(await gunzip(packed)));
    const [canvas] = file.kind === 'canvases' ? file.canvases : [];
    if (!canvas) throw new SyncError('format', 'The cloud copy holds no canvas.');
    const { name, ...content } = canvas;
    return { name, content };
  } catch (error) {
    if (error instanceof ImportError) throw new SyncError('format', error.message);
    throw error;
  }
}
