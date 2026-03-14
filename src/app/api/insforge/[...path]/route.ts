import { NextRequest, NextResponse } from 'next/server';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://ane7v4ce.us-east.insforge.app";

async function proxy(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const pathSegments = url.pathname.replace('/api/insforge', '');
        const search = url.search;
        const targetUrl = `${INSFORGE_URL}${pathSegments}${search}`;

        const headers = new Headers(req.headers);
        headers.delete('host');
        headers.delete('connection');
        headers.set('origin', INSFORGE_URL);

        const isBodyReq = req.method !== 'GET' && req.method !== 'HEAD';
        const body = isBodyReq ? await req.arrayBuffer() : undefined;

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: body,
            // @ts-ignore
            duplex: isBodyReq ? 'half' : undefined,
        });

        const respHeaders = new Headers(response.headers);
        respHeaders.delete('content-encoding');

        return new NextResponse(response.body, {
            status: response.status,
            headers: respHeaders,
        });
    } catch (err: any) {
        console.error('Proxy Error:', err);
        return new NextResponse(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
export const OPTIONS = proxy;
