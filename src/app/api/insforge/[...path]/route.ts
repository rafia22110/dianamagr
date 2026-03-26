import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCookie } from '@/app/actions/auth';

const INSFORGE_URL = process.env.INSFORGE_URL || "https://ane7v4ce.us-east.insforge.app";

async function proxy(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const pathSegments = url.pathname.replace('/api/insforge', '');

        // 🛡️ Sentinel: Authorization Logic
        // Allow public newsletter signup (POST to subscribers), auth operations, and OPTIONS preflights.
        // For all other operations (including database reads/writes), require a valid admin session.
        // We check for the specific endpoint path to prevent unauthorized access to other internal paths.
        const isPublicSignup = req.method === 'POST' && (pathSegments === '/subscribers' || pathSegments === '/subscribers/');
        const isAuth = pathSegments.startsWith('/auth/v1/');
        const isOptions = req.method === 'OPTIONS';

        if (!isPublicSignup && !isAuth && !isOptions) {
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
