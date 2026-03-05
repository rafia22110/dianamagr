import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPanel from './AdminPanel';
import { insforge } from '@/lib/insforge';

// Mock the insforge module
vi.mock('@/lib/insforge', () => ({
  insforge: {
    database: {
      from: vi.fn(),
    },
    storage: {
      from: vi.fn(),
    },
  },
}));

// Mock ImageUploadForm as it's not needed for testing fetchImages
vi.mock('./ImageUploadForm', () => {
  return {
    default: () => <div data-testid="upload-form">Upload Form</div>,
  };
});

describe('AdminPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchImages error path', () => {
    it('handles errors when fetching images gracefully', async () => {
      // Suppress console.warn for this test since we expect it to be called
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock an error response (e.g., database connection issue)
      const mockError = new Error('Database connection failed');

      // Setup the mock chain for insforge.database.from("images").select("*").order("upload_date", ...)
      const mockOrder = vi.fn().mockRejectedValue(mockError);
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      (insforge.database.from as any).mockImplementation((table: string) => {
        if (table === 'images') return { select: mockSelect };
        return {};
      });

      render(<AdminPanel />);

      // Wait for the fetch to complete and state to update
      await waitFor(() => {
        // The loading text should disappear
        expect(screen.queryByText('טוען...')).not.toBeInTheDocument();
      });

      // Verify that console.warn was called with the error
      expect(consoleWarnSpy).toHaveBeenCalledWith(mockError);

      // Verify that the images list is empty (setImages([]) was called)
      expect(screen.getByText('כל התמונות (0)')).toBeInTheDocument();

      consoleWarnSpy.mockRestore();
    });

    it('handles error object returned instead of throwing', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock an error response object (e.g., Supabase style error response)
      const mockErrorResponse = { data: null, error: { message: 'Not found' } };

      const mockOrder = vi.fn().mockResolvedValue(mockErrorResponse);
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      (insforge.database.from as any).mockImplementation((table: string) => {
        if (table === 'images') return { select: mockSelect };
        return {};
      });

      render(<AdminPanel />);

      await waitFor(() => {
        expect(screen.queryByText('טוען...')).not.toBeInTheDocument();
      });

      // When not throwing, but returning {error: ...}, the catch block is not hit,
      // but the `if (!error && data)` block is skipped. Wait, the code is:
      // if (!error && data) setImages(data as ImageRecord[]);
      // catch(e) ...
      // So setImages is not called with [], but it defaults to [].
      expect(screen.getByText('כל התמונות (0)')).toBeInTheDocument();
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });
});
