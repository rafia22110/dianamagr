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
        from: vi.fn(() => ({
          select: mockSelect,
          delete: mockDelete,
          insert: vi.fn().mockResolvedValue({ error: null }),
        })),
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
    mockOrder.mockResolvedValue({ data: mockImages, error: null });

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
    mockOrder.mockResolvedValue({ data: null, error: { message: "error" } });

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
    mockOrder.mockResolvedValue({ data: mockImages, error: null });

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
    expect(writeTextMock.mock.calls[0][0]).toContain("path%2Fto%2Ftest1.jpg");
    expect(screen.getByText("הנתיב הועתק")).toBeDefined();
  });

  it("clicking delete deletes image, shows success, and refetches", async () => {
    mockOrder.mockResolvedValue({ data: mockImages, error: null });
    mockEq.mockResolvedValue({ data: null, error: null });
    mockRemove.mockResolvedValue({ data: null, error: null });

    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText("Original 1")).toBeDefined();
    });

    expect(mockOrder).toHaveBeenCalledTimes(1);

    const deleteButtons = screen.getAllByText("מחק");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith("path/to/test1.jpg");
      expect(mockEq).toHaveBeenCalledTimes(1);
      expect(mockEq).toHaveBeenCalledWith("id", "1");
      expect(screen.getByText("התמונה נמחקה")).toBeDefined();
      expect(mockOrder).toHaveBeenCalledTimes(2);
    });
  });

  it("upload success shows message and refetches", async () => {
    mockOrder.mockResolvedValue({ data: mockImages, error: null });

    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText("Original 1")).toBeDefined();
    });

    expect(mockOrder).toHaveBeenCalledTimes(1);

    const uploadSuccessButton = screen.getByTestId("mock-upload-success");
    fireEvent.click(uploadSuccessButton);

    await waitFor(() => {
      expect(screen.getByText("התמונה הועלתה!")).toBeDefined();
      expect(mockOrder).toHaveBeenCalledTimes(2);
    });
  });

  it("exports subscribers to CSV with sanitization", async () => {
    const mockSubscribers = [
      { id: "1", name: "=SUM(1,2)", email: "test@example.com", phone: "123", subscribed_at: "2024-01-01T00:00:00Z" },
      { id: "2", name: "Normal Name", email: "other@example.com", phone: "456", subscribed_at: "2024-01-02T00:00:00Z" },
    ];

    // Initial images fetch, then subscribers fetch
    mockOrder
      .mockResolvedValueOnce({ data: mockImages, error: null })
      .mockResolvedValueOnce({ data: mockSubscribers, error: null });

    // Mock URL and anchor click
    const createObjectURLMock = vi.fn().mockReturnValue("blob:url");
    global.URL.createObjectURL = createObjectURLMock;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    // Spy on Blob to verify content
    const blobSpy = vi.spyOn(global, 'Blob');

    render(<AdminPanel />);

    // Switch to subscribers tab
    const subTabButton = screen.getByText(/מנויים/);
    fireEvent.click(subTabButton);

    await waitFor(() => {
      expect(screen.getByText("רשימת מנויים (2)")).toBeDefined();
    });

    const exportButton = screen.getByText("📥 ייצוא CSV");
    fireEvent.click(exportButton);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(blobSpy).toHaveBeenCalled();

    const blobContent = blobSpy.mock.calls[0][0][0] as string;
    // Verify sanitization: BOM + Header + Rows
    // "=SUM(1,2)" should become "'=SUM(1,2)" and be wrapped in quotes
    expect(blobContent).toContain('\uFEFFשם,אימייל,טלפון,תאריך רישום'); // Note: the BOM is at the start
    expect(blobContent).toContain('"' + "'=SUM(1,2)" + '"');
    expect(blobContent).toContain('"Normal Name"');

    clickSpy.mockRestore();
    blobSpy.mockRestore();
  });
});
