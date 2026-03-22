import { describe, it, expect, vi } from 'vitest';
import { verifyCookie } from './auth';
import crypto from 'crypto';

// Mocking environment variables correctly
const SECRET_KEY = 'test-secret';
vi.stubEnv('SESSION_SECRET', SECRET_KEY);

describe('verifyCookie Security', () => {
  it('should return false instead of throwing when signature length is incorrect', async () => {
    // A valid HMAC-SHA256 hex string is 64 characters.
    // This signature is too short.
    const invalidCookie = 'session-id:123456789.too-short';

    // Now it should return false instead of throwing
    const result = await verifyCookie(invalidCookie);
    expect(result).toBe(false);
  });

  it('should return false for incorrect signature of correct length', async () => {
    // 64 characters long but incorrect signature
    const wrongSignature = 'a'.repeat(64);
    const invalidCookie = `session-id:123456789.${wrongSignature}`;

    const result = await verifyCookie(invalidCookie);
    expect(result).toBe(false);
  });

  it('should return true for a valid, non-expired cookie', async () => {
    const expires = Date.now() + 10000; // 10 seconds in the future
    const payload = `session-id:${expires}`;
    // Using the same SECRET_KEY as stubbed in Env
    const hmac = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
    const validCookie = `${payload}.${hmac}`;

    const result = await verifyCookie(validCookie);
    expect(result).toBe(true);
  });

  it('should return false for an expired cookie even with valid signature', async () => {
    const expires = Date.now() - 10000; // 10 seconds in the past
    const payload = `session-id:${expires}`;
    const hmac = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
    const expiredCookie = `${payload}.${hmac}`;

    const result = await verifyCookie(expiredCookie);
    expect(result).toBe(false);
  });

  it('should return false for a malformed payload', async () => {
    const payload = `session-id-no-expiry`;
    const hmac = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
    const malformedCookie = `${payload}.${hmac}`;

    const result = await verifyCookie(malformedCookie);
    expect(result).toBe(false);
  });
});
