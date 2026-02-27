import { ImageRecord } from "@/types/image";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";

export default function HeroImage({ image }: { image: ImageRecord | null }) {
  if (!image?.url && !image?.storage_path) return null;
  const src = image.url || `${baseUrl}/api/storage/buckets/diana-images/objects/${encodeURIComponent(image.storage_path || image.filename)}`;
  return (
    <div className="mb-6 rounded-xl overflow-hidden max-w-2xl mx-auto">
      <img
        src={src}
        alt={image.alt_text || "דיאנה רחמני"}
        className="w-full h-48 md:h-64 object-cover"
      />
    </div>
  );
}
