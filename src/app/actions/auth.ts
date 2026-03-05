"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_USER = process.env.ADMIN_USERNAME || "diana";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "diana2024";
const SECRET_KEY = process.env.SESSION_SECRET || "default_insecure_secret_key_change_me_in_production";

function signCookie(value: string) {
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(value);
  return `${value}.${hmac.digest("hex")}`;
}

export async function verifyCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [value, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(value).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
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
