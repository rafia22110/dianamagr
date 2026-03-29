import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logout, login } from './auth';
import { cookies } from 'next/headers';

const { mockSignInWithPassword, mockSignOut } = vi.hoisted(() => {
  return {
    mockSignInWithPassword: vi.fn(),
    mockSignOut: vi.fn(),
  };
});

vi.mock('next/headers', () => {
  return {
    cookies: vi.fn(),
  };
});

vi.mock('@/lib/insforge', () => {
  return {
    insforge: {
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
      },
    },
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
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return success true and set cookie for valid credentials', async () => {
      const setMock = vi.fn();
      vi.mocked(cookies).mockResolvedValue({ set: setMock } as any);
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: '123' }, session: { access_token: 'token' } },
        error: null,
      });

      const formData = new FormData();
      formData.append('username', 'admin@example.com');
      formData.append('password', 'password123');

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

    it('should return failure for incorrect password or auth error', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const formData = new FormData();
      formData.append('username', 'admin@example.com');
      formData.append('password', 'wrongpassword');

      const loginPromise = login(formData);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await loginPromise;

      expect(result).toEqual({
        success: false,
        error: "שם משתמש או סיסמה שגויים"
      });
    });

    it('should throw error in production if SESSION_SECRET is missing', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('SESSION_SECRET', '');

      vi.resetModules();
      // @ts-ignore
      const { login: loginProd } = await import('./auth');

      const formData = new FormData();
      await expect(loginProd(formData)).rejects.toThrow(/Missing SESSION_SECRET environment variable in production/);
    });
  });
});
