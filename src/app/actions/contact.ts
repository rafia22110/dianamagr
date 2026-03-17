"use server";

import { insforge } from "@/lib/insforge";

export async function submitContact(formData: FormData) {
  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const message = formData.get("message")?.toString() || "";

  if (!name || !email) {
    return { success: false, error: "שם ואימייל הם שדות חובה" };
  }

  try {
    const { error } = await insforge.database.from("messages").insert({
      name,
      email,
      phone,
      message,
    });

    if (error) {
      console.error("InsForge Error:", error);
      return { success: false, error: "אירעה שגיאה בשליחת הטופס. נסו שוב מאוחר יותר." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Submit Error:", err);
    return { success: false, error: "שגיאת רשת. נסו שוב." };
  }
}
