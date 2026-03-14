import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import ImageUploadForm from './ImageUploadForm';

const { mockUploadImageAction } = vi.hoisted(() => {
  return {
    mockUploadImageAction: vi.fn(),
  };
});

// Mock admin actions
vi.mock('@/app/actions/admin', () => ({
  uploadImageAction: mockUploadImageAction,
}));

describe('ImageUploadForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders form elements correctly', () => {
    render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    expect(screen.getByText(/בחרי תמונה/i)).toBeDefined();
    expect(screen.getByText(/קטגוריה/i)).toBeDefined();
    expect(screen.getByText(/תיאור \(Alt Text\)/i)).toBeDefined();
    expect(screen.getByText(/תגיות/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /העלה תמונה/i })).toBeDefined();
  });

  it('shows error when submitting without a file', async () => {
    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: /העלה תמונה/i }));

    await waitFor(() => {
      // Look for the specific error div, as the label also has this text
      const errorDiv = container.querySelector('.bg-red-100');
      expect(errorDiv).toBeDefined();
      expect(errorDiv?.textContent).toBe('בחרי תמונה');
    });
    expect(mockUploadImageAction).not.toHaveBeenCalled();
  });

  it('shows error when submitting with invalid file type', async () => {
    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    // Using Object.defineProperty to simulate file selection because fireEvent.change doesn't always set files array in JSDOM the same way
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);

    fireEvent.click(screen.getByRole('button', { name: /העלה תמונה/i }));

    await waitFor(() => {
      expect(screen.getByText('פורמט לא נתמך. העלי JPG, PNG, GIF או WEBP')).toBeDefined();
    });
    expect(mockUploadImageAction).not.toHaveBeenCalled();
  });

  it('toggles tags correctly', () => {
    render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    const tagButton = screen.getByText('דיאנה רחמני');

    // Initially not selected (gray background)
    expect(tagButton.className).toContain('bg-gray-200');

    // Click to select
    fireEvent.click(tagButton);
    expect(tagButton.className).toContain('bg-primary text-white');

    // Click to deselect
    fireEvent.click(tagButton);
    expect(tagButton.className).toContain('bg-gray-200');
  });

  it('successfully uploads a file and calls onSuccess', async () => {
    mockUploadImageAction.mockResolvedValue({ success: true });

    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);

    // Set alt text
    fireEvent.change(screen.getByPlaceholderText(/תיאור לתמונה/i), { target: { value: 'My alt text' } });

    // Select a tag
    fireEvent.click(screen.getByText('דיאנה רחמני'));

    // Select category (already 'gallery' by default, but let's change it)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'book' } });

    fireEvent.click(screen.getByRole('button', { name: /העלה תמונה/i }));

    // Button should show loading state temporarily
    expect(screen.getByRole('button', { name: /מעלה.../i })).toBeDefined();

    await waitFor(() => {
      expect(mockUploadImageAction).toHaveBeenCalledTimes(1);
    });

    const formData = mockUploadImageAction.mock.calls[0][0] as FormData;
    expect(formData.get('file')).toBe(file);
    expect(formData.get('category')).toBe('book');
    expect(formData.get('altText')).toBe('My alt text');
    expect(JSON.parse(formData.get('tags') as string)).toEqual(['דיאנה רחמני']);

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('shows error message if upload fails', async () => {
    mockUploadImageAction.mockRejectedValue(new Error('Upload failed for some reason'));

    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);

    fireEvent.click(screen.getByRole('button', { name: /העלה תמונה/i }));

    await waitFor(() => {
      expect(screen.getByText('Upload failed for some reason')).toBeDefined();
    });

    expect(mockUploadImageAction).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
