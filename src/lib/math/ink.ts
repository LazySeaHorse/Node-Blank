/**
 * MathLive and KaTeX resolve named colours to fixed values, so `\textcolor{black}` stays black on a dark tile.
 * The neutrals resolve to theme tokens instead (see index.css), which dark mode flips.
 */
const NEUTRALS: Record<string, string> = {
  black: 'black',
  'dark-grey': 'dark-grey',
  'dark-gray': 'dark-grey',
  grey: 'grey',
  gray: 'grey',
  'light-grey': 'light-grey',
  'light-gray': 'light-grey',
  white: 'white',
};

const neutral = (name: string) => NEUTRALS[name.trim().toLowerCase()];

/** A text colour for MathLive's `colorMap`, or undefined to leave the name to MathLive. */
export function inkColor(name: string): string | undefined {
  const ink = neutral(name);
  return ink && `var(--ink-${ink})`;
}

/** A background colour for MathLive's `backgroundColorMap`, or undefined to leave the name to MathLive. */
export function inkBackground(name: string): string | undefined {
  const ink = neutral(name);
  return ink && `var(--ink-bg-${ink})`;
}

const NAMED_COLOR = /(^|;)(\s*)(background-color|color)(\s*:\s*)([a-zA-Z-]+)(\s*)(?=;|$)/g;

/** An inline style as KaTeX writes it, with neutral named colours swapped for the theme's. */
export function inkStyle(style: string): string {
  return style.replace(NAMED_COLOR, (match, start, space, property, colon, name, end) => {
    const ink = property === 'color' ? inkColor(name) : inkBackground(name);
    return ink ? `${start}${space}${property}${colon}${ink}${end}` : match;
  });
}

/** KaTeX's HTML with neutral named colours swapped for the theme's. */
export const inkHtml = (html: string) =>
  html.replace(/ style="([^"]*)"/g, (_, style: string) => ` style="${inkStyle(style)}"`);

interface HastNode {
  type: string;
  properties?: { style?: unknown };
  children?: HastNode[];
}

/** Rehype plugin, after rehype-katex: neutral named colours in math follow the theme. */
export function rehypeInk() {
  const walk = (node: HastNode) => {
    if (typeof node.properties?.style === 'string') node.properties.style = inkStyle(node.properties.style);
    node.children?.forEach(walk);
  };
  return walk;
}
