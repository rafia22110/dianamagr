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

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

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
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, url: 'http://example.com/test.jpg' }),
    });

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
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[0]).toBe('/api/upload');
    expect(fetchCall[1].method).toBe('POST');
    const body = fetchCall[1].body as FormData;
    expect(body.get('file')).toBe(file);
    expect(body.get('category')).toBe('book');
    expect(body.get('altText')).toBe('My alt text');
    expect(JSON.parse(body.get('tags') as string)).toEqual(['דיאנה רחמני']);

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('shows error message if upload fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Upload failed for some reason' }),
    });

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

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('shows error message if database insert fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Database insert failed' }),
    });

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

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
