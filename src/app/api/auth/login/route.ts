import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.ADMIN_USERNAME || "diana";
    const expectedPassword = process.env.ADMIN_PASSWORD || "diana2024";

    if (username === expectedUsername && password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      const cookieStore = await cookies();

      // Simple signed token approach for demonstration
      const secret = process.env.ADMIN_SECRET || "default_unsafe_secret";
      const tokenPayload = "authenticated";
      const signature = crypto.createHmac('sha256', secret).update(tokenPayload).digest('hex');
      const token = `${tokenPayload}.${signature}`;

      cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return response;
    }

    return NextResponse.json(
      { success: false, message: "שם משתמש או סיסמה שגויים" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "שגיאה בשרת" },
      { status: 500 }
    );
  }
}
