import katex from 'katex';
import { Check, Copy, Info, Lightbulb, Sparkles } from 'lucide-react';
import { memo, useState } from 'react';

/** Inline KaTeX equation */
export const TexInline = memo(function TexInline({
  math,
  className = '',
}: {
  math: string;
  className?: string;
}) {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: false,
    output: 'html',
  });
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: safe KaTeX output
    <span className={`inline-math font-serif ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
  );
});

/** Block display KaTeX equation */
export const TexBlock = memo(function TexBlock({
  math,
  caption,
  className = '',
}: {
  math: string;
  caption?: string;
  className?: string;
}) {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: true,
    output: 'html',
  });
  return (
    <div
      className={`my-6 overflow-x-auto rounded-xl border border-line bg-surface-2/60 px-6 py-4 shadow-sm ${className}`}
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: safe KaTeX output */}
      <div className="flex justify-center text-fg" dangerouslySetInnerHTML={{ __html: html }} />
      {caption && <div className="mt-2 text-center font-mono text-[11.5px] text-muted">{caption}</div>}
    </div>
  );
});

/** Code block with copy button and language tag */
export function CodeBlock({
  code,
  language = 'python',
  filename,
}: {
  code: string;
  language?: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-line bg-surface-2 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-line bg-canvas/60 px-4 py-2 text-muted">
        <span className="font-medium text-fg text-[12px]">{filename || language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium text-muted transition hover:bg-surface hover:text-fg cursor-pointer"
          aria-label="Copy code to clipboard"
        >
          {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-[1.6] text-fg">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Callout card for key takeaways, formulas, or practical tips */
export function Callout({
  type = 'tip',
  title,
  children,
}: {
  type?: 'tip' | 'info' | 'formula' | 'pset';
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    tip: {
      border: 'border-l-tip bg-tip/5',
      icon: <Lightbulb className="size-4 text-tip shrink-0 mt-0.5" />,
      defaultTitle: 'Pro-Tip for Unlined',
    },
    info: {
      border: 'border-l-accent bg-accent/5',
      icon: <Info className="size-4 text-accent shrink-0 mt-0.5" />,
      defaultTitle: 'Take Note',
    },
    formula: {
      border: 'border-l-purple-500 bg-purple-500/5',
      icon: <Sparkles className="size-4 text-purple-500 shrink-0 mt-0.5" />,
      defaultTitle: 'Key Formula',
    },
    pset: {
      border: 'border-l-emerald-500 bg-emerald-500/5',
      icon: <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />,
      defaultTitle: 'Pset Strategy',
    },
  }[type];

  return (
    <div className={`my-6 rounded-r-xl border-l-4 border-y border-r border-line p-5 ${styles.border}`}>
      <div className="flex items-start gap-3">
        {styles.icon}
        <div className="space-y-1 text-[14.5px] leading-relaxed text-fg">
          {title && <h5 className="font-medium text-fg tracking-tight">{title || styles.defaultTitle}</h5>}
          <div className="text-muted leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
