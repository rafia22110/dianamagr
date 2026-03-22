import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({ set: vi.fn() }),
}));

describe('auth.ts environment variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password',
      SESSION_SECRET: 'secret'
    };
  });

  it.each([
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'SESSION_SECRET',
  ])('should throw an error in login if %s is missing', async (key) => {
    delete process.env[key];
    const { login } = await import('./auth');
    const formData = new FormData();
    await expect(login(formData)).rejects.toThrow(
      'Missing required administrative credentials (ADMIN_USERNAME, ADMIN_PASSWORD, or SESSION_SECRET).'
    );
  });
});
