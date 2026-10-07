import { ComputeEngine } from '@cortex-js/compute-engine';
import { describe, expect, it } from 'vitest';
import { evaluateDocuments, splitLines } from './evaluate';

const ce = new ComputeEngine();

describe('splitLines', () => {
  it('unwraps displaylines and splits on line breaks', () => {
    expect(splitLines('\\displaylines{a:=1\\\\a+1}')).toEqual(['a:=1', 'a+1']);
    expect(splitLines('1+1')).toEqual(['1+1']);
    expect(splitLines('  ')).toEqual([]);
  });
});

describe('evaluateDocuments', () => {
  it('evaluates expressions with approximations', () => {
    const { a } = evaluateDocuments(ce, [{ id: 'a', latex: '\\displaylines{1+2\\\\\\frac{1}{3}}' }]);
    expect(a[0]).toEqual({ value: '3', approx: null, error: null, assigned: false });
    expect(a[1]).toMatchObject({ value: '\\frac{1}{3}', approx: '0.3333333333' });
  });

  it('shares variables across documents in order', () => {
    const results = evaluateDocuments(ce, [
      { id: 'first', latex: 'x:=5' },
      { id: 'second', latex: 'x+1' },
    ]);
    expect(results.first[0]).toMatchObject({ value: '5', assigned: true });
    expect(results.second[0].value).toBe('6');
  });

  it('does not leak variables between evaluations', () => {
    evaluateDocuments(ce, [{ id: 'a', latex: 'y:=2' }]);
    expect(evaluateDocuments(ce, [{ id: 'b', latex: 'y+1' }]).b[0].value).toBe('y+1');
  });

  it('reports syntax errors per line', () => {
    const { a } = evaluateDocuments(ce, [{ id: 'a', latex: '\\displaylines{1+\\\\2}' }]);
    expect(a[0].error).toBe('Syntax error');
    expect(a[1].value).toBe('2');
  });
});
