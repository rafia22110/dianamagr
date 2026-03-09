"use client";

import React, { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { ImageRecord, CATEGORIES } from "@/types/image";
import ImageUploadForm from "../ImageUploadForm";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const BUCKET = "diana-images";

interface ImagesTabProps {
  msg: (type: "success" | "error", text: string) => void;
}

export default function ImagesTab({ msg }: ImagesTabProps) {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  const fetchImages = async () => {
    setImagesLoading(true);
    try {
      const { data } = await insforge.database.from("images").select("*").order("upload_date", { ascending: false });
      if (data) setImages(data as ImageRecord[]);
    } catch { setImages([]); }
    setImagesLoading(false);
  };

  const handleDeleteImage = async (id: string, storagePath?: string) => {
    try {
      if (storagePath) await insforge.storage.from(BUCKET).remove(storagePath);
      await insforge.database.from("images").delete().eq("id", id);
      msg("success", "התמונה נמחקה בהצלחה");
      fetchImages();
    } catch { msg("error", "שגיאה במחיקה"); }
  };

  const copyPath = (img: ImageRecord) => {
    const path = img.storage_path || img.filename;
    const url = `${baseUrl}/api/storage/buckets/${BUCKET}/objects/${encodeURIComponent(path)}`;
    navigator.clipboard.writeText(url);
    msg("success", "הנתיב הועתק ללוח");
  };

  useEffect(() => { fetchImages(); }, []);

  return (
    <>
      <section className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold text-primary mb-4">העלאת תמונה חדשה</h2>
        <ImageUploadForm onSuccess={() => { msg("success", "התמונה הועלתה בהצלחה!"); fetchImages(); }} />
      </section>
      <section>
        <h2 className="text-xl font-bold text-primary mb-4">כל התמונות ({images.length})</h2>
        {imagesLoading ? <p>טוען...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map(img => (
              <div key={img.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  {(img.url || img.storage_path || img.filename) && (
                    <img src={img.url || `${baseUrl}/api/storage/buckets/${BUCKET}/objects/${encodeURIComponent(img.storage_path || img.filename)}`}
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
