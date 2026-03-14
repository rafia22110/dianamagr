"use client";

import { useState } from "react";
import { resetPasswordAction } from "@/app/actions/subscriber-auth";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
        setError("קוד שחזור חסר");
        return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.append("token", token);

    const result = await resetPasswordAction(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } else {
      setError(result.error || "שגיאה באיפוס סיסמה");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-50 text-green-700 p-4 rounded-lg">
          הסיסמה אופסה בהצלחה! את מועברת לדף ההתחברות...
        </div>
        <Link href="/login" className="text-primary font-bold">
          מעבר להתחברות
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
      <div className="rounded-md shadow-sm">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">סיסמה חדשה</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="********"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading ? "מעדכן..." : "עדכן סיסמה"}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-serif">
            איפוס סיסמה
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            בחרי סיסמה חדשה לחשבונך
          </p>
        </div>
        <Suspense fallback={<p className="text-center">טוען...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
