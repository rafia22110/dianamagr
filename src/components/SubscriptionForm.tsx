"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge";

export default function SubscriptionForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await insforge.database.from("subscribers").insert({
        email,
        created_at: new Date().toISOString(),
      });

      if (!error) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-primary-light font-bold">
        תודה! נרשמת בהצלחה לניוזלטר.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        placeholder="האימייל שלך"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg focus:bg-white/20 outline-none text-white placeholder:text-white/50"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-primary-light hover:bg-white hover:text-primary px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
      >
        {loading ? "..." : "הרשמה"}
      </button>
    </form>
  );
}
