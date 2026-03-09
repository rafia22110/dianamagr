"use client";

import React, { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";

export type Subscriber = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  subscribed_at?: string;
};

interface SubscribersTabProps {
  onSubscribersCountChange?: (count: number) => void;
}

export default function SubscribersTab({ onSubscribersCountChange }: SubscribersTabProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  const fetchSubscribers = async () => {
    setSubsLoading(true);
    try {
      const { data } = await insforge.database.from("subscribers").select("*").order("subscribed_at", { ascending: false });
      if (data) {
        setSubscribers(data as Subscriber[]);
        if (onSubscribersCountChange) onSubscribersCountChange(data.length);
      }
    } catch {
      setSubscribers([]);
      if (onSubscribersCountChange) onSubscribersCountChange(0);
    }
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

  useEffect(() => { fetchSubscribers(); }, []);

  return (
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
              <th className="p-3 text-right">שם</th>
              <th className="p-3 text-right">אימייל</th>
              <th className="p-3 text-right">טלפון</th>
              <th className="p-3 text-right">תאריך רישום</th>
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
  );
}
