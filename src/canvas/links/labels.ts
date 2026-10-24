/** Pure helpers for link labels: splitting out `$math$`, and fitting text into the room a link has. */

export interface LabelPart {
  text: string;
  /** Between `$` signs: set in KaTeX. */
  math: boolean;
}

/**
 * `plain $x^2$ plain` as parts. A pair of dollar signs is a formula only when what is inside neither starts nor
 * ends with a space and is not just a number, so `$5 and $6` stays text; `$$` is plain text too.
 */
export function splitLabel(label: string): LabelPart[] {
  const parts: LabelPart[] = [];
  const text = (t: string) => {
    const last = parts[parts.length - 1];
    if (last && !last.math) last.text += t;
    else parts.push({ text: t, math: false });
  };
  let at = 0;
  while (at < label.length) {
    const open = label.indexOf('$', at);
    const close = open < 0 ? -1 : label.indexOf('$', open + 1);
    if (close < 0) {
      text(label.slice(at));
      break;
    }
    const inner = label.slice(open + 1, close);
    // Like the markdown rule: money in a sentence ("$5 and $6") is not a formula.
    if (inner && inner === inner.trim() && !/^[\d.,]+$/.test(inner)) {
      if (open > at) text(label.slice(at, open));
      parts.push({ text: inner, math: true });
      at = close + 1;
    } else {
      // Not a formula: the first sign is plain text, and the second may open one.
      text(label.slice(at, open + 1));
      at = open + 1;
    }
  }
  return parts;
}

/** Whether any part of the label is a formula. Those labels are drawn as HTML, since KaTeX cannot follow a bend. */
export const hasMath = (label: string): boolean => splitLabel(label).some((p) => p.math);

export type Measure = (text: string) => number;

/** Room kept free at each end of a link's path, so a label never touches the nodes or runs off the path. */
export const LABEL_END_MARGIN = 14;

/**
 * The text of a plain label cut to the room the path has, and where along the path its middle goes: as near
 * `pos` (the middle of the longest stretch) as the whole text still fits between the margins.
 */
export function placeLabel(
  label: string,
  total: number,
  pos: number,
  measure: Measure,
): { text: string; center: number } {
  const text = fitText(label, total - 2 * LABEL_END_MARGIN, measure);
  const half = measure(text) / 2;
  const min = half + LABEL_END_MARGIN;
  const max = total - half - LABEL_END_MARGIN;
  return { text, center: min > max ? total / 2 : Math.min(max, Math.max(min, pos)) };
}

/**
 * `text`, cut and ended with an ellipsis until `measure` says it fits in `max`. The empty string when not even
 * the ellipsis fits.
 */
export function fitText(text: string, max: number, measure: Measure): string {
  if (measure(text) <= max) return text;
  let end = text.length;
  while (end > 0) {
    end -= 1;
    const cut = `${text.slice(0, end).trimEnd()}…`;
    if (measure(cut) <= max) return cut;
  }
  return '';
}

const FONT = '500 12.5px Outfit, ui-sans-serif, system-ui, sans-serif';
/** Average advance used when there is no canvas to measure with (tests, very old browsers). */
const FALLBACK_ADVANCE = 7;

let context: CanvasRenderingContext2D | null | undefined;
const widths = new Map<string, number>();
const MAX_CACHED = 500;

/** Width in px of label text at the label font size, measured once per distinct text. */
export const measureLabel: Measure = (text) => {
  const cached = widths.get(text);
  if (cached !== undefined) return cached;
  if (context === undefined) {
    try {
      context = document.createElement('canvas').getContext('2d');
    } catch {
      context = null;
    }
    if (context) context.font = FONT;
  }
  const width = context ? context.measureText(text).width : text.length * FALLBACK_ADVANCE;
  if (widths.size >= MAX_CACHED) widths.clear();
  widths.set(text, width);
  return width;
};
