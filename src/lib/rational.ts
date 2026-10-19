/** Exact fractions on BigInt, always in lowest terms with a positive denominator. */
export class Rational {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: bigint, den = 1n) {
    if (den === 0n) throw new RangeError('Division by zero');
    const sign = den < 0n ? -1n : 1n;
    const g = gcd(num < 0n ? -num : num, den < 0n ? -den : den) || 1n;
    this.num = (sign * num) / g;
    this.den = (sign * den) / g;
  }

  static readonly ZERO = new Rational(0n);

  /**
   * Reads an integer, decimal or fraction: `3`, `-0.25`, `1/3`, `-2/6`, `1.5/4`. Anything else is null.
   * Decimals are read exactly, so `0.1` is 1/10 and not the nearest double.
   */
  static parse(text: string): Rational | null {
    const match = /^([+-]?)(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/.exec(text.trim());
    if (!match) return null;
    const [, sign, top, bottom] = match;
    const a = decimal(top);
    const b = bottom === undefined ? new Rational(1n) : decimal(bottom);
    if (b.num === 0n) return null;
    const value = a.div(b);
    return sign === '-' ? value.neg() : value;
  }

  /**
   * The simplest fraction with a denominator up to `maxDenominator` that matches `value` to about nine
   * digits (`0.6666666667` is 2/3), or null when there is none. Used to show computed numbers as fractions.
   */
  static fromNumber(value: number, maxDenominator = 10_000): Rational | null {
    if (!Number.isFinite(value)) return null;
    if (Number.isInteger(value)) return new Rational(BigInt(value));
    const target = Math.abs(value);
    const tolerance = 1e-9 * Math.max(1, target);
    // Continued-fraction convergents p/q: each is the best fraction for its denominator size.
    let [p0, q0, p1, q1] = [1, 0, Math.floor(target), 1];
    let rest = target - p1;
    while (rest > 1e-12) {
      const inverse = 1 / rest;
      const term = Math.floor(inverse);
      const [p2, q2] = [term * p1 + p0, term * q1 + q0];
      if (q2 > maxDenominator) break;
      [p0, q0, p1, q1] = [p1, q1, p2, q2];
      rest = inverse - term;
      if (Math.abs(target - p1 / q1) < tolerance) break;
    }
    if (Math.abs(target - p1 / q1) >= tolerance) return null;
    return new Rational(BigInt(value < 0 ? -p1 : p1), BigInt(q1));
  }

  get isZero() {
    return this.num === 0n;
  }

  get isInteger() {
    return this.den === 1n;
  }

  neg() {
    return new Rational(-this.num, this.den);
  }

  add(other: Rational) {
    return new Rational(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other: Rational) {
    return this.add(other.neg());
  }

  mul(other: Rational) {
    return new Rational(this.num * other.num, this.den * other.den);
  }

  div(other: Rational) {
    return new Rational(this.num * other.den, this.den * other.num);
  }

  /** `3`, `-1/3`: the form that parses back to the same value. */
  toFraction(): string {
    return this.isInteger ? `${this.num}` : `${this.num}/${this.den}`;
  }

  /** A decimal, rounded to `digits` places and trimmed; whole numbers stay whole. */
  toDecimal(digits = 10): string {
    if (this.isInteger) return `${this.num}`;
    const negative = this.num < 0n;
    const scale = 10n ** BigInt(digits);
    const abs = negative ? -this.num : this.num;
    const scaled = (abs * scale * 2n + this.den) / (this.den * 2n); // round half up
    const whole = scaled / scale;
    const fraction = (scaled % scale).toString().padStart(digits, '0').replace(/0+$/, '');
    const text = fraction ? `${whole}.${fraction}` : `${whole}`;
    return negative && text !== '0' ? `-${text}` : text;
  }

  toNumber() {
    return Number(this.num) / Number(this.den);
  }
}

function gcd(a: bigint, b: bigint): bigint {
  while (b) [a, b] = [b, a % b];
  return a;
}

function decimal(text: string): Rational {
  const [whole, fraction = ''] = text.split('.');
  return new Rational(BigInt(whole + fraction), 10n ** BigInt(fraction.length));
}
