import { describe, it, expect, vi } from 'vitest';
import { verifyCookie } from './auth';

// Mocking environment variables correctly
vi.stubEnv('SESSION_SECRET', 'test-secret');

describe('verifyCookie Security', () => {
  it('should return false instead of throwing when signature length is incorrect', async () => {
    // A valid HMAC-SHA256 hex string is 64 characters.
    // This signature is too short.
    const invalidCookie = 'session-id.too-short';

    // Now it should return false instead of throwing
    const result = await verifyCookie(invalidCookie);
    expect(result).toBe(false);
  });

  it('should return false for incorrect signature of correct length', async () => {
    // 64 characters long but incorrect signature
    const wrongSignature = 'a'.repeat(64);
    const invalidCookie = `session-id.${wrongSignature}`;

    const result = await verifyCookie(invalidCookie);
    expect(result).toBe(false);
  });
});
