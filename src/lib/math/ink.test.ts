import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { inkColor, inkHtml, inkStyle } from './ink';

describe('inkColor', () => {
  it('maps the neutrals to theme tokens, whatever the spelling', () => {
    expect(inkColor('black')).toBe('var(--ink-black)');
    expect(inkColor('Gray')).toBe('var(--ink-grey)');
    expect(inkColor('dark-gray')).toBe('var(--ink-dark-grey)');
  });

  it('leaves real colours to the renderer', () => {
    expect(inkColor('red')).toBeUndefined();
    expect(inkColor('#000')).toBeUndefined();
  });
});

describe('inkStyle', () => {
  it('rewrites neutral text and background colours, as KaTeX and React write them', () => {
    expect(inkStyle('color:black;')).toBe('color:var(--ink-black);');
    expect(inkStyle('margin-right: 0.07em; color: grey;')).toBe(
      'margin-right: 0.07em; color: var(--ink-grey);',
    );
    expect(inkStyle('height:1em;background-color:white;')).toBe(
      'height:1em;background-color:var(--ink-bg-white);',
    );
  });

  it('leaves other colours and look-alike names alone', () => {
    for (const style of ['color:red;', 'color:#000;', 'color:whitesmoke;', 'border-color:black;'])
      expect(inkStyle(style)).toBe(style);
  });
});

describe('inkHtml', () => {
  it('makes \\textcolor{black} follow the theme in KaTeX output', () => {
    const html = inkHtml(katex.renderToString('\\textcolor{black}{x}+\\textcolor{red}{y}'));
    expect(html).toContain('color:var(--ink-black)');
    expect(html).toContain('color:red');
    expect(html).not.toContain('color:black');
  });
});
