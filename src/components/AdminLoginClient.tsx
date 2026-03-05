"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function AdminLoginClient() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result.success) {
      setError("");
      router.refresh(); // Refresh the page so the Server Component picks up the new cookie
    } else if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary mb-6 font-serif">
          התחברות למערכת הניהול
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="username">
              שם משתמש
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50"
              placeholder="הכנס שם משתמש"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50"
              placeholder="הכנס סיסמה"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-colors shadow-lg mt-4"
          >
            התחבר
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/" className="text-gray-500 hover:text-primary transition-colors text-sm">
            &larr; חזרה לאתר
          </a>
        </div>
      </div>
    </div>
  );
}
