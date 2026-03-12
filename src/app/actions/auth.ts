"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";

// 🛡️ Sentinel: Use a dynamic fallback in production to avoid hardcoded secrets.
const DEFAULT_SECRET = "diana_secret_key_123456789_placeholder";
const SESSION_SECRET = process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production" ? crypto.randomBytes(32).toString("hex") : DEFAULT_SECRET);

function checkAdminConfig() {
  if (process.env.NODE_ENV === "production") {
    if (ADMIN_USER === "admin" || ADMIN_PASS === "admin123") {
      console.error("⚠️ SECURITY WARNING: Using default administrative credentials in production.");
    }
    if (!process.env.SESSION_SECRET) {
      console.warn("⚠️ SECURITY WARNING: SESSION_SECRET is not set. Using a temporary secret for this process.");
    }
  }
}

function signCookie(value: string) {
  checkAdminConfig();
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(value);
  return `${value}.${hmac.digest("hex")}`;
}

export async function verifyCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [value, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");

  // 🛡️ Sentinel: timingSafeEqual requires buffers of the same length.
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * 🛡️ Sentinel: Timing-safe string comparison using SHA-256.
 */
function safeCompare(a: string, b: string) {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export async function login(formData: FormData) {
  const username = (formData.get("username") as string) || "";
  const password = (formData.get("password") as string) || "";

  // 🛡️ Sentinel: Use timing-safe comparison to prevent username/password enumeration.
  const isUserValid = safeCompare(username, ADMIN_USER);
  const isPassValid = safeCompare(password, ADMIN_PASS);

  // 🛡️ Sentinel: Constant time response. Apply delay to both success and failure paths
  // to avoid a timing side-channel that reveals valid credentials.
  await new Promise((resolve) => setTimeout(resolve, 1000));

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

  return { success: false, error: "שם משתמש או סיסמה שגויים" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
