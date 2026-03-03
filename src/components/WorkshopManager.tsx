"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { Workshop } from "@/types/schema";

export default function WorkshopManager() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [status, setStatus] = useState<'open' | 'closed' | 'finished'>('open');

  const fetchWorkshops = async () => {
    setLoading(true);
    const { data, error } = await insforge.database
      .from("workshops")
      .select("*")
      .order("date", { ascending: false });
    if (!error && data) setWorkshops(data as Workshop[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await insforge.database.from("workshops").insert({
      title,
      description,
      price: parseFloat(price),
      date: date || null,
      is_online: isOnline,
      status,
    });

    if (!error) {
      setTitle("");
      setDescription("");
      setPrice("");
      setDate("");
      fetchWorkshops();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("האם למחוק את הסדנה?")) {
      await insforge.database.from("workshops").delete().eq("id", id);
      fetchWorkshops();
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="text-lg font-bold">הוספת סדנה חדשה</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="שם הסדנה"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="מחיר"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="open">פתוח להרשמה</option>
            <option value="closed">סגור</option>
            <option value="finished">הסתיים</option>
          </select>
        </div>
        <textarea
          placeholder="תיאור"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        ></textarea>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isOnline}
            onChange={(e) => setIsOnline(e.target.checked)}
          />
          סדנה אונליין
        </label>
        <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold">
          הוסף סדנה
        </button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">שם הסדנה</th>
              <th className="p-4">מחיר</th>
              <th className="p-4">תאריך</th>
              <th className="p-4">סטטוס</th>
              <th className="p-4">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">טוען...</td></tr>
            ) : workshops.map((w) => (
              <tr key={w.id} className="border-b">
                <td className="p-4">{w.title} {w.is_online && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">אונליין</span>}</td>
                <td className="p-4">₪{w.price}</td>
                <td className="p-4">{w.date ? new Date(w.date).toLocaleString('he-IL') : '-'}</td>
                <td className="p-4">{w.status}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:underline">מחק</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
