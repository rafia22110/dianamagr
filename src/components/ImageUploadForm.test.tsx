import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import ImageUploadForm from './ImageUploadForm';

describe('ImageUploadForm', () => {
  const mockOnSuccess = vi.fn();
  const fetchSpy = vi.spyOn(global, 'fetch');

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
      const errorDiv = container.querySelector('.bg-red-100');
      expect(errorDiv).toBeDefined();
      expect(errorDiv?.textContent).toBe('בחרי תמונה');
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows error when submitting with invalid file type', async () => {
    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);

    fireEvent.click(screen.getByRole('button', { name: /העלה תמונה/i }));

    await waitFor(() => {
      expect(screen.getByText('פורמט לא נתמך. העלי JPG, PNG, GIF או WEBP')).toBeDefined();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
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
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, url: 'http://example.com/test.jpg' }),
    } as Response);

    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);

    fireEvent.change(screen.getByPlaceholderText(/תיאור לתמונה/i), { target: { value: 'My alt text' } });
    fireEvent.click(screen.getByText('דיאנה רחמני'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'book' } });

    fireEvent.click(screen.getByRole('button', { name: /העלה תמונה/i }));

    expect(screen.getByRole('button', { name: /מעלה.../i })).toBeDefined();

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/upload');
    expect(options?.method).toBe('POST');

    const formData = options?.body as FormData;
    expect(formData.get('category')).toBe('book');
    expect(formData.get('altText')).toBe('My alt text');
    expect(formData.get('tags')).toBe(JSON.stringify(['דיאנה רחמני']));
    expect(formData.get('file')).toBe(file);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error message if API returns error', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Upload failed for some reason' }),
    } as Response);

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

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('shows communication error message if fetch throws an exception', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network Error'));

    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);

    fireEvent.click(screen.getByRole('button', { name: /העלה תמונה/i }));

    await waitFor(() => {
      expect(screen.getByText('שגיאה בתקשורת מול השרת')).toBeDefined();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
