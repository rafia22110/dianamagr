"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";

interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  type: string;
}

export default function WorkshopsSection() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchWorkshops() {
      try {
        const { data, error } = await insforge.database
          .from("workshops")
          .select("*")
          .order("date", { ascending: true });
        if (data) setWorkshops(data as Workshop[]);
      } catch (e) {
        console.error("Error fetching workshops:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkshops();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshop) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await insforge.database.from("registrations").insert({
        workshop_id: selectedWorkshop.id,
        ...formState
      });

      if (error) {
        setMessage({ type: "error", text: "אירעה שגיאה בהרשמה" });
      } else {
        setMessage({ type: "success", text: "נרשמת בהצלחה! נחזור אלייך בקרוב." });
        setTimeout(() => setSelectedWorkshop(null), 2000);
      }
    } catch (err) {
      setMessage({ type: "error", text: "שגיאה בחיבור למערכת" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <section id="workshops" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl text-center text-primary mb-12 font-bold font-serif">
          סדנאות והרצאות קרובות
          <div className="h-1.5 w-24 bg-primary-light mx-auto mt-4 rounded-full"></div>
        </h2>

        {workshops.length === 0 ? (
          <p className="text-center text-gray-500 text-xl">כרגע אין סדנאות מתוכננות, חזרו בקרוב!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((ws) => (
              <div key={ws.id} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all">
                <div className="mb-4 inline-block bg-primary-light/20 text-primary-light px-4 py-1 rounded-full text-sm font-bold">
                  {ws.type === 'online' ? 'אונליין' : 'פרונטלי'}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">{ws.title}</h3>
                <p className="text-gray-600 mb-6 line-clamp-3">{ws.description}</p>
                <div className="space-y-3 mb-8 text-sm text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>📅</span>
                    <span>{new Date(ws.date).toLocaleString("he-IL", { dateStyle: "long", timeStyle: "short" })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>📍</span>
                    <span>{ws.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-lg font-bold text-primary">
                    <span>💰</span>
                    <span>{ws.price} ₪</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWorkshop(ws)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors shadow-md"
                >
                  להרשמה עכשיו
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedWorkshop && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setSelectedWorkshop(null)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-primary mb-2">הרשמה ל{selectedWorkshop.title}</h3>
            <p className="text-gray-500 mb-6">השאירו פרטים ונחזור אליכם להשלמת ההרשמה</p>

            {message && (
              <div className={`p-4 mb-6 rounded-xl text-sm font-bold ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="שם מלא"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <input
                type="email"
                placeholder="אימייל"
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <input
                type="tel"
                placeholder="טלפון"
                required
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-light hover:bg-primary text-white font-bold py-4 rounded-xl shadow-xl transition-all disabled:opacity-50"
              >
                {submitting ? "שולח בקשה..." : "שלח בקשת הרשמה"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
