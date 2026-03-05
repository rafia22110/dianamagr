"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge";

export default function SubscriptionForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await insforge.database.from("subscriptions").insert({ email });
      if (error) {
        setMessage({ type: "error", text: "אירעה שגיאה. ייתכן שכבר נרשמת?" });
      } else {
        setMessage({ type: "success", text: "תודה! נרשמת בהצלחה לניוזלטר" });
        setEmail("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "שגיאה בחיבור למערכת" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
      <h3 className="text-2xl font-bold mb-4 text-primary-light">הצטרפו לניוזלטר שלי</h3>
      <p className="text-sm text-gray-300 mb-6">קבלו עדכונים על סדנאות, הרצאות ומתכונים חדשים ישר לאימייל</p>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-100/20 text-green-300" : "bg-red-100/20 text-red-300"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="כתובת אימייל"
          required
          className="flex-1 bg-white/10 border border-white/20 p-3 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/30 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-light hover:bg-white hover:text-primary text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? "שולח..." : "הירשם"}
        </button>
      </form>
    </div>
  );
}
