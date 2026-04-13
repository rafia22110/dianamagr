import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, OPTIONS } from './route';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCookie } from '@/app/actions/auth';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));
vi.mock('@/app/actions/auth', () => ({ verifyCookie: vi.fn() }));
global.fetch = vi.fn();

describe('InsForge Proxy Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows public newsletter signup without auth', async () => {
    const req = new NextRequest('http://l/api/insforge/subscribers', { method: 'POST' });
    vi.mocked(fetch).mockResolvedValue(new Response('ok', { status: 201 }));
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(verifyCookie).not.toHaveBeenCalled();
  });

  it('allows OPTIONS preflights without auth', async () => {
    const req = new NextRequest('http://l/api/insforge/any', { method: 'OPTIONS' });
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
  });

  it('returns 401 for unauthorized protected requests', async () => {
    const req = new NextRequest('http://l/api/insforge/protected');
    vi.mocked(cookies).mockResolvedValue({ get: () => null } as any);
    vi.mocked(verifyCookie).mockResolvedValue(false);
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('proxies authorized requests with headers', async () => {
    const req = new NextRequest('http://l/api/insforge/p?q=1', { headers: { 'host': 'h' } });
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 's' }) } as any);
    vi.mocked(verifyCookie).mockResolvedValue(true);
    vi.mocked(fetch).mockResolvedValue(new Response('ok'));
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/p?q=1'), expect.objectContaining({
      headers: expect.any(Headers)
    }));
    const headers = (vi.mocked(fetch).mock.calls[0][1] as any).headers as Headers;
    expect(headers.has('host')).toBe(false);
    expect(headers.get('origin')).toBeDefined();
  });

  it('returns 500 on proxy failure', async () => {
    const req = new NextRequest('http://l/api/insforge/fail');
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 's' }) } as any);
    vi.mocked(verifyCookie).mockResolvedValue(true);
    vi.mocked(fetch).mockRejectedValue(new Error('fail'));
    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
