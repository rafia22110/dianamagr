"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

// Fallback session secret initialized once per runtime if not provided in process.env
const FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');

function getCredentials() {
  return {
    ADMIN_USER: process.env.ADMIN_USERNAME,
    ADMIN_PASS: process.env.ADMIN_PASSWORD,
    SECRET_KEY: process.env.SESSION_SECRET || FALLBACK_SECRET,
  };
}

function checkCredentials() {
  const { ADMIN_USER, ADMIN_PASS } = getCredentials();
  if (!ADMIN_USER || !ADMIN_PASS) {
    console.error("⚠️ Error: Administrative credentials (ADMIN_USERNAME, ADMIN_PASSWORD) are missing. Admin functionality will be disabled.");
    return false;
  }
  return true;
}

function signCookie(value: string) {
  const { SECRET_KEY } = getCredentials();
  const hmac = crypto.createHmac("sha256", SECRET_KEY as string);
  hmac.update(value);
  return `${value}.${hmac.digest("hex")}`;
}

export async function verifyCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!checkCredentials()) return false;
  const { SECRET_KEY } = getCredentials();
  if (!cookieValue || !SECRET_KEY) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [value, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SECRET_KEY as string).update(value).digest("hex");

  // 🛡️ Sentinel: timingSafeEqual requires buffers of the same length to avoid throwing.
  // We check string lengths first to avoid unnecessary Buffer allocations.
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function login(formData: FormData) {
  if (!checkCredentials()) {
    return { success: false, error: "שגיאת מערכת: אזור הניהול אינו מוגדר" };
  }
  const { ADMIN_USER, ADMIN_PASS } = getCredentials();
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const cookieStore = await cookies();
    const sessionId = crypto.randomUUID(); // create a random session id
    const signedValue = signCookie(sessionId);

    cookieStore.set("admin_session", signedValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // 🛡️ Sentinel: Defense-in-depth against CSRF.
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return { success: true };
  }

  return { success: false, error: "שם משתמש או סיסמה שגויים" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
