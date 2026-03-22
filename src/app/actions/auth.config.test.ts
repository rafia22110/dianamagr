import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('auth config', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('should throw error when ADMIN_USERNAME is missing', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'pass');
    vi.stubEnv('SESSION_SECRET', 'secret');
    // ADMIN_USERNAME is missing

    const { login } = await import('./auth');
    const formData = new FormData();

    await expect(login(formData)).rejects.toThrow('Missing required administrative credentials');
  });

  it('should throw error when ADMIN_PASSWORD is missing', async () => {
    vi.stubEnv('ADMIN_USERNAME', 'user');
    vi.stubEnv('SESSION_SECRET', 'secret');
    // ADMIN_PASSWORD is missing

    const { login } = await import('./auth');
    const formData = new FormData();

    await expect(login(formData)).rejects.toThrow('Missing required administrative credentials');
  });

  it('should throw error when SESSION_SECRET is missing', async () => {
    vi.stubEnv('ADMIN_USERNAME', 'user');
    vi.stubEnv('ADMIN_PASSWORD', 'pass');
    // SESSION_SECRET is missing

    const { login } = await import('./auth');
    const formData = new FormData();

    await expect(login(formData)).rejects.toThrow('Missing required administrative credentials');
  });

  it('should not throw error when all credentials are provided', async () => {
    vi.stubEnv('ADMIN_USERNAME', 'user');
    vi.stubEnv('ADMIN_PASSWORD', 'pass');
    vi.stubEnv('SESSION_SECRET', 'secret');

    const { login } = await import('./auth');
    const formData = new FormData();
    formData.append('username', 'wrong');
    formData.append('password', 'wrong');

    const result = await login(formData);
    expect(result.success).toBe(false);
  });
});
