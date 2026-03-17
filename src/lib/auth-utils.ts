import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCookie } from '@/app/actions/auth';

/**
 * 🛡️ Sentinel: Middleware-like helper to ensure the request is from an authenticated admin.
 * Returns a 401 Unauthorized response if not authenticated, otherwise returns null.
 */
export async function ensureAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  const isAdmin = await verifyCookie(sessionCookie);

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
