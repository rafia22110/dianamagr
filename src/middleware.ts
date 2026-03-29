import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import crypto from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || "diana_secret_key_123456789";

async function verifyCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [value, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(value).digest("hex");

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  try {
      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
      return false;
  }
}

export async function middleware(request: any) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    const isAdmin = await verifyCookie(sessionCookie);

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin'; // Redirecting to the main admin page (which will show Login)
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
