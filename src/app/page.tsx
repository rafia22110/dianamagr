import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { ImageRecord } from "@/types/image";
import GallerySection from "@/components/GallerySection";
import PodcastsSection from "@/components/PodcastsSection";
import NewsletterSection from "@/components/NewsletterSection";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import BookSection from "@/components/BookSection";
import LecturesSection from "@/components/LecturesSection";

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
          <li><Link href="#podcasts" className="text-white font-bold hover:text-primary-light transition-colors">פודקאסטים</Link></li>
          <li><Link href="#gallery" className="text-white font-bold hover:text-primary-light transition-colors">גלריה</Link></li>
          <li><Link href="#newsletter" className="text-white font-bold hover:text-primary-light transition-colors">הצטרפו</Link></li>
          <li><Link href="#lectures" className="text-white font-bold hover:text-primary-light transition-colors text-primary-light">הזמנת הרצאה</Link></li>
        </ul>
      </nav>

      <HeroSection heroBg={heroBg} />

      <AboutSection />

      <PodcastsSection />

      <BookSection bookCoverUrl={bookCover?.url} />

      <section id="gallery" className="py-24 px-6 bg-white overflow-hidden">
        <GallerySection images={galleryImages} />
      </section>

      <LecturesSection />

      <NewsletterSection />

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
    </>
  );
}
