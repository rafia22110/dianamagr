import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminPanel from './AdminPanel';

const { mockOrder, mockSelect, mockEq, mockDelete, mockRemove } = vi.hoisted(() => {
  const mockOrder = vi.fn();
  const mockSelect = vi.fn(() => ({ order: mockOrder }));
  const mockEq = vi.fn();
  const mockDelete = vi.fn(() => ({ eq: mockEq }));

  const mockRemove = vi.fn();
  return { mockOrder, mockSelect, mockEq, mockDelete, mockRemove };
});

// Mock insforge module completely
vi.mock('@/lib/insforge', () => {
  return {
    insforge: {
      database: {
        from: vi.fn((table: string) => {
          if (table === 'images') {
            return {
              select: mockSelect,
              delete: mockDelete,
            };
          }
          return {};
        }),
      },
      storage: {
        from: vi.fn((bucket: string) => {
          return {
            remove: mockRemove,
          };
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

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { insforge } from '@/lib/insforge';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders successfully and fetches images", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ images: mockImages }),
    });

    render(<AdminPanel />);

    // Shows loading initially
    expect(screen.getByText("טוען...")).toBeDefined();

    await waitFor(() => {
      expect(screen.queryByText("טוען...")).toBeNull();
    });

    expect(screen.getByText("Original 1")).toBeDefined();
    expect(screen.getByText("Original 2")).toBeDefined();
    expect(screen.getByText("כל התמונות (2)")).toBeDefined();
  });

  it("handles error during image fetch", async () => {
    mockFetch.mockRejectedValue(new Error("error"));

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
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ images: mockImages }),
    });

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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ images: mockImages }),
    });
    mockFetch.mockResolvedValueOnce({ ok: true }); // Delete
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ images: [] }),
    }); // Refetch

    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText("Original 1")).toBeDefined();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const deleteButtons = screen.getAllByText("מחק");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(screen.getByText("התמונה נמחקה בהצלחה")).toBeDefined();
    });
  });

  it("upload success shows message and refetches", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ images: mockImages }),
    });

    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText("Original 1")).toBeDefined();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const uploadSuccessButton = screen.getByTestId("mock-upload-success");
    fireEvent.click(uploadSuccessButton);

    await waitFor(() => {
      expect(screen.getByText("התמונה הועלתה!")).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
