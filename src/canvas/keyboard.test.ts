import { describe, expect, it } from 'vitest';
import { isTextField, isTyping } from './keyboard';

const el = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  return host.firstElementChild as HTMLElement;
};

describe('isTextField / isTyping', () => {
  it('treats inputs and math fields as text fields', () => {
    expect(isTextField(el('<input />'))).toBe(true);
    expect(isTextField(el('<math-field></math-field>'))).toBe(true);
  });

  it('treats a grid inside .nokey as typing, but not as a text field', () => {
    const cell = el('<div class="nokey"><div class="cell" tabindex="0"></div></div>').firstElementChild;
    expect(isTyping(cell)).toBe(true);
    expect(isTextField(cell)).toBe(false);
  });

  it('ignores plain elements and non-elements', () => {
    expect(isTyping(el('<div></div>'))).toBe(false);
    expect(isTyping(null)).toBe(false);
  });
});
