import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Mascot } from './Mascot';
import {
  MASCOT_CENTER_X,
  MASCOT_FRAME,
  MASCOT_MOODS,
  mascotAspect,
  mascotCenterX,
  mascotViewBox,
} from './moods';

describe('mascot frames', () => {
  it('keeps the logo frame for the plain moods and widens it for props that reach out', () => {
    expect(mascotViewBox('idle')).toBe(MASCOT_FRAME);
    expect(mascotAspect('idle')).toBe(1);
    expect(mascotViewBox('cheer')).toBe('-10 -16 148 144');
    expect(mascotAspect('thinking')).toBeCloseTo(128 / 162);
  });

  it.each(MASCOT_MOODS)('%s keeps the centre line inside its frame', (mood) => {
    const [x, , w] = mascotViewBox(mood).split(' ').map(Number);
    expect(x).toBeLessThan(MASCOT_CENTER_X);
    expect(x + w).toBeGreaterThan(MASCOT_CENTER_X);
    expect(mascotCenterX(mood)).toBeGreaterThan(0);
    expect(mascotCenterX(mood)).toBeLessThan(1);
  });

  it('gives peek room for the ledge that runs past the body frame', () => {
    expect(mascotViewBox('peek')).not.toBe(MASCOT_FRAME);
  });
});

describe('<Mascot />', () => {
  it.each(MASCOT_MOODS)('renders %s', (mood) => {
    const { container } = render(<Mascot mood={mood} animated />);
    expect(container.querySelector('svg')?.getAttribute('data-mood')).toBe(mood);
  });

  it('is decorative without a title', () => {
    const { container } = render(<Mascot />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
    expect(svg?.getAttribute('aria-label')).toBeNull();
  });

  it('becomes a labelled image with a title', () => {
    render(<Mascot className="size-8" title="Hi" animated />);
    const svg = screen.getByRole('img', { name: 'Hi' });
    expect(svg.getAttribute('aria-hidden')).toBeNull();
    expect(svg.getAttribute('data-mood')).toBe('idle');
    expect(svg.getAttribute('class')).toContain('size-8');
    expect(svg.getAttribute('class')).toContain('mascot-animated');
  });

  it('pivots every arm on its own shoulder, relative to the frame origin', () => {
    const { container } = render(<Mascot mood="cheer" />);
    // cheer frame starts at (-10, -16); the raised left arm starts at (33, 70).
    const arm = container.querySelector<SVGElement>('[data-part="arm-0"]');
    expect(arm?.style.transformOrigin).toBe('43px 86px');
    const rest = container.querySelector<SVGElement>('[data-part="arm-2"]');
    expect(rest?.style.transformOrigin).toBe('68px 93px');
  });

  it('draws each mood-specific part', () => {
    expect(render(<Mascot mood="cheer" />).container.querySelector('[data-part="confetti"]')).not.toBeNull();
    expect(render(<Mascot mood="reading" />).container.querySelector('[data-part="page"]')).not.toBeNull();
    expect(render(<Mascot mood="nervous" />).container.querySelector('[data-part="sweat"]')).not.toBeNull();
    expect(render(<Mascot mood="idle" />).container.querySelector('[data-part="confetti"]')).toBeNull();
  });
});

describe('pupil tracking', () => {
  afterEach(() => vi.restoreAllMocks());

  const pupils = (c: HTMLElement) => c.querySelector('[data-part="pupils"]')?.getAttribute('transform');

  it('follows the pointer only when track is on', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });
    const rect = { left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0 } as DOMRect;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ ...rect, toJSON: () => ({}) });

    const still = render(<Mascot />);
    const tracking = render(<Mascot track />);
    expect(pupils(tracking.container)).toBe('translate(0 0)');

    act(() => {
      fireEvent(window, new MouseEvent('pointermove', { clientX: 400, clientY: 50 }));
    });
    const [dx, dy] = (pupils(tracking.container) ?? '').match(/-?[\d.]+/g)?.map(Number) ?? [];
    expect(dx).toBeGreaterThan(1);
    expect(Math.abs(dy)).toBeLessThan(1);
    expect(pupils(still.container)).toBe('translate(0 0)');
  });
});
