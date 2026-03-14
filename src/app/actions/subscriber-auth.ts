"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import { insforge } from "@/lib/insforge";

const SESSION_SECRET = process.env.SESSION_SECRET;

function checkConfig() {
  if (!SESSION_SECRET) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing SESSION_SECRET in production.");
    } else {
      // Use a stable dev secret
      return "subscriber_secret_key_654321_dev";
    }
  }
  return SESSION_SECRET;
}

function signCookie(value: string) {
  const secret = checkConfig();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(value);
  return `${value}.${hmac.digest("hex")}`;
}

export async function verifySubscriberCookie(cookieValue: string | undefined): Promise<string | null> {
  if (!cookieValue) return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [value, signature] = parts;
  const secret = checkConfig();
  const expectedSignature = crypto.createHmac("sha256", secret).update(value).digest("hex");

  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  return value; // value is the subscriber id
}

export async function subscriberLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { success: false, error: "אימייל וסיסמה חובה" };

  // In a real app, we'd hash the password and compare with stored hash.
  // For this demo/site, we'll assume a 'password' column exists in 'subscribers' table.
  const { data: subscriber, error } = await insforge.database
    .from("subscribers")
    .select("id, password_hash")
    .eq("email", email)
    .single();

  if (error || !subscriber) {
    // Artificial delay to prevent timing attacks
    await new Promise(r => setTimeout(r, 1000));
    return { success: false, error: "אימייל או סיסמה שגויים" };
  }

  const secret = checkConfig();
  const inputHash = crypto.createHmac("sha256", secret).update(password).digest("hex");
  if (inputHash !== subscriber.password_hash) {
    await new Promise(r => setTimeout(r, 1000));
    return { success: false, error: "אימייל או סיסמה שגויים" };
  }

  const signedValue = signCookie(subscriber.id);
  const cookieStore = await cookies();
  cookieStore.set("subscriber_session", signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
}

export async function subscriberLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("subscriber_session");
}

export async function requestPasswordReset(email: string) {
  const { data: subscriber, error } = await insforge.database
    .from("subscribers")
    .select("id")
    .eq("email", email)
    .single();

  if (error || !subscriber) {
    // Return success anyway to prevent email enumeration
    return { success: true, message: "הוראות לשחזור סיסמה נשלחו לאימייל שלך (אם הוא קיים במערכת)" };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

  await insforge.database
    .from("subscribers")
    .update({
      reset_token: token,
      reset_token_expiry: expiry,
    })
    .eq("id", subscriber.id);

  // In a real app, send email here.
  console.log(`Password reset token for ${email}: ${token}`);

  return { success: true, message: "הוראות לשחזור סיסמה נשלחו לאימייל שלך (אם הוא קיים במערכת)" };
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password) return { success: false, error: "מידע חסר" };

  const { data: subscriber, error } = await insforge.database
    .from("subscribers")
    .select("id, reset_token_expiry")
    .eq("reset_token", token)
    .single();

  if (error || !subscriber) {
    return { success: false, error: "קוד שחזור לא בתוקף" };
  }

  if (new Date(subscriber.reset_token_expiry) < new Date()) {
    return { success: false, error: "קוד שחזור פג תוקף" };
  }

  const secret = checkConfig();
  const passwordHash = crypto.createHmac("sha256", secret).update(password).digest("hex");

  await insforge.database
    .from("subscribers")
    .update({
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expiry: null,
    })
    .eq("id", subscriber.id);

  return { success: true };
}

export async function socialLoginAction(provider: 'google' | 'facebook') {
  // Mock social login
  // In real application, this would redirect to InsForge/Supabase auth
  console.log(`Social login initiated with ${provider}`);
  return { success: false, error: "התחברות חברתית אינה זמינה כרגע" };
}
