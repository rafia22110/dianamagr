"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import { insforge } from "@/lib/insforge";

const SECRET_KEY = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? undefined : "diana_secret_key_123456789");

function checkAdminConfig() {
  if (!SECRET_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing SESSION_SECRET environment variable in production.");
    } else {
      console.warn("⚠️ Using default SESSION_SECRET for development.");
    }
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

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function login(formData: FormData) {
  checkAdminConfig();

  const emailRaw = formData.get("username"); // Using "username" field as email
  const passwordRaw = formData.get("password");

  const email = typeof emailRaw === "string" ? emailRaw : "";
  const password = typeof passwordRaw === "string" ? passwordRaw : "";

  // 🛡️ Sentinel: Always wait for 1000ms to eliminate timing side-channels
  // and slow down brute-force attempts.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password
    });

    if (error || !data.user) {
        console.error("Login Auth Error:", error);
        return { success: false, error: "שם משתמש או סיסמה שגויים" };
    }

    // Check if the user has an 'admin' metadata or is a specific email if needed.
    // For now, any successful login to this backend via password is considered admin
    // as it's the back-office login. In a real app, check user.user_metadata.role === 'admin'

    const cookieStore = await cookies();
    const sessionId = data.session?.access_token || crypto.randomUUID();
    const signedValue = signCookie(sessionId);

    cookieStore.set("admin_session", signedValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return { success: true };
  } catch (err) {
      console.error("Login Exception:", err);
      return { success: false, error: "אירעה שגיאה בכניסה למערכת" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  await insforge.auth.signOut();
}
