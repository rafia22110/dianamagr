"use client";

import { useState } from "react";
import { ImageRecord } from "@/types/image";
import { Workshop } from "@/types/schema";
import GallerySection from "@/components/GallerySection";
import PodcastsSection from "@/components/PodcastsSection";
import RegistrationForm from "@/components/RegistrationForm";
import SubscriptionForm from "@/components/SubscriptionForm";
import CheckoutModal from "@/components/CheckoutModal";
import Link from "next/link";

interface HomeContentProps {
  initialHeroImage: ImageRecord | null;
  initialBookCover: ImageRecord | null;
  initialGalleryImages: ImageRecord[];
  initialWorkshops: Workshop[];
}

export default function HomeContent({
  initialHeroImage,
  initialBookCover,
  initialGalleryImages,
  initialWorkshops,
}: HomeContentProps) {
  const [workshops] = useState<Workshop[]>(initialWorkshops);
  const [checkoutItem, setCheckoutItem] = useState<{ id?: string, type: 'book' | 'workshop', title: string, price: number } | null>(null);

  const heroBg = initialHeroImage?.url || "https://img.mako.co.il/2016/11/13/dayana.png";

  return (
    <>
      <nav className="bg-primary/95 sticky top-0 z-[100] py-4 px-4 shadow-xl backdrop-blur-md">
        <ul className="flex flex-wrap justify-center gap-8 list-none text-lg">
          <li><Link href="#home" className="text-white font-bold hover:text-primary-light transition-colors">בית</Link></li>
          <li><Link href="#about" className="text-white font-bold hover:text-primary-light transition-colors">אודות</Link></li>
          <li><Link href="#workshops" className="text-white font-bold hover:text-primary-light transition-colors">סדנאות</Link></li>
          <li><Link href="#book" className="text-white font-bold hover:text-primary-light transition-colors">הספר</Link></li>
          <li><Link href="#podcasts" className="text-white font-bold hover:text-primary-light transition-colors">פודקאסטים</Link></li>
          <li><Link href="#gallery" className="text-white font-bold hover:text-primary-light transition-colors">גלריה</Link></li>
          <li><Link href="#lectures" className="text-white font-bold hover:text-primary-light transition-colors text-primary-light">הזמנת הרצאה</Link></li>
        </ul>
      </nav>

      <section id="home" className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url('${heroBg}')` }}
        >
          <div className="absolute inset-0 hero-gradient"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif drop-shadow-2xl">דיאנה רחמני</h1>
          <p className="text-2xl md:text-3xl mb-8 font-light tracking-wide drop-shadow-lg">מטבח פרסי, תקווה ובריחה מטהרן</p>
          <div className="bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl">
            <p className="text-xl leading-relaxed">
              כוכבת &quot;מאסטר שף&quot;, מחברת ספר &quot;הבריחה מטהרן&quot;, ומחברת סיפורי חיים, מטבח ואמונה.
              <br />
              <span className="text-primary-light font-bold mt-4 block">הצטרפו למסע של טעמים, הישרדות והשראה.</span>
            </p>
          </div>
          <div className="mt-10 flex gap-4 justify-center">
             <Link href="#lectures" className="bg-primary-light hover:bg-white hover:text-primary text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all transform hover:scale-105">
               הזמנת הרצאה
             </Link>
             <Link href="#workshops" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-10 rounded-full border border-white/30 backdrop-blur-md transition-all">
               סדנאות בישול
             </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#f9f7f4"></path>
          </svg>
        </div>
      </section>

      <section id="about" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl text-center text-primary mb-12 font-bold font-serif">
            מי אני – דיאנה רחמני
            <div className="h-1.5 w-24 bg-primary-light mx-auto mt-4 rounded-full"></div>
          </h2>
          <div className="bg-white p-12 rounded-3xl shadow-2xl text-xl leading-loose border border-gray-100">
            <p className="mb-8">
              <strong className="text-primary text-2xl">נולדתי בטהרן</strong>, בבית חולים יהודי, וגדלתי בשכונת מהלה, שם שררו יחסים טובים בין יהודים למוסלמים.
              בילדותי למדתי בבית הספר היהודי &quot;אליאנס אתהאד&quot;, ומאמא למדתי את האהבה למטבח הפרסי.
            </p>
            <div className="bg-primary/5 p-6 rounded-2xl mb-8 italic border-r-4 border-primary">
              &quot;המסע שהיה אמור להימשך יומיים נמשך כמעט חצי שנה. דרך הרים, גשרים וסיכונים אינסופיים – הגענו הביתה, לישראל.&quot;
            </div>
            <p>
              ב<strong className="text-primary">&quot;מאסטר שף&quot;</strong> הפכתי לכוכבת אהובה, אבל בלב עדיין נמצאת אשה שמאוהבת במטבח פרסי, בסיפורים ובאמונה.
              אני סבתא לתשעה נכדים, חולמת להעניק לעולם טעם עתיק, אמת, תקווה, והרבה מאוד אוכל.
            </p>
          </div>
        </div>
      </section>

      <section id="workshops" className="py-24 px-6 bg-[#fdfaf6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-primary font-bold mb-4">סדנאות בישול חדשות</h2>
            <p className="text-gray-600 text-lg">בואו ללמוד את סודות המטבח הפרסי המסורתי</p>
            <div className="h-1 w-20 bg-primary-light mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((w) => (
              <div key={w.id} className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-shadow">
                <div className="h-48 bg-gray-200">
                  <img src={w.image_url || "https://media.reshet.tv/image/upload/t_image_article_800/v1589115206/masterchef_diana_food_s2gqic.jpg"} alt={w.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-primary mb-2">{w.title}</h3>
                  <p className="text-gray-600 mb-4 flex-1">{w.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-primary">₪{w.price}</span>
                    <button
                      onClick={() => setCheckoutItem({ id: w.id, type: 'workshop', title: w.title, price: w.price })}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-bold transition-colors"
                    >
                      הירשמי עכשיו
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {workshops.length === 0 && (
            <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 text-xl font-bold">סדנאות חדשות יפורסמו בקרוב...</p>
              <div className="mt-8 max-w-md mx-auto">
                 <p className="mb-4 text-gray-700">השאירי פרטים ועדכן אותך כשיפתח מועד חדש:</p>
                 <SubscriptionForm />
              </div>
            </div>
          )}
        </div>
      </section>

      <PodcastsSection />

      <section id="book" className="py-24 px-6 bg-gradient-to-br from-[#f0e6d2] to-[#fff5e6]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl text-center text-primary mb-4 font-serif font-bold">הבריחה מטהרן</h2>
          <p className="text-center text-gray-600 mb-16 text-lg tracking-widest">סיפורה של בריחה, אמונה והישרדות</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary-light rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-2xl transform transition-transform duration-500 group-hover:-translate-y-2">
                <img
                  src={initialBookCover?.url || "https://www.netbook.co.il/Files/Store/Items/15415/original.jpg"}
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
              <div className="bg-white/50 p-4 rounded-xl border border-primary/10">
                <p className="text-2xl font-bold text-primary">₪89.00 בלבד</p>
                <p className="text-sm text-gray-600">+ משלוח חינם לכל הארץ</p>
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => setCheckoutItem({ type: 'book', title: 'הספר: הבריחה מטהרן', price: 89 })}
                  className="bg-primary text-white py-4 px-10 rounded-full font-bold shadow-lg hover:bg-primary-dark transition-colors inline-block"
                >
                  לרכישת הספר עכשיו
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="py-24 px-6 bg-white overflow-hidden">
        <GallerySection images={initialGalleryImages} />
      </section>

      <section id="lectures" className="py-24 px-6 bg-primary-dark text-white relative">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-4 font-serif">הזמנת הרצאות והופעות</h2>
                <p className="text-xl text-primary-light opacity-90">הפרדוקס של נשים איראניות - מאב כפוי לחופש נשי</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                    <h3 className="text-2xl font-bold text-primary-light underline decoration-2 underline-offset-8 mb-6">פרטי התקשרות</h3>
                    <p className="text-lg leading-relaxed">ההרצאה שלי היא מסע מרגש בין טעמים, היסטוריה וסיפור אישי עוצמתי. מתאים למוסדות חינוך, ארגונים, אירועי נשים וקבוצות פרטיות שרוצות לחוות רגע של אמת והשראה.</p>
                    <div className="flex items-center gap-4 text-xl">
                        <span className="bg-primary-light p-3 rounded-full">📧</span>
                        <a href="mailto:Diana4420122@gmail.com" className="hover:underline">Diana4420122@gmail.com</a>
                    </div>
                    <div className="mt-8 border-t border-white/10 pt-8">
                       <p className="text-primary-light font-bold mb-4">הרשמה לניוזלטר לקבלת עדכונים ומתכונים:</p>
                       <SubscriptionForm />
                    </div>
                </div>

                <RegistrationForm title="הזמנת הרצאה / פרטים נוספים" />
            </div>
        </div>
      </section>

      <footer className="bg-black text-white py-16 px-6 text-center border-t border-white/10">
        <p className="text-3xl font-bold mb-6 font-serif tracking-widest text-primary-light">דיאנה רחמני</p>
        <p className="max-w-2xl mx-auto opacity-70 text-lg">כוכבת מאסטר שף | מחברת &quot;הבריחה מטהרן&quot; | מובילת המטבח הפרסי בישראל</p>
        <div className="flex justify-center gap-6 mt-10">
            <a href="#" className="hover:text-primary-light transition-colors">FaceBook</a>
            <a href="#" className="hover:text-primary-light transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary-light transition-colors">TikTok</a>
        </div>
        <p className="mt-12 opacity-40">© 2026 דיאנה רחמני. כל הזכויות שמורות.</p>
      </footer>

      <CheckoutModal
        isOpen={!!checkoutItem}
        onClose={() => setCheckoutItem(null)}
        item={checkoutItem}
      />
    </>
  );
}
