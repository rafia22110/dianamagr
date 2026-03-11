"use client";

import React, { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { ImageRecord, CATEGORIES, AVAILABLE_TAGS } from "@/types/image";
import ImageUploadForm from "./ImageUploadForm";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const BUCKET = "diana-images";

type Tab = "images" | "subscribers" | "links";

type Subscriber = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  subscribed_at?: string;
};

type LinkRecord = {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;
  type?: string;
  display_order?: number;
};

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("images");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Images state
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // Links state
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", description: "", url: "", icon: "", type: "Video" });
  const [addingLink, setAddingLink] = useState(false);

  const msg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // ── Images ──
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
      msg("success", "התמונה נמחקה");
      fetchImages();
    } catch { msg("error", "שגיאה במחיקה"); }
  };

  const copyPath = (img: ImageRecord) => {
    const path = img.storage_path || img.filename;
    const url = `${baseUrl}/api/storage/buckets/${BUCKET}/objects/${encodeURIComponent(path)}`;
    navigator.clipboard.writeText(url);
    msg("success", "הנתיב הועתק");
  };

  // ── Subscribers ──
  const fetchSubscribers = async () => {
    setSubsLoading(true);
    try {
      const { data } = await insforge.database.from("subscribers").select("*").order("subscribed_at", { ascending: false });
      if (data) setSubscribers(data as Subscriber[]);
    } catch { setSubscribers([]); }
    setSubsLoading(false);
  };

  const exportCSV = () => {
    const rows = [["שם", "אימייל", "טלפון", "תאריך רישום"]];
    subscribers.forEach(s => rows.push([s.name || "", s.email, s.phone || "", s.subscribed_at?.split("T")[0] || ""]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
  };

  // ── Links ──
  const fetchLinks = async () => {
    setLinksLoading(true);
    try {
      const { data } = await insforge.database.from("links").select("*").order("display_order", { ascending: true });
      if (data) setLinks(data as LinkRecord[]);
    } catch { setLinks([]); }
    setLinksLoading(false);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;
    setAddingLink(true);
    try {
      const { error } = await insforge.database.from("links").insert([{ ...newLink, display_order: links.length + 1 }]);
      if (error) throw error;
      msg("success", "הקישור נוסף בהצלחה!");
      setNewLink({ title: "", description: "", url: "", icon: "", type: "Video" });
      fetchLinks();
    } catch { msg("error", "שגיאה בהוספת קישור"); }
    setAddingLink(false);
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await insforge.database.from("links").delete().eq("id", id);
      msg("success", "הקישור נמחק");
      fetchLinks();
    } catch { msg("error", "שגיאה במחיקה"); }
  };

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  useEffect(() => { fetchImages(); }, []);
  useEffect(() => { if (tab === "subscribers") fetchSubscribers(); }, [tab]);
  useEffect(() => { if (tab === "links") fetchLinks(); }, [tab]);

  const tabClass = (t: Tab) =>
    `px-6 py-3 font-bold rounded-t-lg transition-all ${tab === t ? "bg-white text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"}`;

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <header className="bg-gradient-to-r from-primary to-primary-light text-white p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ניהול האתר — דיאנה רחמני</h1>
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

      {/* Tabs */}
      <div className="bg-gray-200 px-6 flex gap-2 pt-4">
        <button onClick={() => setTab("images")} className={tabClass("images")}>📸 תמונות</button>
        <button onClick={() => setTab("subscribers")} className={tabClass("subscribers")}>
          📧 מנויים {subscribers.length > 0 && <span className="ms-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">{subscribers.length}</span>}
        </button>
        <button onClick={() => setTab("links")} className={tabClass("links")}>🔗 קישורים / פודקאסטים</button>
      </div>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {message && (
          <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
          </div>
        )}

        {/* ── IMAGES TAB ── */}
        {tab === "images" && (
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
        )}

        {/* ── SUBSCRIBERS TAB ── */}
        {tab === "subscribers" && (
          <section className="bg-white rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">רשימת מנויים ({subscribers.length})</h2>
              {subscribers.length > 0 && (
                <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold">
                  📥 ייצוא CSV
                </button>
              )}
            </div>
            {subsLoading ? <p>טוען...</p> : subscribers.length === 0 ? (
              <p className="text-gray-500 text-center py-12">אין מנויים עדיין. הם יופיעו כאן לאחר שיירשמו באתר.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-gray-600">
                    <th className="p-3 text-start">שם</th>
                    <th className="p-3 text-start">אימייל</th>
                    <th className="p-3 text-start">טלפון</th>
                    <th className="p-3 text-start">תאריך רישום</th>
                  </tr></thead>
                  <tbody>
                    {subscribers.map(s => (
                      <tr key={s.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{s.name || "—"}</td>
                        <td className="p-3 text-primary">{s.email}</td>
                        <td className="p-3">{s.phone || "—"}</td>
                        <td className="p-3 text-gray-400">{s.subscribed_at?.split("T")[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── LINKS TAB ── */}
        {tab === "links" && (
          <>
            <section className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold text-primary mb-4">הוספת קישור חדש</h2>
              <form onSubmit={handleAddLink} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required value={newLink.title} onChange={e => setNewLink(p => ({ ...p, title: e.target.value }))}
                    placeholder="כותרת (לדוגמה: פרק 47 בפודקאסט)" className="border-2 border-gray-200 focus:border-primary rounded-lg p-3 outline-none w-full" />
                  <input required value={newLink.url} onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                    placeholder="קישור (URL)" className="border-2 border-gray-200 focus:border-primary rounded-lg p-3 outline-none w-full" />
                </div>
                <textarea value={newLink.description} onChange={e => setNewLink(p => ({ ...p, description: e.target.value }))}
                  placeholder="תיאור קצר" rows={2} className="border-2 border-gray-200 focus:border-primary rounded-lg p-3 outline-none w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={newLink.icon} onChange={e => setNewLink(p => ({ ...p, icon: e.target.value }))}
                    placeholder="URL של אייקון (אופציונלי)" className="border-2 border-gray-200 focus:border-primary rounded-lg p-3 outline-none w-full" />
                  <select value={newLink.type} onChange={e => setNewLink(p => ({ ...p, type: e.target.value }))}
                    className="border-2 border-gray-200 focus:border-primary rounded-lg p-3 outline-none w-full">
                    <option value="Video">Video</option>
                    <option value="Spotify">Spotify</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Podcast">Podcast</option>
                  </select>
                </div>
                <button type="submit" disabled={addingLink}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50">
                  {addingLink ? "מוסיף..." : "➕ הוסף קישור"}
                </button>
              </form>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-4">קישורים קיימים ({links.length})</h2>
              {linksLoading ? <p>טוען...</p> : links.length === 0 ? (
                <p className="text-gray-500 text-center py-12 bg-white rounded-xl shadow">אין קישורים. הוסף קישור למעלה או הרץ את setup_insforge.html לייבוא ברירת מחדל.</p>
              ) : (
                <div className="space-y-3">
                  {links.map(link => (
                    <div key={link.id} className="bg-white rounded-xl p-4 shadow flex items-center gap-4">
                      {link.icon && <img src={link.icon} alt="" className="w-8 h-8 object-contain flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{link.title}</p>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">{link.url}</a>
                        {link.description && <p className="text-xs text-gray-500 mt-1 truncate">{link.description}</p>}
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded flex-shrink-0">{link.type}</span>
                      <button onClick={() => handleDeleteLink(link.id)} className="text-red-500 hover:text-red-700 text-sm flex-shrink-0 px-2">🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
