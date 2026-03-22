import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { verifyCookie } from '@/app/actions/auth';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));
vi.mock('@/app/actions/auth', () => ({ verifyCookie: vi.fn() }));

describe('Proxy API Route', () => {
  const req = new NextRequest('http://localhost/api/insforge/test');
  beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()); });

  it('returns 500 when fetch fails', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 's' }) } as any);
    vi.mocked(verifyCookie).mockResolvedValue(true);
    vi.mocked(fetch).mockRejectedValue(new Error('fail'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('proxies successful response', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 's' }) } as any);
    vi.mocked(verifyCookie).mockResolvedValue(true);
    vi.mocked(fetch).mockResolvedValue({
      status: 200, headers: new Headers(), body: JSON.stringify({ ok: 1 }),
    } as any);

    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: 1 });
  });
});
