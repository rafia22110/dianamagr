"use client";

import React, { useState } from "react";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import ImagesTab from "./admin/ImagesTab";
import SubscribersTab from "./admin/SubscribersTab";
import LinksTab from "./admin/LinksTab";

type Tab = "images" | "subscribers" | "links";

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("images");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);

  const msg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

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
          📧 מנויים {subscribersCount > 0 && <span className="mr-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">{subscribersCount}</span>}
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
        {tab === "images" && <ImagesTab msg={msg} />}

        {/* ── SUBSCRIBERS TAB ── */}
        {tab === "subscribers" && <SubscribersTab onSubscribersCountChange={setSubscribersCount} />}

        {/* ── LINKS TAB ── */}
        {tab === "links" && <LinksTab msg={msg} />}
      </main>
    </div>
  );
}
