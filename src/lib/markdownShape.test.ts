import { describe, expect, it } from 'vitest';
import { detectShape } from './markdownShape';

describe('detectShape', () => {
  it('recognises a note that is only a table', () => {
    const shape = detectShape('| Item | Cost |\n| --- | --- |\n| Tea | 3 |\n| $x^2$ | 4 |\n');
    expect(shape).toEqual({
      kind: 'table',
      text: [
        ['Item', 'Cost'],
        ['Tea', '3'],
        ['$x^2$', '4'],
      ],
      latex: [
        ['\\text{Item}', '\\text{Cost}'],
        ['\\text{Tea}', '3'],
        ['x^2', '4'],
      ],
    });
  });

  it('recognises a note that is only math, in any of its spellings', () => {
    expect(detectShape('$$x^2 + 1$$')).toEqual({ kind: 'math', latex: 'x^2 + 1' });
    expect(detectShape('\n$$\n\\frac{a}{b}\n$$\n')).toEqual({ kind: 'math', latex: '\\frac{a}{b}' });
    expect(detectShape('  $E = mc^2$  ')).toEqual({ kind: 'math', latex: 'E = mc^2' });
  });

  it('handles the one-line aligned block', () => {
    const tex = String.raw`\begin{aligned} a &= 1 \\ b &= 2 \end{aligned}`;
    expect(detectShape(`$$${tex}$$`)).toEqual({ kind: 'math', latex: tex });
  });

  it('leaves anything with other content alone', () => {
    for (const note of [
      '',
      'hello',
      'Costs:\n\n| a | b |\n| - | - |\n| 1 | 2 |',
      '$$x$$\n\nand more',
      '$a$ and $b$',
      '$$a$$ $$b$$',
      '| a |\n| - |\n| 1 |\n\n| b |\n| - |\n| 2 |',
    ])
      expect(detectShape(note), note).toBeNull();
  });
});
