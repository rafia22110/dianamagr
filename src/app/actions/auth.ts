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

  const [accessToken, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(accessToken).digest("hex");

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  const isSignatureValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  if (!isSignatureValid) return false;

  // Now, verify the ACTUAL token with InsForge to ensure it hasn't expired or been revoked.
  try {
    // We use a hack to set the token for this request since we are on the server
    // and using a singleton client.
    (insforge.auth as any).tokenManager.setAccessToken(accessToken);
    const { data, error } = await insforge.auth.getCurrentUser();
    
    if (error || !data?.user) {
      console.warn("Invalid session token detected in verifyCookie:", error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error("Token Verification Error:", err);
    return false;
  }
}

export async function login(formData: FormData) {
  const usernameRaw = formData.get("username"); // Using "username" field as email
  const passwordRaw = formData.get("password");

  const email = typeof usernameRaw === "string" ? usernameRaw : "";
  const password = typeof passwordRaw === "string" ? passwordRaw : "";

  // 🛡️ Sentinel: Always wait for 500ms to eliminate timing side-channels
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data) {
      console.error("Login Auth Error:", error);
      return { success: false, error: "שם משתמש או סיסמה שגויים" };
    }

    const accessToken = (data as any).accessToken || (data as any).session?.access_token;

    if (accessToken) {
      const cookieStore = await cookies();
      const signedValue = signCookie(accessToken);

      cookieStore.set("admin_session", signedValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
      return { success: true };
    }

    return { success: false, error: "שגיאה לא צפויה בתהליך ההתחברות" };
  } catch (err: any) {
    console.error("Login Error:", err);
    return { success: false, error: "אירעה שגיאה בחיבור לשרת" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  await insforge.auth.signOut();
}
