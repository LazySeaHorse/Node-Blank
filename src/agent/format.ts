import type { AppNode } from '@/model/types';
import { searchTextOf } from '@/nodes/factory';
import type { LineResult } from '@/nodes/mathPlus/evaluate';
import { splitLines } from '@/nodes/mathPlus/evaluate';
import { nodeRect } from '@/store/groups';
import { alias } from './aliases';

/**
 * Compact text renderings of nodes for the agent. Every character here is paid for in tokens,
 * so lines are terse, numbers are rounded and image data is never included.
 */

export const PREVIEW_CHARS = 80;

export function oneLine(text: string, max = PREVIEW_CHARS): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

export const columnName = (col: number): string => {
  let name = '';
  for (let n = col + 1; n > 0; n = Math.floor((n - 1) / 26))
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
};

/** "B3" -> { row: 2, col: 1 }, or null if it is not a cell reference. */
export function parseCellRef(ref: string): { row: number; col: number } | null {
  const match = /^([A-Z]+)([1-9]\d*)$/i.exec(ref.trim());
  if (!match) return null;
  const col = [...match[1].toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
  return { row: Number(match[2]) - 1, col };
}

function imageLabel(src: string): string {
  if (!src) return 'empty';
  if (src.startsWith('data:')) return `uploaded image, ${Math.round((src.length * 3) / 4 / 1024)} KB`;
  return oneLine(src);
}

const gridSize = (cells: string[][]) => `${cells.length}×${cells[0]?.length ?? 0}`;

/** A short preview of a node's content. */
export function preview(node: AppNode): string {
  switch (node.type) {
    case 'graph':
      return oneLine(node.data.functions.map((f) => `y=${f}`).join('; '));
    case 'table':
    case 'sheet':
      return `${gridSize(node.data.cells)}: ${oneLine(node.data.cells.flat().filter(Boolean).join(' | ') || '(empty)')}`;
    case 'code':
      return oneLine(node.data.source.split('\n').find((l) => l.trim()) ?? '');
    case 'image':
      return imageLabel(node.data.src);
    default:
      return oneLine(searchTextOf(node));
  }
}

const round = (n: number) => Math.round(n);

/** Where a node is: "x,y w×h". */
export function placement(node: AppNode): string {
  const r = nodeRect(node);
  return `${round(r.x)},${round(r.y)} ${round(r.width)}×${round(r.height)}`;
}

/** One line per node: `n3 text 120,40 300×200 g2 "preview" [2.3k chars]`. */
export function nodeLine(node: AppNode, groupId?: string): string {
  const length = node.type === 'image' ? 0 : searchTextOf(node).length;
  const size =
    length > PREVIEW_CHARS ? ` [${length >= 1000 ? `${(length / 1000).toFixed(1)}k` : length} chars]` : '';
  const group = groupId ? ` ${alias(groupId, 'g')}` : '';
  return `${alias(node.id)} ${node.type} ${placement(node)}${group} "${preview(node)}"${size}`;
}

function gridBody(cells: string[][]): string {
  const cols = cells[0]?.length ?? 0;
  const header = `  | ${Array.from({ length: cols }, (_, c) => columnName(c)).join(' | ')}`;
  return [header, ...cells.map((row, r) => `${r + 1} | ${row.join(' | ')}`)].join('\n');
}

function mathPlusBody(latex: string, results: LineResult[] | undefined): string {
  const lines = splitLines(latex);
  if (lines.length === 0) return '(empty)';
  return lines
    .map((line, i) => {
      const r = results?.[i];
      if (!r) return line;
      if (r.error) return `${line}  ⟶ error: ${r.error}`;
      if (r.assigned) return line;
      return `${line}  ⟶ ${r.value}${r.approx ? ` ≈ ${r.approx}` : ''}`;
    })
    .join('\n');
}

/** The full content of a node as plain text. Math+ lines carry their computed results when given. */
export function nodeBody(node: AppNode, mathPlusResults?: LineResult[]): string {
  switch (node.type) {
    case 'text':
      return node.data.markdown;
    case 'math':
      return node.data.latex;
    case 'mathPlus':
      return mathPlusBody(node.data.latex, mathPlusResults);
    case 'graph':
      return node.data.functions.map((f) => `y = ${f}`).join('\n');
    case 'table':
    case 'sheet':
      return gridBody(node.data.cells);
    case 'code':
      return node.data.source;
    case 'image':
      return imageLabel(node.data.src);
    case 'video':
      return node.data.url;
  }
}
