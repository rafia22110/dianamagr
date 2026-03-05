"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });
      if (error) {
        setError("שגיאה בהתחברות: " + (error.message || "פרטים לא נכונים"));
      } else if (data) {
        // data contains user and accessToken on success
        router.push("/admin");
      }
    } catch (err) {
      setError("אירעה שגיאה בלתי צפויה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">כניסת מנהל</h1>
          <p className="text-gray-500 mt-2">דיאנה רחמני - ניהול אתר</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              אימייל
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? "מתחבר..." : "התחבר"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/" className="text-primary hover:underline text-sm">
            חזרה לאתר
          </a>
        </div>
      </div>
    </div>
  );
}
