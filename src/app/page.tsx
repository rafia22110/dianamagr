import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { ImageRecord } from "@/types/image";
import GallerySection from "@/components/GallerySection";
import PodcastsSection from "@/components/PodcastsSection";
import SubscriptionForm from "@/components/SubscriptionForm";
import WorkshopsSection from "@/components/WorkshopsSection";
import BookPurchaseFlow from "@/components/BookPurchaseFlow";

export default async function HomePage() {
  let heroImage: ImageRecord | null = null;
  let bookCover: ImageRecord | null = null;
  let galleryImages: ImageRecord[] = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
    const [heroRes, bookRes, galleryRes] = await Promise.all([
      insforge.database.from("images").select("*").eq("category", "hero").limit(1).maybeSingle(),
      insforge.database.from("images").select("*").eq("category", "book").limit(1).maybeSingle(),
      insforge.database.from("images").select("*").eq("category", "gallery").order("upload_date", { ascending: false }).limit(24),
    ]);

    if (heroRes.data) heroImage = heroRes.data as ImageRecord;
    if (bookRes.data) bookCover = bookRes.data as ImageRecord;
    if (galleryRes.data) galleryImages = (galleryRes.data as ImageRecord[]).map((img) => ({
      ...img,
      url: img.url || (img.storage_path ? `${baseUrl}/api/storage/buckets/diana-images/objects/${encodeURIComponent(img.storage_path)}` : undefined),
    }));
  } catch (e) {
    console.warn("InsForge fetch warning:", e);
  }

  const heroBg = heroImage?.url || "https://img.mako.co.il/2016/11/13/dayana.png";

  return (
    <>
      <nav className="bg-primary/95 sticky top-0 z-[100] py-4 px-4 shadow-xl backdrop-blur-md">
        <ul className="flex flex-wrap justify-center gap-8 list-none text-lg">
          <li><Link href="#home" className="text-white font-bold hover:text-primary-light transition-colors">בית</Link></li>
          <li><Link href="#about" className="text-white font-bold hover:text-primary-light transition-colors">אודות</Link></li>
          <li><Link href="#book" className="text-white font-bold hover:text-primary-light transition-colors">הספר</Link></li>
          <li><Link href="#workshops" className="text-white font-bold hover:text-primary-light transition-colors">סדנאות</Link></li>
          <li><Link href="#podcasts" className="text-white font-bold hover:text-primary-light transition-colors">פודקאסטים</Link></li>
          <li><Link href="#gallery" className="text-white font-bold hover:text-primary-light transition-colors">גלריה</Link></li>
          <li><Link href="#lectures" className="text-white font-bold hover:text-primary-light transition-colors text-primary-light">הזמנת הרצאה</Link></li>
        </ul>
      </nav>

      <section id="home" className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
        {/* Hero Background with Overlay */}
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
             <Link href="#book" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-10 rounded-full border border-white/30 backdrop-blur-md transition-all">
               על הספר
             </Link>
          </div>
        </div>

        {/* Wave SVG Decoration */}
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

      <WorkshopsSection />

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
                  src={bookCover?.url || "https://www.netbook.co.il/Files/Store/Items/15415/original.jpg"} 
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
              <div className="pt-8 space-y-4">
                <BookPurchaseFlow />
                <p className="text-sm text-gray-500 italic block">או רכשו דרך החנויות המורשות:</p>
                <a href="https://hasharon-post.co.il/" target="_blank" className="text-primary hover:underline font-bold inline-block">
                  לרכישת הספר ב-Hasharon Post ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="py-24 px-6 bg-white overflow-hidden">
        <GallerySection images={galleryImages} />
      </section>

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

      <footer className="bg-black text-white py-24 px-6 text-center border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16">
           <div className="text-right">
              <p className="text-4xl font-bold mb-6 font-serif tracking-widest text-primary-light">דיאנה רחמני</p>
              <p className="max-w-md opacity-70 text-lg leading-relaxed">כוכבת מאסטר שף | מחברת &quot;הבריחה מטהרן&quot; | מובילת המטבח הפרסי בישראל. הצטרפו אלי למסע של טעמים והשראה.</p>
              <div className="flex justify-start gap-6 mt-10">
                  <a href="#" className="hover:text-primary-light transition-colors">FaceBook</a>
                  <a href="#" className="hover:text-primary-light transition-colors">Instagram</a>
                  <a href="#" className="hover:text-primary-light transition-colors">TikTok</a>
              </div>
           </div>
           <div>
              <SubscriptionForm />
           </div>
        </div>
        <div className="pt-16 border-t border-white/5 opacity-40 text-sm">
            © 2026 דיאנה רחמני. כל הזכויות שמורות.
        </div>
      </footer>
    </>
  );
}
