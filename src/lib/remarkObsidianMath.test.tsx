import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown } from './Markdown';

// `$$` hugging prose and `\begin{aligned}` on the same line, as Obsidian accepts it.
const CSTR = String.raw`The temperature in a CSTR is modeled by: $$\frac{dT}{dt} = \frac{F}{V}(T_{f} - T)$$
where $T$ is the reactor temperature.

(a) Use Mid-point method,
$$\begin{aligned}
K_{1} &= hf(t_{i-1}, w_{i-1}) \\
K_{2} &= hf\left(t_{i-1} + \frac{h}{2}, w_{i-1} + \frac{1}{2}K_{1}\right) \\
w_{i} &= w_{i-1} + K_{2}
\end{aligned}$$
to approximate the temperature with the following values:
* $F = 0.2\text{ L/s}$, $V = 10\text{ L}$
* $k_{0} = 0.5\text{ 1/s}$

(b) Apply Milne's method:
$$w_{i} = w_{i-4} + \frac{4h}{3}[2f(t_{i-1}, w_{i-1}) - f(t_{i-2}, w_{i-2})]$$
for $i = 4, \dots, N-1$ as the predictor.`;

describe('Markdown math, Obsidian-style', () => {
  it('renders $$ blocks that share lines with prose or \\begin', () => {
    const { container } = render(<Markdown source={CSTR} />);
    expect(container.querySelectorAll('.katex-error')).toHaveLength(0);
    expect(container.querySelectorAll('.katex-display')).toHaveLength(3);
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.textContent).toContain('to approximate the temperature');
  });

  it('keeps line breaks inside a $$ block so commands do not glue together', () => {
    const { container } = render(<Markdown source={'a $$x\n\\alpha\n\\beta$$ b'} />);
    const tex = container.querySelector('annotation')?.textContent;
    expect(tex).toBe('x\n\\alpha\n\\beta');
  });

  it('still renders standard fenced blocks, including blank lines inside', () => {
    const { container } = render(<Markdown source={'before\n\n$$\na\n\nb\n$$\n\nafter'} />);
    expect(container.querySelectorAll('.katex-error')).toHaveLength(0);
    expect(container.querySelectorAll('.katex-display')).toHaveLength(1);
    expect(container.textContent).toContain('after');
  });

  it('leaves a lone dollar amount alone', () => {
    const { container } = render(<Markdown source="costs $5 and $6 total" />);
    expect(container.querySelectorAll('.katex-error')).toHaveLength(0);
  });
});
