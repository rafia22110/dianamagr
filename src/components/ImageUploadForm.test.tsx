import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import ImageUploadForm from './ImageUploadForm';

const { mockUpload, mockInsert } = vi.hoisted(() => {
  const mockUpload = vi.fn();
  const mockInsert = vi.fn();
  return { mockUpload, mockInsert };
});

// Mock insforge module completely
vi.mock('@/lib/insforge', () => {
  return {
    insforge: {
      storage: {
        from: vi.fn((bucket: string) => ({
          upload: mockUpload,
        })),
      },
      database: {
        from: vi.fn((table: string) => ({
          insert: mockInsert,
        })),
      },
    },
  };
});

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
    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
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
    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
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
    mockUpload.mockResolvedValue({ data: { url: 'http://example.com/test.jpg', key: 'gallery/test.jpg' }, error: null });
    mockInsert.mockResolvedValue({ data: null, error: null });

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
      expect(mockUpload).toHaveBeenCalledTimes(1);
    });

    expect(mockUpload.mock.calls[0][0]).toMatch(/^book\/\d+_[a-z0-9]+\.jpg$/);
    expect(mockUpload.mock.calls[0][1]).toBe(file);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'test.jpg',
      original_name: 'test.jpg',
      category: 'book',
      tags: ['דיאנה רחמני'],
      alt_text: 'My alt text',
      storage_path: 'gallery/test.jpg', // Mocked return value for key
      url: 'http://example.com/test.jpg'
    }));

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('shows error message if upload fails', async () => {
    mockUpload.mockResolvedValue({ data: null, error: { message: 'Upload failed for some reason' } });

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

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('shows error message if database insert fails', async () => {
    mockUpload.mockResolvedValue({ data: { url: 'http://example.com/test.png', key: 'gallery/test.png' }, error: null });
    mockInsert.mockResolvedValue({ data: null, error: { message: 'Database insert failed' } });

    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);

    fireEvent.click(screen.getByRole('button', { name: /העלה תמונה/i }));

    await waitFor(() => {
      expect(screen.getByText('Database insert failed')).toBeDefined();
    });

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
