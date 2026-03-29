"use client";

import { useState } from "react";
import SocialLogin from "./SocialLogin";

export default function NewsletterSection() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus("loading");

        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, phone }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message || "נרשמתם בהצלחה! נשלח לכם עדכונים חמים 🎉");
                setName("");
                setEmail("");
                setPhone("");
            } else {
                throw new Error(data.error || "אירעה שגיאה. נסו שוב בעוד רגע.");
            }
        } catch (e: any) {
            console.error(e);
            setStatus("error");
            setMessage(e.message || "אירעה שגיאה. נסו שוב בעוד רגע.");
        }
    };

    return (
        <section id="newsletter" className="py-24 px-6 bg-gradient-to-br from-[#f9f7f4] to-[#f0e6d2]">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl font-bold font-serif text-primary mb-4">
                    הצטרפו למשפחה שלי
                </h2>
                <div className="h-1.5 w-24 bg-primary-light mx-auto mb-6 rounded-full" />
                <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                    קבלו מתכונים פרסיים, סיפורים, עדכוני פודקאסטים ותאריכי הרצאות — ישירות לתיבת הדואר שלכם
                </p>

                {status === "success" ? (
                    <div className="bg-green-50 border border-green-200 rounded-3xl p-12 shadow-xl">
                        <div className="text-6xl mb-4">✨</div>
                        <p className="text-2xl font-bold text-green-700">{message}</p>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 space-y-5"
                    >
                        <SocialLogin />

                        <div className="relative flex items-center justify-center py-4">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">או</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="text-start">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">שם מלא</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="דיאנה רחמני"
                                    className="w-full border-2 border-gray-200 focus:border-primary rounded-xl p-4 outline-none transition-all text-lg"
                                />
                            </div>
                            <div className="text-start">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">טלפון (לא חובה)</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="050-0000000"
                                    className="w-full border-2 border-gray-200 focus:border-primary rounded-xl p-4 outline-none transition-all text-lg"
                                />
                            </div>
                        </div>
                        <div className="text-start">
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                כתובת אימייל <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="w-full border-2 border-gray-200 focus:border-primary rounded-xl p-4 outline-none transition-all text-lg"
                            />
                        </div>

                        {status === "error" && (
                            <p className="text-red-500 text-sm">{message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-5 rounded-xl font-bold text-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                        >
                            {status === "loading" ? "⏳ רושמים אותך..." : "✉️ הצטרפות עכשיו חינם"}
                        </button>

                        <p className="text-sm text-gray-400">
                            לא נשלח ספאם. אפשר להסיר בכל עת.
                        </p>
                    </form>
                )}
            </div>
        </section>
    );
}
