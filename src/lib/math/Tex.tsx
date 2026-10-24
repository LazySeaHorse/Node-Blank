import katex from 'katex';
import { memo, useLayoutEffect, useRef } from 'react';
import { inkElements } from './ink';

/** Static KaTeX rendering of a LaTeX string. */
export const Tex = memo(function Tex({ latex, className }: { latex: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    katex.render(latex, element, { throwOnError: false, output: 'html' });
    inkElements(element);
  }, [latex]);
  return <span ref={ref} className={className} />;
});
