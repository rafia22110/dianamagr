"use server";

import { insforge } from "@/lib/insforge";

export async function submitContact(formData: FormData) {
  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const message = formData.get("message")?.toString() || "";

  if (!name || !email) return { success: false, error: "שם ואימייל הם שדות חובה" };

  // 🛡️ Sentinel: Email format and length validation to prevent abuse.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: "כתובת אימייל לא תקינה" };
  if (name.length > 100 || email.length > 100 || phone.length > 20 || message.length > 1000) {
    return { success: false, error: "קלט ארוך מדי" };
  }

  try {
    const { error } = await insforge.database.from("messages").insert({ name, email, phone, message });
    if (error) {
      console.error("InsForge Error:", error);
      return { success: false, error: "אירעה שגיאה בשליחת הטופס." };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Submit Error:", err);
    return { success: false, error: "שגיאת רשת. נסו שוב." };
  }
}
