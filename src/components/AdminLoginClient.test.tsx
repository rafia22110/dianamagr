import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AdminLoginClient from './AdminLoginClient';
import { login } from '@/app/actions/auth';

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock auth actions
vi.mock('@/app/actions/auth', () => ({
  login: vi.fn(),
}));

describe('AdminLoginClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the login form correctly', () => {
    render(<AdminLoginClient />);
    expect(screen.getByText('התחברות למערכת הניהול')).toBeDefined();
    expect(screen.getByLabelText('שם משתמש')).toBeDefined();
    expect(screen.getByLabelText('סיסמה')).toBeDefined();
    expect(screen.getByRole('button', { name: 'התחבר' })).toBeDefined();
  });

  it('handles successful login', async () => {
    (login as any).mockResolvedValue({ success: true });
    render(<AdminLoginClient />);

    fireEvent.change(screen.getByLabelText('שם משתמש'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('סיסמה'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('handles failed login', async () => {
    const errorMessage = 'שם משתמש או סיסמה שגויים';
    (login as any).mockResolvedValue({ success: false, error: errorMessage });
    render(<AdminLoginClient />);

    fireEvent.change(screen.getByLabelText('שם משתמש'), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText('סיסמה'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledTimes(1);
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });
});
