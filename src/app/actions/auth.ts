"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;
const SECRET_KEY = process.env.SESSION_SECRET;

if (!ADMIN_USER || !ADMIN_PASS || !SECRET_KEY) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing required administrative credentials in production.");
  } else {
    console.warn("⚠️ Warning: Administrative credentials (ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET) are missing. Admin functionality will be disabled.");
  }
}

function signCookie(value: string) {
  if (!SECRET_KEY) throw new Error("SESSION_SECRET is not configured");
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(value);
  return `${value}.${hmac.digest("hex")}`;
}

export async function verifyCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue || !SECRET_KEY) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [value, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(value).digest("hex");

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
