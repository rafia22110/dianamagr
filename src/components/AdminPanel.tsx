"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { ImageRecord } from "@/types/image";
import { CATEGORIES } from "@/types/image";
import ImageUploadForm from "./ImageUploadForm";
import WorkshopManager from "./WorkshopManager";
import LectureManager from "./LectureManager";
import LeadsManager from "./LeadsManager";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const BUCKET = "diana-images";

type Tab = 'images' | 'workshops' | 'lectures' | 'leads';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('images');
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
    if (activeTab === 'images') {
      fetchImages();
    }
  }, [activeTab]);


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

  const onUploadSuccess = () => {
    setMessage({ type: "success", text: "התמונה הועלתה בהצלחה!" });
    fetchImages();
  };

  const logout = async () => {
    await insforge.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <header className="bg-gradient-to-r from-primary to-primary-light text-white p-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">ניהול אתר - דיאנה רחמני</h1>
        <div className="flex gap-4">
          <a
            href="/"
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            צפייה באתר
          </a>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            התנתקות
          </button>
        </div>
      </header>

      <nav className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex">
          {(['images', 'workshops', 'lectures', 'leads'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-lg font-medium transition-all border-b-2 ${
                activeTab === tab
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-gray-500 hover:text-primary hover:bg-gray-50"
              }`}
            >
              {tab === 'images' && 'תמונות'}
              {tab === 'workshops' && 'סדנאות'}
              {tab === 'lectures' && 'הרצאות'}
              {tab === 'leads' && 'לידים והרשמות'}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
        {message && (
          <div
            className={`p-4 rounded-lg shadow-md ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {activeTab === 'images' && (
          <>
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
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
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
                        <p className="font-medium truncate">{img.original_name}</p>
                        <p className="text-sm text-gray-500">{CATEGORIES[img.category] || img.category}</p>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => copyPath(img)}
                            className="flex-1 text-sm px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                          >
                            העתק נתיב
                          </button>
                          <button
                            onClick={() => handleDelete(img.id, img.storage_path || undefined)}
                            className="flex-1 text-sm px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
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
          </>
        )}

        {activeTab === 'workshops' && <WorkshopManager />}
        {activeTab === 'lectures' && <LectureManager />}
        {activeTab === 'leads' && <LeadsManager />}
      </main>
    </div>
  );
}
