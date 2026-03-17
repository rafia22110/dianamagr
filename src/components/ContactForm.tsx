"use client";

import { useState } from "react";
import { submitContact } from "@/app/actions/contact";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);

    if (result.success) {
      setStatus({ type: "success", message: "הפנייה נשלחה בהצלחה! נחזור אלייך בהקדם." });
      (e.target as HTMLFormElement).reset(); // Clear form
    } else {
      setStatus({ type: "error", message: result.error || "אירעה שגיאה" });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status && (
        <div
          className={`p-4 rounded-xl text-center font-bold shadow-md transition-all ${
            status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {status.message}
        </div>
      )}
      <input
        type="text"
        name="name"
        required
        placeholder="שם מלא"
        className="w-full bg-white/10 border border-white/20 p-4 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50"
      />
      <input
        type="email"
        name="email"
        required
        placeholder="אימייל"
        className="w-full bg-white/10 border border-white/20 p-4 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50"
      />
      <input
        type="tel"
        name="phone"
        placeholder="טלפון"
        className="w-full bg-white/10 border border-white/20 p-4 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50"
      />
      <textarea
        name="message"
        placeholder="סוג האירוע והודעה"
        rows={4}
        className="w-full bg-white/10 border border-white/20 p-4 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50"
      ></textarea>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-light hover:bg-white hover:text-primary py-4 rounded-xl font-bold text-xl transition-all shadow-2xl disabled:opacity-50"
      >
        {loading ? "שולח..." : "שלחי בקשה להזמנה"}
      </button>
    </form>
  );
}
