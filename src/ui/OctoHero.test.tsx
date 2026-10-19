import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OctoHero, type OctoScene } from './OctoHero';

const SCENES: OctoScene[] = ['canvas', 'ai', 'delete', 'export', 'error'];

describe('<OctoHero />', () => {
  it.each(SCENES)('draws the %s scene with its node cards', (scene) => {
    const { container } = render(<OctoHero mood="idle" scene={scene} />);
    const hero = container.querySelector('[data-slot="octo-hero"]');
    expect(hero?.getAttribute('data-scene')).toBe(scene);
    expect(hero?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelectorAll('[data-slot="octo-hero-scene"] rect[rx="7"]').length).toBeGreaterThan(
      0,
    );
  });

  it('uses a unique dot pattern per instance', () => {
    const { container } = render(
      <>
        <OctoHero mood="idle" scene="ai" />
        <OctoHero mood="idle" scene="ai" />
      </>,
    );
    const ids = [...container.querySelectorAll('pattern')].map((p) => p.id);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(container.querySelector(`rect[fill="url(#${id})"]`)).not.toBeNull();
  });

  it('shows the tag and puts a decorative octopus in the requested mood on the scene', () => {
    const { container } = render(<OctoHero mood="nervous" scene="delete" tag="Careful" />);
    expect(screen.getByText('Careful')).toBeTruthy();
    const mascot = container.querySelector('[data-slot="octo-hero-octo"] svg');
    expect(mascot?.getAttribute('data-mood')).toBe('nervous');
    expect(mascot?.getAttribute('aria-hidden')).toBe('true');
  });

  it('omits the tag when none is given', () => {
    const { container } = render(<OctoHero mood="wave" scene="canvas" />);
    expect(container.querySelector('span.font-mono')).toBeNull();
  });

  it('is shorter and smaller when compact', () => {
    const { container } = render(<OctoHero mood="wave" scene="canvas" size="compact" />);
    expect(container.querySelector<HTMLElement>('[data-slot="octo-hero"]')?.style.height).toBe('110px');
    expect(container.querySelector<HTMLElement>('[data-slot="octo-hero-octo"]')?.style.height).toBe('68px');
  });
});
