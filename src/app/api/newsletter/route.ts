import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { error } = await insforge.database.from("subscribers").insert([
      {
        name,
        email,
        phone,
        subscribed_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      // Handle duplicate submission
      if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        return NextResponse.json({ success: true, message: "כבר רשומים! תודה 😊" });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: "נרשמתם בהצלחה! נשלח לכם עדכונים חמים 🎉" });
  } catch (err: any) {
    console.error('Newsletter Signup Error:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
