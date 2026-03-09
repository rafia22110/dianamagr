import React from "react";

interface BookSectionProps {
  bookCoverUrl?: string;
}

export default function BookSection({ bookCoverUrl }: BookSectionProps) {
  return (
    <section id="book" className="py-24 px-6 bg-gradient-to-br from-[#f0e6d2] to-[#fff5e6]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl text-center text-primary mb-4 font-serif font-bold">הבריחה מטהרן</h2>
        <p className="text-center text-gray-600 mb-16 text-lg tracking-widest">סיפורה של בריחה, אמונה והישרדות</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary-light rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl"></div>
            <div className="relative bg-white p-4 rounded-2xl shadow-2xl transform transition-transform duration-500 group-hover:-translate-y-2">
              <img
                src={bookCoverUrl || "https://www.netbook.co.il/Files/Store/Items/15415/original.jpg"}
                alt="הבריחה מטהרן"
                className="w-full h-auto rounded-lg shadow-inner"
              />
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl text-primary font-bold">סיפור המסע המסוכן שלי</h3>
            <p className="text-xl leading-relaxed text-gray-800">
              &quot;הבריחה מטהרן&quot; מתאר את המסע המסוכן של משפחתי מטהרן לישראל, דרך הרים, סיכונים והתחלה חדשה בארץ.
            </p>
            <p className="text-xl leading-relaxed text-gray-800">
              שבוע אחרי שהתחתנתי בגיל 20, שליח מהסוכנות היהודית דפק בדלת. המסע שהיה אמור להימשך יומיים נמשך כמעט חצי שנה.
            </p>
            <div className="pt-8">
              <a href="https://hasharon-post.co.il/" target="_blank" className="bg-primary text-white py-4 px-8 rounded-full font-bold shadow-lg hover:bg-primary-dark transition-colors inline-block">
                לרכישת הספר עכשיו
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
