"use client";

import React, { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { ImageRecord } from "@/types/image";
import { CATEGORIES, AVAILABLE_TAGS } from "@/types/image";
import ImageUploadForm from "./ImageUploadForm";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const BUCKET = "diana-images";

export default function AdminPanel() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchImages = async () => {
    try {
      const { data, error } = await insforge.database
        .from("images")
        .select("*")
        .order("upload_date", { ascending: false });
      if (!error && data) setImages(data as ImageRecord[]);
    } catch (e) {
      console.warn(e);
      setImages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);


  const handleDelete = async (id: string, storagePath?: string) => {
    try {
      if (storagePath) {
        await insforge.storage.from(BUCKET).remove(storagePath);
      }
      await insforge.database.from("images").delete().eq("id", id);
      setMessage({ type: "success", text: "התמונה נמחקה בהצלחה" });
      fetchImages();
    } catch (e) {
      setMessage({ type: "error", text: "שגיאה במחיקה" });
    }
  };

  const copyPath = (img: ImageRecord) => {
    const path = img.storage_path || img.filename;
    const url = `${baseUrl}/api/storage/buckets/${BUCKET}/objects/${encodeURIComponent(path)}`;
    navigator.clipboard.writeText(url);
    setMessage({ type: "success", text: "הנתיב הועתק ללוח" });
  };

  const router = useRouter();

  const onUploadSuccess = () => {
    setMessage({ type: "success", text: "התמונה הועלתה בהצלחה!" });
    fetchImages();
  };

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <header className="bg-gradient-to-r from-primary to-primary-light text-white p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ניהול תמונות - דיאנה רחמני</h1>
        <div className="flex gap-4">
          <a
            href="/"
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
          >
            צפייה באתר
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/80 rounded-lg hover:bg-red-500 text-white"
          >
            התנתק
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-primary mb-4">העלאת תמונה</h2>
          <ImageUploadForm onSuccess={onUploadSuccess} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-4">
            כל התמונות ({images.length})
          </h2>
          {loading ? (
            <p>טוען...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="bg-white rounded-xl shadow overflow-hidden"
                >
                  <div className="aspect-video bg-gray-200">
                    {(img.url || img.storage_path || img.filename) && (
                      <img
                        src={
                          img.url ||
                          `${baseUrl}/api/storage/buckets/${BUCKET}/objects/${encodeURIComponent(
                            img.storage_path || img.filename
                          )}`
                        }
                        alt={img.alt_text || ""}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{img.original_name}</p>
                    <p className="text-sm text-gray-500">{CATEGORIES[img.category] || img.category}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {img.storage_path || img.filename}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => copyPath(img)}
                        className="text-sm px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20"
                      >
                        העתק נתיב
                      </button>
                      <button
                        onClick={() => handleDelete(img.id, img.storage_path || undefined)}
                        className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
