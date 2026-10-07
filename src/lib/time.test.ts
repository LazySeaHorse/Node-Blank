import { describe, expect, it } from 'vitest';
import { timeAgo } from './time';

const now = Date.UTC(2026, 0, 10);

describe('timeAgo', () => {
  it.each([
    [now - 10_000, 'just now'],
    [now - 5 * 60_000, '5 minutes ago'],
    [now - 3 * 3600_000, '3 hours ago'],
    [now - 24 * 3600_000, 'yesterday'],
    [now - 14 * 24 * 3600_000, '2 weeks ago'],
  ])('formats %i', (timestamp, expected) => {
    expect(timeAgo(timestamp, now)).toBe(expected);
  });
});
