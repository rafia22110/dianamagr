"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

// 🛡️ Sentinel: Fallback secret to prevent build crashes while maintaining security.
const RUNTIME_SECRET = crypto.randomBytes(32).toString("hex");
const SECRET_KEY = process.env.SESSION_SECRET || RUNTIME_SECRET;

if (!ADMIN_USER || !ADMIN_PASS || !process.env.SESSION_SECRET) {
  if (process.env.NODE_ENV === "production") {
    // 🛡️ Sentinel: Defer credential checks to runtime to prevent build-time crashes.
    // Next.js static analysis/pre-rendering may trigger this during 'next build'.
  } else {
    console.warn("⚠️ Warning: Administrative credentials (ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET) are missing. Admin functionality will be disabled.");
  }
}

/**
 * timingSafeCompare - compare two strings in constant time to prevent timing attacks.
 */
function timingSafeCompare(a: string, b: string) {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function signCookie(value: string) {
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(value);
  return `${value}.${hmac.digest("hex")}`;
}

export async function verifyCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue || !SECRET_KEY) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [value, signature] = parts;

  // 🛡️ Sentinel: Limit input length to prevent DoS via large session IDs.
  if (value.length > 100) return false;

  const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(value).digest("hex");

  // 🛡️ Sentinel: timingSafeEqual requires buffers of the same length to avoid throwing.
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function login(formData: FormData) {
  if (!ADMIN_USER || !ADMIN_PASS) {
    console.error("Administrative credentials are not configured.");
    return { success: false, error: "המערכת אינה מוגדרת כראוי" };
  }

  const username = (formData.get("username") as string) || "";
  const password = (formData.get("password") as string) || "";

  // 🛡️ Sentinel: Timing-safe comparison to prevent user/password enumeration.
  const isUserValid = timingSafeCompare(username, ADMIN_USER);
  const isPassValid = timingSafeCompare(password, ADMIN_PASS);

  if (isUserValid && isPassValid) {
    const cookieStore = await cookies();
    const sessionId = crypto.randomUUID();
    const signedValue = signCookie(sessionId);

    cookieStore.set("admin_session", signedValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return { success: true };
  }

  // 🛡️ Sentinel: 1-second delay on failure to mitigate brute-force attempts.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: false, error: "שם משתמש או סיסמה שגויים" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
