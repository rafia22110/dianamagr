"use client";

import { useState } from "react";

export default function BookPurchaseFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState({ name: "", email: "", address: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formState.name,
          customerEmail: formState.email,
          itemName: "ספר הבריחה מטהרן",
          amount: 89,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: "ההזמנה בוצעה בהצלחה! אישור נשלח לאימייל." });
        setStep(3);
      } else {
        setMessage({ type: "error", text: "שגיאה בביצוע התשלום. נסו שוב." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "שגיאה בתקשורת עם שרת התשלומים" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary text-white py-4 px-10 rounded-full font-bold shadow-lg hover:bg-primary-dark transition-all transform hover:scale-105 inline-block"
      >
        לרכישת הספר ישירות (89 ₪)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => {
                setIsOpen(false);
                setStep(1);
                setMessage(null);
              }}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>

            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary">פרטי משלוח</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="שם מלא"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="אימייל"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="כתובת"
                    value={formState.address}
                    onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="עיר"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formState.name || !formState.email || !formState.address}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                >
                  המשך לתשלום מאובטח
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary">תשלום מאובטח</h3>
                <div className="bg-gray-100 p-6 rounded-2xl border-2 border-dashed border-gray-300">
                  <p className="text-center text-gray-600 mb-4">סיכום הזמנה: ספר הבריחה מטהרן</p>
                  <p className="text-center text-2xl font-bold text-primary">סך הכל: 89 ₪</p>
                </div>

                {message && (
                  <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm font-bold">
                    {message.text}
                  </div>
                )}

                <form onSubmit={handlePurchase} className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between">
                    <span className="text-gray-400">💳 מספרי כרטיס (דמה לצרכי בדיקה)</span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? "מעבד תשלום..." : "שלם עכשיו"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-gray-500 hover:text-primary transition-colors text-sm"
                  >
                    חזור לפרטי משלוח
                  </button>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-8 space-y-6">
                <div className="text-6xl text-green-500">✓</div>
                <h3 className="text-3xl font-bold text-primary">תודה רבה!</h3>
                <p className="text-xl text-gray-600">ההזמנה שלך התקבלה בהצלחה ותישלח אלייך בימים הקרובים.</p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setStep(1);
                  }}
                  className="bg-primary text-white py-3 px-8 rounded-xl font-bold"
                >
                  סגור
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
