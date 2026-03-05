import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: Request) {
  try {
    const { customerName, customerEmail, itemName, amount } = await req.json();

    // 1. Simulate payment processing (delay)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 2. Record the order in the database
    const { error } = await insforge.database.from("orders").insert({
      customer_name: customerName,
      customer_email: customerEmail,
      item_name: itemName,
      amount: amount,
      status: "completed",
    });

    if (error) {
      console.error("Database error recording order:", error);
      return NextResponse.json({ success: false, error: "Failed to record order" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
