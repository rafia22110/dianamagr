"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_USER = process.env.ADMIN_USERNAME || (process.env.NODE_ENV === "production" ? undefined : "admin");
const ADMIN_PASS = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? undefined : "admin123");
const DEFAULT_SECRET = "diana_secret_key_123456789";

function getSecretKey() {
  return process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? undefined : DEFAULT_SECRET);
}

function checkAdminConfig() {
  const secretKey = getSecretKey();
  if (!ADMIN_USER || !ADMIN_PASS || !secretKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing required administrative credentials in production (ADMIN_USERNAME, ADMIN_PASSWORD, or SESSION_SECRET).");
    } else {
      console.warn("⚠️ Using default administrative credentials for development.");
    }
  }
}

function signCookie(value: string) {
  checkAdminConfig();
  const secretKey = getSecretKey();
  // 🛡️ Sentinel: Include an expiration timestamp (24 hours from now) in the signed payload.
  const expires = Date.now() + 60 * 60 * 24 * 1000;
  const payload = `${value}:${expires}`;
  const hmac = crypto.createHmac("sha256", secretKey!);
  hmac.update(payload);
  return `${payload}.${hmac.digest("hex")}`;
}

export async function verifyCookie(cookieValue: string | undefined): Promise<boolean> {
  const secretKey = getSecretKey();
  if (!cookieValue || !secretKey) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", secretKey).update(payload).digest("hex");

  // 🛡️ Sentinel: timingSafeEqual requires buffers of the same length to avoid throwing.
  // We check string lengths first to avoid unnecessary Buffer allocations and unhandled exceptions (DoS).
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  const isSignatureValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  if (!isSignatureValid) return false;

  // 🛡️ Sentinel: Verify the expiration timestamp embedded in the payload.
  // We use lastIndexOf(':') to robustly handle session IDs that might contain colons.
  const lastColonIndex = payload.lastIndexOf(":");
  if (lastColonIndex === -1) return false;

  const expiresStr = payload.substring(lastColonIndex + 1);
  const expires = parseInt(expiresStr, 10);

  if (isNaN(expires) || Date.now() > expires) {
    return false;
  }

  return true;
}

export async function login(formData: FormData) {
  checkAdminConfig();

  const usernameRaw = formData.get("username");
  const passwordRaw = formData.get("password");

  // 🛡️ Sentinel: Input validation to ensure we only process strings.
  const username = typeof usernameRaw === "string" ? usernameRaw : "";
  const password = typeof passwordRaw === "string" ? passwordRaw : "";

  // 🛡️ Sentinel: Use constant-time comparison to prevent timing attacks.
  // We hash both values to ensure they have the same length for timingSafeEqual.
  const userHash = crypto.createHash("sha256").update(username).digest();
  const passHash = crypto.createHash("sha256").update(password).digest();
  const expectedUserHash = crypto.createHash("sha256").update(ADMIN_USER!).digest();
  const expectedPassHash = crypto.createHash("sha256").update(ADMIN_PASS!).digest();

  const isUserValid = crypto.timingSafeEqual(userHash, expectedUserHash);
  const isPassValid = crypto.timingSafeEqual(passHash, expectedPassHash);

  // 🛡️ Sentinel: Always wait for 1000ms to eliminate timing side-channels
  // and slow down brute-force attempts.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (isUserValid && isPassValid) {
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
