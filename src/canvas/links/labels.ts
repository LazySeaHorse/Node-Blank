/** Pure helpers for link labels: splitting out `$math$`, and fitting text into the room a link has. */

export interface LabelPart {
  text: string;
  /** Between `$` signs: set in KaTeX. */
  math: boolean;
}

/** `plain $x^2$ plain` as parts. An empty `$$` pair is plain text, not an empty formula. */
export function splitLabel(label: string): LabelPart[] {
  const parts: LabelPart[] = [];
  for (const segment of label.split(/(\$[^$]*\$)/)) {
    if (!segment) continue;
    const math = segment.length > 2 && segment.startsWith('$') && segment.endsWith('$');
    parts.push({ text: math ? segment.slice(1, -1) : segment, math });
  }
  return parts;
}

/** Whether any part of the label is a formula. Those labels are drawn as HTML, since KaTeX cannot follow a bend. */
export const hasMath = (label: string): boolean => splitLabel(label).some((p) => p.math);

export type Measure = (text: string) => number;

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
