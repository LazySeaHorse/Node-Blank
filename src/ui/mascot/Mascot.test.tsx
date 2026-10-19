import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OctoHero, PopupActions, PopupBody } from '../OctoHero';
import { Mascot } from './Mascot';
import { MASCOT_FRAME, MASCOT_MOODS, mascotAspect, mascotViewBox } from './moods';

describe('mascot moods', () => {
  it('keeps the logo frame for the original moods', () => {
    expect(mascotViewBox('idle')).toBe(MASCOT_FRAME);
    expect(mascotViewBox('working')).toBe(MASCOT_FRAME);
    expect(mascotAspect('idle')).toBe(1);
  });

  it('widens the frame for moods whose props reach past the body', () => {
    expect(mascotViewBox('cheer')).toBe('-10 -16 148 144');
    expect(mascotAspect('plug')).toBeCloseTo(146 / 128);
    expect(mascotAspect('thinking')).toBeCloseTo(128 / 162);
  });

  it.each(MASCOT_MOODS)('renders %s with its data-mood and frame', (mood) => {
    const { container } = render(<Mascot mood={mood} animated />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('data-mood')).toBe(mood);
    expect(svg?.getAttribute('viewBox')).toBe(mascotViewBox(mood));
    expect(svg?.querySelectorAll('[data-part^="arm-"]')).toHaveLength(6);
  });

  it('defaults to idle, keeps className and takes a title and animated flag', () => {
    render(<Mascot className="size-8" title="Hi" animated />);
    const svg = screen.getByRole('img', { name: 'Hi' });
    expect(svg.getAttribute('data-mood')).toBe('idle');
    expect(svg.getAttribute('class')).toContain('size-8');
    expect(svg.getAttribute('class')).toContain('mascot-animated');
  });

  it('speeds up while working', () => {
    const { container } = render(<Mascot mood="working" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('mascot-working');
  });
});

describe('<OctoHero />', () => {
  it('drops the octopus in the given mood onto a scene and hides from assistive tech', () => {
    const { container } = render(<OctoHero mood="nervous" scene="delete" tag="Careful" />);
    const hero = container.querySelector('[data-slot="octo-hero"]');
    expect(hero?.getAttribute('data-scene')).toBe('delete');
    expect(hero?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('svg[data-mood="nervous"]')).not.toBeNull();
    expect(screen.getByText('Careful')).toBeTruthy();
  });

  it('is shorter and smaller when compact', () => {
    const { container } = render(<OctoHero mood="wave" scene="canvas" size="compact" />);
    expect(container.querySelector<HTMLElement>('[data-slot="octo-hero"]')?.style.height).toBe('110px');
    expect(container.querySelector<HTMLElement>('[data-slot="octo-hero-octo"]')?.style.height).toBe('68px');
  });

  it('exports popup layout helpers', () => {
    render(
      <PopupBody>
        <PopupActions>ok</PopupActions>
      </PopupBody>,
    );
    expect(screen.getByText('ok').getAttribute('data-slot')).toBe('popup-actions');
  });
});
