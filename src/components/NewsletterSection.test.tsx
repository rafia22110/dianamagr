import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import NewsletterSection from './NewsletterSection';

const { mockInsert } = vi.hoisted(() => {
  return { mockInsert: vi.fn() };
});

vi.mock('@/lib/insforge', () => {
  return {
    insforge: {
      database: {
        from: vi.fn((table: string) => {
          if (table === 'subscribers') {
            return {
              insert: mockInsert,
            };
          }
          return {};
        }),
      },
    },
  };
});

describe('NewsletterSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the form initially', () => {
    render(<NewsletterSection />);
    expect(screen.getByPlaceholderText('דיאנה רחמני')).toBeDefined();
    expect(screen.getByPlaceholderText('050-0000000')).toBeDefined();
    expect(screen.getByPlaceholderText('your@email.com')).toBeDefined();
    expect(screen.getByRole('button', { name: /הצטרפו עכשיו בחינם/i })).toBeDefined();
  });

  it('submits successfully and shows success message', async () => {
    mockInsert.mockResolvedValue({ error: null });

    render(<NewsletterSection />);

    const nameInput = screen.getByPlaceholderText('דיאנה רחמני');
    const phoneInput = screen.getByPlaceholderText('050-0000000');
    const emailInput = screen.getByPlaceholderText('your@email.com');
    const submitButton = screen.getByRole('button', { name: /הצטרפו עכשיו בחינם/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(phoneInput, { target: { value: '0501234567' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /רושמים אותך/i })).toBeDefined();

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockInsert).toHaveBeenCalledWith([
        {
          name: 'Test User',
          email: 'test@example.com',
          phone: '0501234567',
          subscribed_at: expect.any(String),
        },
      ]);
      expect(screen.getByText('נרשמתם בהצלחה! נשלח לכם עדכונים חמים 🎉')).toBeDefined();
    });
  });

  it('handles duplicate submission by showing already subscribed message', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'duplicate key value violates unique constraint' } });

    render(<NewsletterSection />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const submitButton = screen.getByRole('button', { name: /הצטרפו עכשיו בחינם/i });

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(screen.getByText('כבר רשומים! תודה 😊')).toBeDefined();
    });
  });

  it('handles errors during submission by showing an error message', async () => {
    const originalError = console.error;
    console.error = vi.fn(); // Mute console.error for this test

    mockInsert.mockResolvedValue({ error: { message: 'Some database error' } });

    render(<NewsletterSection />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const submitButton = screen.getByRole('button', { name: /הצטרפו עכשיו בחינם/i });

    fireEvent.change(emailInput, { target: { value: 'error@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(screen.getByText('אירעה שגיאה. נסו שוב בעוד רגע.')).toBeDefined();
    });

    console.error = originalError;
  });

  it('handles unexpected exceptions during submission', async () => {
    const originalError = console.error;
    console.error = vi.fn(); // Mute console.error for this test

    mockInsert.mockRejectedValue(new Error('Network error'));

    render(<NewsletterSection />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const submitButton = screen.getByRole('button', { name: /הצטרפו עכשיו בחינם/i });

    fireEvent.change(emailInput, { target: { value: 'network@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(screen.getByText('אירעה שגיאה. נסו שוב בעוד רגע.')).toBeDefined();
    });

    console.error = originalError;
  });

  it('does not submit if email is empty', async () => {
    render(<NewsletterSection />);

    const submitButton = screen.getByRole('button', { name: /הצטרפו עכשיו בחינם/i });

    // Attempting to submit empty form
    fireEvent.click(submitButton);

    // Wait a short tick
    await new Promise((r) => setTimeout(r, 0));

    // Shouldn't have called insert
    expect(mockInsert).not.toHaveBeenCalled();
    // Still in idle state, so submit button is present
    expect(screen.getByRole('button', { name: /הצטרפו עכשיו בחינם/i })).toBeDefined();
  });
});
