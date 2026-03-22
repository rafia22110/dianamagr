import React, { useEffect, useState } from "react";
import { ImageRecord, CATEGORIES } from "@/types/image";
import { sanitizeUrl } from "@/lib/utils";
import { MsgHelper } from "@/types/admin";
import ImageUploadForm from "../ImageUploadForm";

const BUCKET = "diana-images";

interface ImageManagerProps {
  msg: MsgHelper;
}

export default function ImageManager({ msg }: ImageManagerProps) {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  const fetchImages = async () => {
    setImagesLoading(true);
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (e) {
      console.warn('Error fetching images:', e);
      setImages([]);
    }
    setImagesLoading(false);
  };

  const handleDeleteImage = async (id: string, storagePath?: string) => {
    try {
      const url = `/api/images?id=${encodeURIComponent(id)}${storagePath ? `&storagePath=${encodeURIComponent(storagePath)}` : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      msg("success", "התמונה נמחקה בהצלחה");
      fetchImages();
    } catch (e) {
      msg("error", "שגיאה במחיקה");
    }
  };

  const copyPath = (img: ImageRecord) => {
    const path = img.storage_path || img.filename;
    const url = `${window.location.origin}/api/insforge/storage/v1/object/public/${BUCKET}/${path}`;
    navigator.clipboard.writeText(url);
    msg("success", "הנתיב הועתק");
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <>
      <section className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold text-primary mb-4">העלאת תמונה חדשה</h2>
        <ImageUploadForm onSuccess={() => { msg("success", "התמונה הועלתה!"); fetchImages(); }} />
      </section>
      <section>
        <h2 className="text-xl font-bold text-primary mb-4">כל התמונות ({images.length})</h2>
        {imagesLoading ? <p>טוען...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map(img => (
              <div key={img.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  {(img.url || img.storage_path || img.filename) && (
                    <img
                      src={sanitizeUrl(img.storage_path ? `/api/insforge/storage/v1/object/public/${BUCKET}/${img.storage_path}` : img.url)}
                      alt={img.alt_text || ""} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium">{img.original_name}</p>
                  <p className="text-sm text-gray-500">{CATEGORIES[img.category] || img.category}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => copyPath(img)} className="text-sm px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20">העתק נתיב</button>
                    <button onClick={() => handleDeleteImage(img.id, img.storage_path || undefined)} className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">מחק</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
