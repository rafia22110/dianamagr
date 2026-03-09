import React from "react";

export default function LecturesSection() {
  return (
    <section id="lectures" className="py-24 px-6 bg-primary-dark text-white relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 font-serif">הזמנת הרצאות והופעות</h2>
          <p className="text-xl text-primary-light opacity-90">הפרדוקס של נשים איראניות - מאב כפוי לחופש נשי</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/5 p-12 rounded-3xl backdrop-blur-md border border-white/10">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary-light underline decoration-2 underline-offset-8 mb-6">פרטי התקשרות</h3>
            <p className="text-lg">מתאים למוסדות חינוך, ארגונים, אירועי נשים וקבוצות פרטיות.</p>
            <div className="flex items-center gap-4 text-xl">
              <span className="bg-primary-light p-3 rounded-full">📧</span>
              <a href="mailto:Diana4420122@gmail.com" className="hover:underline">Diana4420122@gmail.com</a>
            </div>
            <div className="flex items-center gap-4 text-xl">
              <span className="bg-primary-light p-3 rounded-full">📱</span>
              <span>ניתן להשאיר פרטים ונחזור אליכם</span>
            </div>
          </div>

          <form className="space-y-4">
            <input type="text" placeholder="שם מלא" className="w-full bg-white/10 border border-white/20 p-4 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50" />
            <input type="email" placeholder="אימייל" className="w-full bg-white/10 border border-white/20 p-4 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50" />
            <input type="tel" placeholder="טלפון" className="w-full bg-white/10 border border-white/20 p-4 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50" />
            <textarea placeholder="סוג האירוע והודעה" rows={4} className="w-full bg-white/10 border border-white/20 p-4 rounded-xl focus:bg-white/20 outline-none transition-all placeholder:text-white/50"></textarea>
            <button type="submit" className="w-full bg-primary-light hover:bg-white hover:text-primary py-4 rounded-xl font-bold text-xl transition-all shadow-2xl">
              שלחי בקשה להזמנה
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
