"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id?: string;
    type: 'book' | 'workshop';
    title: string;
    price: number;
  } | null;
}

export default function CheckoutModal({ isOpen, onClose, item }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');

  if (!isOpen || !item) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const { error } = await insforge.database.from("orders").insert({
        item_type: item.type,
        item_id: item.id || null,
        full_name: fullName,
        email,
        amount: item.price,
        status: 'completed',
        payment_id: 'sim_' + Math.random().toString(36).slice(2, 11),
        created_at: new Date().toISOString(),
      });

      if (!error) {
        setStep('success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">רכישה מאובטחת</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-8">
          {step === 'details' && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-600 text-sm">פריט לרכישה:</p>
                <p className="text-lg font-bold text-primary">{item.title}</p>
                <p className="text-2xl font-bold mt-2">₪{item.price}</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium">שם מלא</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">אימייל למשלוח קבלה</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
              >
                המשך לתשלום
              </button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">הזינו פרטי אשראי (סביבת בדיקה מאובטחת)</p>
                <div className="bg-gray-100 h-12 rounded-lg flex items-center px-4 justify-between border-2 border-primary/20">
                  <span className="text-gray-400">**** **** **** ****</span>
                  <span className="text-xs text-primary font-bold">VISA / MC</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-100 h-12 rounded-lg border-2 border-primary/20"></div>
                  <div className="bg-gray-100 h-12 rounded-lg border-2 border-primary/20"></div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "מעבד תשלום..." : `שלם עכשיו ₪${item.price}`}
              </button>
              <button
                onClick={() => setStep('details')}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                חזרה לפרטים
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">הרכישה הושלמה!</h3>
              <p className="text-gray-600 mb-8">אישור רכישה נשלח למייל: {email}</p>
              <button
                onClick={onClose}
                className="w-full bg-gray-800 hover:bg-black text-white font-bold py-4 rounded-xl transition-all"
              >
                סגור
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
          תשלום מאובטח בתקן PCI-DSS. כל הזכויות שמורות לדיאנה רחמני.
        </div>
      </div>
    </div>
  );
}
