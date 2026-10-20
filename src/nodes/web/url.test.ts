import { describe, expect, it } from 'vitest';
import { hostnameOf, normaliseWebUrl } from './url';

describe('normaliseWebUrl', () => {
  it('adds https to a bare domain', () => {
    expect(normaliseWebUrl('example.com')).toBe('https://example.com/');
    expect(normaliseWebUrl('  example.com/a?b=1  ')).toBe('https://example.com/a?b=1');
  });

  it('keeps an explicit http or https scheme', () => {
    expect(normaliseWebUrl('http://example.com/x')).toBe('http://example.com/x');
    expect(normaliseWebUrl('HTTPS://example.com')).toBe('https://example.com/');
  });

  it('uses http for local servers and IP addresses', () => {
    expect(normaliseWebUrl('localhost:5173/app')).toBe('http://localhost:5173/app');
    expect(normaliseWebUrl('192.168.1.2:8080')).toBe('http://192.168.1.2:8080/');
  });

  it('rejects empty input and other schemes', () => {
    expect(normaliseWebUrl('')).toBeNull();
    expect(normaliseWebUrl('   ')).toBeNull();
    expect(normaliseWebUrl('javascript:alert(1)')).toBeNull();
    expect(normaliseWebUrl('data:text/html,<p>x</p>')).toBeNull();
    expect(normaliseWebUrl('file:///etc/passwd')).toBeNull();
    expect(normaliseWebUrl('not a url')).toBeNull();
  });
});

describe('hostnameOf', () => {
  it('drops www and falls back to the input', () => {
    expect(hostnameOf('https://www.example.com/a')).toBe('example.com');
    expect(hostnameOf('nope')).toBe('nope');
  });
});
