"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/subscriber-auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await requestPasswordReset(email);
    setMessage(result.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-serif">
            שחזור סיסמה
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            הכניסי את כתובת האימייל שלך ונשלח לך הוראות לשחזור הסיסמה
          </p>
        </div>
        {message ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg">
              {message}
            </div>
            <Link href="/login" title="חזרה להתחברות" className="text-primary font-bold block">
              חזרה להתחברות
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">אימייל</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? "שולח..." : "שלח הוראות שחזור"}
              </button>
            </div>
          </form>
        )}
        <div className="text-center">
          <Link href="/login" title="חזרה להתחברות" className="text-sm text-gray-500 hover:text-primary">
            &larr; חזרה להתחברות
          </Link>
        </div>
      </div>
    </div>
  );
}
