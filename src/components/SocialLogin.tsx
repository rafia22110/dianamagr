"use client";

import { insforge } from "@/lib/insforge";
import { useState } from "react";

export default function SocialLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error: signInError } = await insforge.auth.signInWithOAuth({
                provider: "google",
                redirectTo: `${window.location.origin}/auth/callback`,
            });
            if (signInError) throw signInError;
        } catch (error: any) {
            console.error("Google Login Error:", error);
            setError("אירעה שגיאה בכניסה עם Google. נסה שנית.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="relative flex items-center justify-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">או התחברי באמצעות</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {error && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                    {error}
                </p>
            )}

            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-primary text-gray-700 font-bold py-4 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                <span>{loading ? "מתחבר..." : "התחברות עם Google"}</span>
            </button>
        </div>
    );
}
