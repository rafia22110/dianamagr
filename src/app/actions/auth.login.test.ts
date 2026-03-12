import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from './auth';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock timer for artificial delay
vi.useFakeTimers();

describe('login Action', () => {
  const setMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue({ set: setMock } as any);
    // Reset env vars to known values
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'admin123';
  });

  it('should succeed with correct credentials after delay', async () => {
    const formData = new FormData();
    formData.append('username', 'admin');
    formData.append('password', 'admin123');

    const promise = login(formData);

    // Check that it's still pending before timer runs
    let resolved = false;
    promise.then(() => { resolved = true; });

    // Fast-forward 500ms
    await vi.advanceTimersByTimeAsync(500);
    expect(resolved).toBe(false);

    // Fast-forward another 500ms
    await vi.advanceTimersByTimeAsync(500);

    const result = await promise;

    expect(result.success).toBe(true);
    expect(setMock).toHaveBeenCalled();
  });

  it('should fail with incorrect username and have the same delay', async () => {
    const formData = new FormData();
    formData.append('username', 'wronguser');
    formData.append('password', 'admin123');

    const promise = login(formData);

    // Check that it's still pending before timer runs
    let resolved = false;
    promise.then(() => { resolved = true; });

    // Fast-forward 500ms
    await vi.advanceTimersByTimeAsync(500);
    expect(resolved).toBe(false);

    // Fast-forward another 500ms
    await vi.advanceTimersByTimeAsync(500);

    const result = await promise;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(setMock).not.toHaveBeenCalled();
  });

  it('should fail with incorrect password and have the same delay', async () => {
    const formData = new FormData();
    formData.append('username', 'admin');
    formData.append('password', 'wrongpassword');

    const promise = login(formData);

    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result.success).toBe(false);
    expect(setMock).not.toHaveBeenCalled();
  });
});
