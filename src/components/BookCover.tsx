import { ImageRecord } from "@/types/image";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";

export default function BookCover({ image }: { image: ImageRecord | null }) {
  if (image?.url || image?.storage_path) {
    const src = image.url || `${baseUrl}/api/storage/buckets/diana-images/objects/${encodeURIComponent(image.storage_path || image.filename)}`;
    return (
      <img
        src={src}
        alt={image.alt_text || "כריכת הספר הבריחה מטהרן"}
        className="w-full rounded-xl object-cover aspect-[2/3]"
      />
    );
  }
  return (
    <div className="bg-primary text-white py-36 px-8 rounded-xl text-xl font-bold">
      כריכת הספר
    </div>
  );
}
