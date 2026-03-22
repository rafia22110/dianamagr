import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
  }),
}));

describe('auth.ts checkAdminConfig', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should throw error in production if credentials are missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ADMIN_USERNAME', '');
    vi.stubEnv('ADMIN_PASSWORD', '');
    vi.stubEnv('SESSION_SECRET', '');

    const { login } = await import('./auth');
    const formData = new FormData();

    await expect(login(formData)).rejects.toThrow(
      "Missing required administrative credentials in production (ADMIN_USERNAME, ADMIN_PASSWORD, or SESSION_SECRET)."
    );
  });

  it('should only log warning in non-production if credentials are missing', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ADMIN_USERNAME', '');
    vi.stubEnv('ADMIN_PASSWORD', '');
    vi.stubEnv('SESSION_SECRET', '');

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { login } = await import('./auth');
    const formData = new FormData();
    formData.append('username', 'admin');
    formData.append('password', 'admin123');

    const result = await login(formData);

    expect(result.success).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith("⚠️ Using default administrative credentials for development.");

    consoleSpy.mockRestore();
  });
});
