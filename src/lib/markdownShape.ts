import type { Nodes, PhrasingContent, Root, TableRow } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import remarkObsidianMath from './remarkObsidianMath';

/** A piece of a table cell: words, or LaTeX that was written between `$`. */
type Segment = { math: boolean; value: string };

export type MarkdownShape =
  /** Nothing but one table. `text` suits a sheet, `latex` a table node (whose cells are all math). */
  | { kind: 'table'; text: string[][]; latex: string[][] }
  /** Nothing but one piece of math. */
  | { kind: 'math'; latex: string };

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkObsidianMath);

/** The plain words and math of a phrasing node, flattened. */
function segments(node: PhrasingContent | Nodes): Segment[] {
  switch (node.type) {
    case 'text':
    case 'inlineCode':
      return [{ math: false, value: node.value }];
    case 'inlineMath':
      return [{ math: true, value: node.value }];
    case 'break':
      return [{ math: false, value: ' ' }];
    default:
      return 'children' in node ? (node.children as Nodes[]).flatMap(segments) : [];
  }
}

const asText = (parts: Segment[]) =>
  parts
    .map((p) => (p.math ? `$${p.value}$` : p.value))
    .join('')
    .trim();

/** A table node's cells are math, so words become `\text{…}`; single letters stay variables. */
const asLatex = (parts: Segment[]) =>
  parts
    .map((p) => (p.math || !/[A-Za-z]{2}/.test(p.value) ? p.value : `\\text{${p.value}}`))
    .join('')
    .trim();

const rowCells = (row: TableRow, format: (parts: Segment[]) => string) =>
  row.children.map((cell) => format(cell.children.flatMap(segments)));

/**
 * Whether a note is nothing but a table or nothing but math, parsed the way the note itself is rendered.
 * Anything else (prose around it, several blocks) is null.
 */
export function detectShape(markdown: string): MarkdownShape | null {
  const root: Root = parser.parse(markdown);
  const blocks = root.children.filter((n) => !(n.type === 'paragraph' && n.children.length === 0));
  if (blocks.length !== 1) return null;
  const [block] = blocks;

  if (block.type === 'table')
    return {
      kind: 'table',
      text: block.children.map((row) => rowCells(row, asText)),
      latex: block.children.map((row) => rowCells(row, asLatex)),
    };
  if (block.type === 'math') return { kind: 'math', latex: block.value.trim() };
  if (block.type === 'paragraph') {
    const content = block.children.filter((n) => !(n.type === 'text' && n.value.trim() === ''));
    const [only] = content;
    if (content.length === 1 && only.type === 'inlineMath') return { kind: 'math', latex: only.value.trim() };
  }
  return null;
}
