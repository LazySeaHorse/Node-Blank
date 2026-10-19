import { describe, expect, it } from 'vitest';
import { Rational } from './rational';

const r = (text: string) => {
  const value = Rational.parse(text);
  if (!value) throw new Error(`cannot parse ${text}`);
  return value;
};

describe('Rational.parse', () => {
  it('reads integers, decimals and fractions exactly', () => {
    expect(r('3').toFraction()).toBe('3');
    expect(r('-0.25').toFraction()).toBe('-1/4');
    expect(r('2/6').toFraction()).toBe('1/3');
    expect(r(' +1.5/3 ').toFraction()).toBe('1/2');
    expect(r('0.1').add(r('0.2')).toFraction()).toBe('3/10');
  });

  it('rejects anything that is not a plain number', () => {
    for (const text of ['', 'x', '1/0', '1/2/3', '=A1', '1e3', '--1', '.5'])
      expect(Rational.parse(text)).toBeNull();
  });
});

describe('Rational arithmetic', () => {
  it('stays exact and normalised', () => {
    expect(r('1/3').add(r('1/6')).toFraction()).toBe('1/2');
    expect(r('1/3').sub(r('1/3')).isZero).toBe(true);
    expect(r('2/3').mul(r('3/4')).toFraction()).toBe('1/2');
    expect(r('1/2').div(r('-1/4')).toFraction()).toBe('-2');
  });

  it('throws on division by zero', () => {
    expect(() => r('1').div(Rational.ZERO)).toThrow(RangeError);
  });
});

describe('Rational formatting', () => {
  it('rounds decimals and trims zeros', () => {
    expect(r('1/3').toDecimal(4)).toBe('0.3333');
    expect(r('2/3').toDecimal(4)).toBe('0.6667');
    expect(r('-1/4').toDecimal()).toBe('-0.25');
    expect(r('5').toDecimal()).toBe('5');
    expect(r('-1/100000000000').toDecimal(4)).toBe('0');
  });
});

describe('Rational.fromNumber', () => {
  it('recovers simple fractions from doubles', () => {
    expect(Rational.fromNumber(2 / 3)?.toFraction()).toBe('2/3');
    expect(Rational.fromNumber(-0.125)?.toFraction()).toBe('-1/8');
    expect(Rational.fromNumber(1 / 3 + 1 / 6)?.toFraction()).toBe('1/2');
    expect(Rational.fromNumber(7)?.toFraction()).toBe('7');
    expect(Rational.fromNumber(225 / 7)?.toFraction()).toBe('225/7');
  });

  it('gives up on numbers with no small fraction', () => {
    expect(Rational.fromNumber(Math.PI)).toBeNull();
    expect(Rational.fromNumber(Number.NaN)).toBeNull();
  });
});
