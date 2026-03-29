import React from "react";
import Link from "next/link";
import SocialLogin from "@/components/SocialLogin";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-creme flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2 font-serif">כניסת מנויים</h1>
          <p className="text-gray-500 italic">ברוכים הבאים למשפחה של דיאנה רחמני</p>
          <div className="h-1 w-16 bg-primary-light mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-6">
           <p className="text-gray-600 text-center text-sm leading-relaxed">
             התחברי כדי לקבל גישה למתכונים בלעדיים, פודקאסטים ופרקים מהספר החדש.
           </p>

           <SocialLogin />
            <div className="relative flex items-center justify-center py-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">או</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <Link 
              href="/#newsletter" 
              className="w-full block text-center bg-gradient-to-r from-primary to-primary-light text-white py-5 rounded-xl font-bold text-xl hover:opacity-90 transition-all shadow-lg"
            >
              ✉️ הצטרפות עכשיו חינם
            </Link>

           <div className="text-center pt-4">
              <Link href="/" className="text-primary-light hover:underline font-bold text-sm">חזרה לאתר הראשי</Link>
           </div>
        </div>
      </div>
    </div>
  );
}
