"use client";

import { insforge } from "@/lib/insforge";
import { useState } from "react";

export default function SocialLogin() {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await insforge.auth.signInWithOAuth({
                provider: "google",
                redirectTo: `${window.location.origin}/auth/callback`,
            });
        } catch (error) {
            console.error("Google Login Error:", error);
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

            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-primary text-gray-700 font-bold py-4 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                <span>התחברות עם Google</span>
            </button>
        </div>
    );
}
