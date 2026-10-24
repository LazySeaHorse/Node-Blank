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

/** Swaps neutral named colours in an inline style, as KaTeX writes them, for the theme's. True if any changed. */
export function inkDeclaration(style: CSSStyleDeclaration): boolean {
  const color = inkColor(style.color);
  const background = inkBackground(style.backgroundColor);
  if (color) style.color = color;
  if (background) style.backgroundColor = background;
  return !!(color || background);
}

/** Applies `inkDeclaration` to every element under `root` with an inline style: rendered KaTeX. */
export function inkElements(root: ParentNode) {
  for (const element of root.querySelectorAll<HTMLElement>('[style]')) inkDeclaration(element.style);
}

interface HastNode {
  type: string;
  properties?: { style?: unknown };
  children?: HastNode[];
}

/** Rehype plugin, after rehype-katex: neutral named colours in math follow the theme. */
export function rehypeInk() {
  // The browser parses each style string, so it is read exactly as it would be rendered.
  const scratch = document.createElement('span').style;
  const walk = (node: HastNode) => {
    const style = node.properties?.style;
    if (node.properties && typeof style === 'string') {
      scratch.cssText = style;
      if (inkDeclaration(scratch)) node.properties.style = scratch.cssText;
    }
    node.children?.forEach(walk);
  };
  return walk;
}
