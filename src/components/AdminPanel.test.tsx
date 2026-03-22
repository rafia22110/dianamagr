import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import AdminPanel from './AdminPanel';

const { mockOrder, mockSelect, mockEq, mockDelete } = vi.hoisted(() => {
  const mockOrder = vi.fn();
  const mockSelect = vi.fn(() => ({ order: mockOrder }));
  const mockEq = vi.fn();
  const mockDelete = vi.fn(() => ({ eq: mockEq }));

  return { mockOrder, mockSelect, mockEq, mockDelete };
});

// Mock insforge module for tabs that still use it directly (subscribers, links, messages)
vi.mock('@/lib/insforge', () => {
  return {
    insforge: {
      database: {
        from: vi.fn((table: string) => {
          if (table === 'subscribers' || table === 'links' || table === 'messages') {
            return {
              select: mockSelect,
              delete: mockDelete,
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          return {};
        }),
      },
    },
  };
});

// Mock ImageUploadForm component
vi.mock('./ImageUploadForm', () => {
  return {
    default: function MockImageUploadForm({ onSuccess }: { onSuccess: () => void }) {
      return <button data-testid="mock-upload-success" onClick={onSuccess}>Upload Success</button>;
    },
  };
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockImages = [
  {
    id: "1",
    filename: "test1.jpg",
    original_name: "Original 1",
    category: "hero",
    storage_path: "path/to/test1.jpg",
    url: "http://example.com/test1.jpg",
  },
  {
    id: "2",
    filename: "test2.jpg",
    original_name: "Original 2",
    category: "gallery",
    storage_path: "path/to/test2.jpg",
  },
];

describe("AdminPanel", () => {
  const fetchSpy = vi.spyOn(global, 'fetch');

  beforeEach(() => {
    vi.clearAllMocks();
    // Default fetch mock for images
    fetchSpy.mockImplementation((url: any) => {
      if (typeof url === 'string' && url.startsWith('/api/images')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ images: mockImages }),
        } as Response);
      }
      return Promise.reject(new Error(`Unhandled fetch to ${url}`));
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders successfully and fetches images", async () => {
    render(<AdminPanel />);

    // Shows loading initially
    expect(screen.getByText("טוען...")).toBeDefined();

    await waitFor(() => {
      expect(screen.queryByText("טוען...")).toBeNull();
    });

    expect(screen.getByText("Original 1")).toBeDefined();
    expect(screen.getByText("Original 2")).toBeDefined();
    expect(screen.getByText("כל התמונות (2)")).toBeDefined();
    expect(fetchSpy).toHaveBeenCalledWith('/api/images');
  });

  it("handles error during image fetch", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Fetch failed' }),
    } as Response);

    // Mute console.warn for this test
    const originalWarn = console.warn;
    console.warn = vi.fn();

    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.queryByText("טוען...")).toBeNull();
    });

    expect(screen.getByText("כל התמונות (0)")).toBeDefined();
    expect(screen.queryByText("Original 1")).toBeNull();

    console.warn = originalWarn;
  });

  it("clicking copy path copies to clipboard and shows success message", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText("Original 1")).toBeDefined();
    });

    const copyButtons = screen.getAllByText("העתק נתיב");
    fireEvent.click(copyButtons[0]);

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock.mock.calls[0][0]).toContain("path/to/test1.jpg");
    expect(screen.getByText("הנתיב הועתק")).toBeDefined();
  });

  it("clicking delete deletes image, shows success, and refetches", async () => {
    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText("Original 1")).toBeDefined();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1); // Initial fetch

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const deleteButtons = screen.getAllByText("מחק");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      // Check for delete call
      const deleteCall = fetchSpy.mock.calls.find(call => call[1]?.method === 'DELETE');
      expect(deleteCall).toBeDefined();
      expect(deleteCall![0]).toContain('id=1');
      expect(deleteCall![0]).toContain('storagePath=path%2Fto%2Ftest1.jpg');

      expect(screen.getByText("התמונה נמחקה בהצלחה")).toBeDefined();
      // Should refetch
      expect(fetchSpy).toHaveBeenCalledTimes(3); // 1 initial + 1 delete + 1 refetch
    });
  });

  it("upload success shows message and refetches", async () => {
    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText("Original 1")).toBeDefined();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const uploadSuccessButton = screen.getByTestId("mock-upload-success");
    fireEvent.click(uploadSuccessButton);

    await waitFor(() => {
      expect(screen.getByText("התמונה הועלתה!")).toBeDefined();
      expect(fetchSpy).toHaveBeenCalledTimes(2); // 1 initial + 1 refetch
    });
  });
});
