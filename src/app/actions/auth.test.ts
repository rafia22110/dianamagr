import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logout, login } from './auth';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => {
  return {
    cookies: vi.fn(),
  };
});

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  describe('logout', () => {
    it('should delete the admin_session cookie', async () => {
      const deleteMock = vi.fn();
      vi.mocked(cookies).mockResolvedValue({ delete: deleteMock } as any);

      await logout();

      expect(cookies).toHaveBeenCalled();
      expect(deleteMock).toHaveBeenCalledWith('admin_session');
    });
  });

  describe('login', () => {
    it('should return success true and set cookie for valid credentials', async () => {
      const setMock = vi.fn();
      vi.mocked(cookies).mockResolvedValue({ set: setMock } as any);

      const formData = new FormData();
      formData.append('username', 'admin');
      formData.append('password', 'admin123');

      const loginPromise = login(formData);

      // Advance timers to bypass the 1000ms delay
      await vi.advanceTimersByTimeAsync(1000);

      const result = await loginPromise;

      expect(result).toEqual({ success: true });
      expect(setMock).toHaveBeenCalledWith(
        'admin_session',
        expect.stringMatching(/^.+\..+$/),
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
    });

    it('should return failure for incorrect password', async () => {
      const formData = new FormData();
      formData.append('username', 'admin');
      formData.append('password', 'wrongpassword');

      const loginPromise = login(formData);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await loginPromise;

      expect(result).toEqual({
        success: false,
        error: "שם משתמש או סיסמה שגויים"
      });
    });

    it('should return failure for incorrect username', async () => {
      const formData = new FormData();
      formData.append('username', 'wronguser');
      formData.append('password', 'admin123');

      const loginPromise = login(formData);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await loginPromise;

      expect(result).toEqual({
        success: false,
        error: "שם משתמש או סיסמה שגויים"
      });
    });

    it('should handle missing fields by treating them as empty strings', async () => {
      const formData = new FormData();
      // Not appending username or password

      const loginPromise = login(formData);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await loginPromise;

      expect(result).toEqual({
        success: false,
        error: "שם משתמש או סיסמה שגויים"
      });
    });

    it('should handle non-string fields by treating them as empty strings', async () => {
      const formData = new FormData();
      const blob = new Blob(['content'], { type: 'text/plain' });
      formData.append('username', blob, 'test.txt');
      formData.append('password', 'admin123');

      const loginPromise = login(formData);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await loginPromise;

      expect(result).toEqual({
        success: false,
        error: "שם משתמש או סיסמה שגויים"
      });
    });

    it('should throw error in production if admin config is missing', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('ADMIN_USERNAME', '');
      vi.stubEnv('ADMIN_PASSWORD', '');
      vi.stubEnv('SESSION_SECRET', '');

      vi.resetModules();
      // @ts-ignore
      const { login: loginProd } = await import('./auth');

      const formData = new FormData();
      await expect(loginProd(formData)).rejects.toThrow(/Missing required administrative credentials in production/);
    });
  });
});
