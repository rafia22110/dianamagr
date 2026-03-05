import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageUploadForm from '../ImageUploadForm';
import { insforge } from '@/lib/insforge';

vi.mock('@/lib/insforge', () => ({
  insforge: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn()
      })),
    },
    database: {
      from: vi.fn(() => ({
        insert: vi.fn()
      })),
    },
  },
}));

describe('ImageUploadForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles database upload error correctly', async () => {
    const mockUpload = vi.fn().mockResolvedValue({
      data: { url: 'http://example.com/image.jpg', key: 'key' },
      error: null
    });
    vi.mocked(insforge.storage.from).mockReturnValue({
      upload: mockUpload
    });

    const mockInsert = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'DB Error' }
    });
    vi.mocked(insforge.database.from).mockReturnValue({
      insert: mockInsert
    });

    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    // Create a mock file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form
    const submitBtn = screen.getByText('העלה תמונה');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('DB Error')).toBeInTheDocument();
    });

    expect(mockUpload).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();

    // Test if loading state was reset
    expect(screen.getByText('העלה תמונה')).not.toBeDisabled();
  });

  it('handles general upload error correctly', async () => {
    const mockUpload = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.mocked(insforge.storage.from).mockReturnValue({
      upload: mockUpload
    });

    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    // Create a mock file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form
    const submitBtn = screen.getByText('העלה תמונה');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('שגיאה בהעלאת התמונה')).toBeInTheDocument();
    });

    expect(mockUpload).toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();

    // Test if loading state was reset
    expect(screen.getByText('העלה תמונה')).not.toBeDisabled();
  });

  it('handles storage upload error object correctly', async () => {
    const mockUpload = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Storage Error' }
    });
    vi.mocked(insforge.storage.from).mockReturnValue({
      upload: mockUpload
    });

    const { container } = render(<ImageUploadForm onSuccess={mockOnSuccess} />);

    // Create a mock file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form
    const submitBtn = screen.getByText('העלה תמונה');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Storage Error')).toBeInTheDocument();
    });

    expect(mockUpload).toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();

    // Test if loading state was reset
    expect(screen.getByText('העלה תמונה')).not.toBeDisabled();
  });
});
