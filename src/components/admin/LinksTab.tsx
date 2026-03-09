"use client";

import React, { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";

export type LinkRecord = {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;
  type?: string;
  display_order?: number;
};

interface LinksTabProps {
  msg: (type: "success" | "error", text: string) => void;
}

export default function LinksTab({ msg }: LinksTabProps) {
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", description: "", url: "", icon: "", type: "Video" });
  const [addingLink, setAddingLink] = useState(false);

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

  useEffect(() => { fetchLinks(); }, []);

  return (
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
  );
}
