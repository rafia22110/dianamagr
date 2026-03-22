import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { insforge } from '@/lib/insforge';
import { ensureAdmin } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

vi.mock('@/lib/insforge', () => ({
  insforge: {
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
    },
    database: {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-utils', () => ({
  ensureAdmin: vi.fn(),
}));

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forces correct extension based on MIME type even if filename is misleading', async () => {
    (ensureAdmin as any).mockResolvedValue(null);

    const mockFile = new File(['dummy'], 'malicious.php', { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('category', 'test');

    const request = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    (insforge.storage.from('diana-images').upload as any).mockResolvedValue({
      data: { key: 'test/random.png', url: 'http://example.com/png' },
      error: null,
    });
    (insforge.database.from('images').insert as any).mockResolvedValue({ error: null });

    await POST(request);

    const uploadCall = (insforge.storage.from('diana-images').upload as any).mock.calls[0];
    const key = uploadCall[0];
    expect(key).to.match(/^test\/\d+_[a-z0-9]+\.png$/);
    expect(key).not.to.contain('.php');
  });

  it('rejects unsupported MIME types', async () => {
    (ensureAdmin as any).mockResolvedValue(null);

    const mockFile = new File(['dummy'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const request = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Unsupported file type');
  });
});
