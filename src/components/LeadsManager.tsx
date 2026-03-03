"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { Registration, Subscriber } from "@/types/schema";

export default function LeadsManager() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [regRes, subRes] = await Promise.all([
      insforge.database.from("registrations").select("*").order("created_at", { ascending: false }),
      insforge.database.from("subscribers").select("*").order("created_at", { ascending: false }),
    ]);

    if (regRes.data) setRegistrations(regRes.data as Registration[]);
    if (subRes.data) setSubscribers(subRes.data as Subscriber[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-12">
      <section>
        <h3 className="text-xl font-bold mb-4">הרשמות לסדנאות והרצאות</h3>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">שם מלא</th>
                <th className="p-4">אימייל</th>
                <th className="p-4">טלפון</th>
                <th className="p-4">הודעה</th>
                <th className="p-4">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">טוען...</td></tr>
              ) : registrations.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-4 font-medium">{r.full_name}</td>
                  <td className="p-4">{r.email}</td>
                  <td className="p-4">{r.phone}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={r.message}>{r.message}</td>
                  <td className="p-4 text-xs">{r.created_at ? new Date(r.created_at).toLocaleString('he-IL') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4">נרשמים לניוזלטר</h3>
        <div className="bg-white rounded-xl shadow overflow-hidden max-w-2xl">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">אימייל</th>
                <th className="p-4">תאריך הרשמה</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2} className="p-4 text-center">טוען...</td></tr>
              ) : subscribers.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-4">{s.email}</td>
                  <td className="p-4 text-xs">{s.created_at ? new Date(s.created_at).toLocaleString('he-IL') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
