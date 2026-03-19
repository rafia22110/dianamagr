import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCookie } from '@/app/actions/auth';

const INSFORGE_URL = process.env.INSFORGE_URL || "https://ane7v4ce.us-east.insforge.app";

async function proxy(req: NextRequest) {
    try {
        const url = new URL(req.url);
        // 🔄 Fix: Map /api/insforge to the ROOT of the backend URL.
        // This ensures /api/insforge/rest/v1 maps to Backend/rest/v1
        // and /api/insforge/api/storage maps to Backend/api/storage.
        const pathSegments = url.pathname.replace('/api/insforge', '');

        // 🛡️ Sentinel: Authorization Logic
        // Allow:
        // 1. Public newsletter signup (POST to subscribers)
        // 2. Public storage access (GET to public buckets)
        // 3. Auth operations (signing in, etc)
        // 4. Preflight OPTIONS requests
        const isPublicSignup = req.method === 'POST' && (
            pathSegments.includes('/subscribers') || 
            pathSegments.includes('/rest/v1/subscribers')
        );
        const isPublicStorage = req.method === 'GET' && (
            pathSegments.includes('/storage/v1/object/public/') || 
            pathSegments.startsWith('/api/storage/') ||
            pathSegments.startsWith('/storage/')
        );
        const isAuth = pathSegments.startsWith('/auth/v1/') || pathSegments.startsWith('/api/auth/v1/');
        const isOptions = req.method === 'OPTIONS';

        if (!isPublicSignup && !isPublicStorage && !isAuth && !isOptions) {
            const cookieStore = await cookies();
            const sessionCookie = cookieStore.get("admin_session")?.value;
            const isAdmin = await verifyCookie(sessionCookie);

            if (!isAdmin) {
                return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

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
        // 🛡️ Sentinel: Sanitize error messages to avoid leaking internals.
        console.error('Proxy Error:', err);
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
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
