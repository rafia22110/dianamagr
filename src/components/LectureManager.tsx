"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { Lecture } from "@/types/schema";

export default function LectureManager() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const fetchLectures = async () => {
    setLoading(true);
    const { data, error } = await insforge.database
      .from("lectures")
      .select("*");
    if (!error && data) setLectures(data as Lecture[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await insforge.database.from("lectures").insert({
      title,
      description,
      price: price ? parseFloat(price) : null,
    });

    if (!error) {
      setTitle("");
      setDescription("");
      setPrice("");
      fetchLectures();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("האם למחוק את ההרצאה?")) {
      await insforge.database.from("lectures").delete().eq("id", id);
      fetchLectures();
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="text-lg font-bold">הוספת הרצאה חדשה</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="שם ההרצאה"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="מחיר (אופציונלי)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <textarea
          placeholder="תיאור"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        ></textarea>
        <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold">
          הוסף הרצאה
        </button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">שם ההרצאה</th>
              <th className="p-4">מחיר</th>
              <th className="p-4">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-4 text-center">טוען...</td></tr>
            ) : lectures.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="p-4">{l.title}</td>
                <td className="p-4">{l.price ? `₪${l.price}` : '-'}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(l.id)} className="text-red-600 hover:underline">מחק</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
