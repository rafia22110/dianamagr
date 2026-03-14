import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from './utils';

describe('sanitizeUrl', () => {
  it('should allow http and https URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('https://example.com/path?q=1')).toBe('https://example.com/path?q=1');
  });

  it('should allow mailto and tel URLs', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(sanitizeUrl('tel:+123456789')).toBe('tel:+123456789');
  });

  it('should allow relative paths and fragments', () => {
    expect(sanitizeUrl('/about')).toBe('/about');
    expect(sanitizeUrl('#contact')).toBe('#contact');
    expect(sanitizeUrl('./path')).toBe('./path');
    expect(sanitizeUrl('../other')).toBe('../other');
    expect(sanitizeUrl('page.html')).toBe('page.html');
  });

  it('should allow safe data:image URLs', () => {
    const safeData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    expect(sanitizeUrl(safeData)).toBe(safeData);
  });

  it('should block javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl(' javascript:alert(1) ')).toBe('about:blank');
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('about:blank');
    // Obfuscated
    expect(sanitizeUrl('java\x00script:alert(1)')).toBe('about:blank');
  });

  it('should block other dangerous protocols', () => {
    expect(sanitizeUrl('vbscript:msgbox("hello")')).toBe('about:blank');
    expect(sanitizeUrl('data:text/html,<html><body>XSS</body></html>')).toBe('about:blank');
  });

  it('should handle undefined, null, and empty strings', () => {
    expect(sanitizeUrl(undefined)).toBe('');
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl('')).toBe('');
  });
});
