import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Using Web Crypto API as standard crypto is not available in Edge Runtime
async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  if (payload !== "authenticated") return false;

  const secretString = process.env.ADMIN_SECRET || "default_unsafe_secret";

  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(secretString);
  const data = encoder.encode(payload);

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      data
    );

    return isValid;
  } catch (e) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin"); // If you add protected APIs in the future
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute || isApiAdminRoute) {
    const token = request.cookies.get("admin_token")?.value;
    const isValidToken = await verifyToken(token);

    if (!isValidToken && !isLoginRoute) {
      // For API routes, return 401 instead of redirecting
      if (isApiAdminRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (isValidToken && isLoginRoute) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
