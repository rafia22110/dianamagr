import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logout } from './auth';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => {
  return {
    cookies: vi.fn(),
  };
});

describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete the admin_session cookie', async () => {
    const deleteMock = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ delete: deleteMock } as any);

    await logout();

    expect(cookies).toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalledWith('admin_session');
  });
});
