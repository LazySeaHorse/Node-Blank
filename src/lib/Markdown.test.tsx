import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown } from './Markdown';

describe('Markdown', () => {
  it('renders markdown and math', () => {
    const { container } = render(<Markdown source={'# Title\n\n**bold** and $x^2$'} />);
    expect(container.querySelector('h1')?.textContent).toBe('Title');
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('.katex')).not.toBeNull();
  });

  it('does not render raw HTML', () => {
    const { container } = render(<Markdown source={'<img src=x onerror="alert(1)">'} />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('opens links in a new tab', () => {
    const { container } = render(<Markdown source="[x](https://example.com)" />);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });
});
