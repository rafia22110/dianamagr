"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge";

interface Props {
  workshopId?: string;
  lectureId?: string;
  title: string;
  onSuccess?: () => void;
}

export default function RegistrationForm({ workshopId, lectureId, title, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await insforge.database.from("registrations").insert({
        workshop_id: workshopId || null,
        lecture_id: lectureId || null,
        full_name: fullName,
        email,
        phone,
        message,
        created_at: new Date().toISOString(),
      });

      if (!error) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-200">
        <h3 className="text-2xl font-bold text-green-800 mb-2">תודה רבה!</h3>
        <p className="text-green-700">פנייתך התקבלה בהצלחה. נחזור אלייך בהקדם.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-primary-light mb-4">הרשמה ל: {title}</h3>
      <input
        type="text"
        placeholder="שם מלא"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50 text-white"
        required
      />
      <input
        type="email"
        placeholder="אימייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50 text-white"
        required
      />
      <input
        type="tel"
        placeholder="טלפון"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50 text-white"
        required
      />
      <textarea
        placeholder="הודעה נוספת (אופציונלי)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50 text-white"
      ></textarea>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-light hover:bg-white hover:text-primary py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 text-white"
      >
        {loading ? "שולח..." : "שלחי בקשה"}
      </button>
    </form>
  );
}
