const OPEN = '\\displaylines{';

/**
 * Merges `\displaylines` blocks nested inside another into the outer one.
 * MathLive's parser throws on the nested form once a field is on the page, and a throw while a node
 * mounts takes the whole canvas down, so stored LaTeX must never contain it.
 */
export function flattenDisplaylines(latex: string): string {
  if (latex.indexOf(OPEN) === latex.lastIndexOf(OPEN)) return latex;
  let out = '';
  let kept = 0; // `\displaylines` blocks we are inside and keep
  const braces: ('keep' | 'display' | 'drop')[] = [];
  for (let i = 0; i < latex.length; i++) {
    if (latex.startsWith(OPEN, i)) {
      i += OPEN.length - 1;
      if (kept > 0) braces.push('drop');
      else {
        out += OPEN;
        braces.push('display');
        kept++;
      }
    } else if (latex[i] === '\\') {
      out += latex.slice(i, i + 2); // a command, or an escaped \{ \} \\
      i++;
    } else if (latex[i] === '{') {
      out += '{';
      braces.push('keep');
    } else if (latex[i] === '}') {
      const closed = braces.pop();
      if (closed === 'display') kept--;
      if (closed !== 'drop') out += '}';
    } else out += latex[i];
  }
  return out;
}
