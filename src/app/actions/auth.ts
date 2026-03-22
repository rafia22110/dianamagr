"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;
const SECRET_KEY = process.env.SESSION_SECRET;

function checkAdminConfig() {
  if (!ADMIN_USER || !ADMIN_PASS || !SECRET_KEY) {
    throw new Error(
      "Missing required administrative credentials (ADMIN_USERNAME, ADMIN_PASSWORD, or SESSION_SECRET)."
    );
  }
}

function signCookie(value: string) {
  checkAdminConfig();
  const hmac = crypto.createHmac("sha256", SECRET_KEY!);
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
