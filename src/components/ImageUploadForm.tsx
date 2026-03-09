"use client";

import React, { useState } from "react";
import { insforge } from "@/lib/insforge";
import { CATEGORIES, AVAILABLE_TAGS } from "@/types/image";

const BUCKET = "diana-images";
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

export default function ImageUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [category, setCategory] = useState("gallery");
  const [altText, setAltText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("בחרי תמונה");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("פורמט לא נתמך. העלי JPG, PNG, GIF או WEBP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const key = `${category}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

      const { data: uploadData, error: uploadErr } = await insforge.storage
        .from(BUCKET)
        .upload(key, file);

      if (uploadErr) {
        setError(uploadErr.message || "שגיאה בהעלאה");
        setLoading(false);
        return;
      }

      const url = uploadData?.url || "";
      const storagePath = uploadData?.key || key;

      const { error: dbErr } = await insforge.database.from("images").insert({
        filename: file.name,
        original_name: file.name,
        category,
        tags: tags,
        alt_text: altText || null,
        storage_path: storagePath,
        url,
      });

      if (dbErr) {
        setError(dbErr.message || "שגיאה בשמירה למסד");
        setLoading(false);
        return;
      }

      setFile(null);
      setAltText("");
      setTags([]);
      onSuccess();
    } catch (e) {
      setError("שגיאה בהעלאת התמונה");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-gray-700 mb-2 font-medium">בחרי תמונה</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-2 font-medium">קטגוריה</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          {Object.entries(CATEGORIES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 mb-2 font-medium">תיאור (Alt Text)</label>
        <input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="תיאור לתמונה"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-2 font-medium">תגיות</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                tags.includes(tag)
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? "מעלה..." : "העלה תמונה"}
      </button>
    </form>
  );
}
