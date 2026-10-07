import { ComputeEngine, compile } from '@cortex-js/compute-engine';
import { describe, expect, it } from 'vitest';
import { compileFunction } from './compileFunction';

const engine = { ce: new ComputeEngine(), compile };

describe('compileFunction', () => {
  it('compiles plain expressions of x', () => {
    expect(compileFunction(engine, 'x^2+1')?.(3)).toBe(10);
    expect(compileFunction(engine, '\\sin(x)')?.(0)).toBe(0);
  });

  it('accepts y= and f(x)= prefixes', () => {
    expect(compileFunction(engine, 'y=2x')?.(4)).toBe(8);
    expect(compileFunction(engine, 'f(x) = \\frac{1}{x}')?.(4)).toBe(0.25);
  });

  it('returns null for empty or invalid input', () => {
    expect(compileFunction(engine, '')).toBeNull();
    expect(compileFunction(engine, 'x^2+')).toBeNull();
  });
});
