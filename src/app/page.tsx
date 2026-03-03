import { insforge } from "@/lib/insforge";
import { ImageRecord } from "@/types/image";
import { Workshop } from "@/types/schema";
import HomeContent from "@/components/HomeContent";

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  let heroImage: ImageRecord | null = null;
  let bookCover: ImageRecord | null = null;
  let galleryImages: ImageRecord[] = [];
  let workshops: Workshop[] = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
    const [heroRes, bookRes, galleryRes, workshopRes] = await Promise.all([
      insforge.database.from("images").select("*").eq("category", "hero").limit(1).maybeSingle(),
      insforge.database.from("images").select("*").eq("category", "book").limit(1).maybeSingle(),
      insforge.database.from("images").select("*").eq("category", "gallery").order("upload_date", { ascending: false }).limit(24),
      insforge.database.from("workshops").select("*").eq("status", "open").limit(6),
    ]);

    if (heroRes.data) heroImage = heroRes.data as ImageRecord;
    if (bookRes.data) bookCover = bookRes.data as ImageRecord;
    if (galleryRes.data) {
      galleryImages = (galleryRes.data as ImageRecord[]).map((img) => ({
        ...img,
        url: img.url || (img.storage_path ? `${baseUrl}/api/storage/buckets/diana-images/objects/${encodeURIComponent(img.storage_path)}` : undefined),
      }));
    }
    if (workshopRes.data) workshops = workshopRes.data as Workshop[];
  } catch (e) {
    console.warn("InsForge fetch error:", e);
  }

  return (
    <HomeContent
      initialHeroImage={heroImage}
      initialBookCover={bookCover}
      initialGalleryImages={galleryImages}
      initialWorkshops={workshops}
    />
  );
}
