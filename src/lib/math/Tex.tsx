import katex from 'katex';
import { memo } from 'react';

/** Static KaTeX rendering of a LaTeX string. */
export const Tex = memo(function Tex({ latex, className }: { latex: string; className?: string }) {
  const html = katex.renderToString(latex, { throwOnError: false, output: 'html' });
  // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output with trust disabled is safe markup.
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});
