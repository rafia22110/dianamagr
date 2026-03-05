"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { ImageRecord } from "@/types/image";
import { CATEGORIES } from "@/types/image";
import ImageUploadForm from "./ImageUploadForm";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const BUCKET = "diana-images";

export default function AdminPanel() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"images" | "subscriptions" | "workshops" | "registrations" | "orders">("images");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await insforge.auth.getCurrentSession();
      if (!data?.session) {
        router.push("/admin/login");
      } else {
        setAuthLoading(false);
        fetchImages();
        fetchSubscriptions();
        fetchWorkshops();
        fetchRegistrations();
        fetchOrders();
      }
    };
    checkAuth();
  }, [router]);

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

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await insforge.database
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setSubscriptions(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await insforge.database
        .from("workshops")
        .select("*")
        .order("date", { ascending: false });
      if (!error && data) setWorkshops(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await insforge.database
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setRegistrations(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await insforge.database
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setOrders(data);
    } catch (e) {
      console.warn(e);
    }
  };

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

  const handleLogout = async () => {
    await insforge.auth.signOut();
    router.push("/admin/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-bold text-primary">בודק הרשאות...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <header className="bg-gradient-to-r from-primary to-primary-light text-white p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ניהול אתר - דיאנה רחמני</h1>
        <div className="flex gap-4 items-center">
          <a
            href="/"
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
          >
            צפייה באתר
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors"
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

        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("images")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "images" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            תמונות
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "subscriptions" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            נרשמים (ניוזלטר)
          </button>
          <button
            onClick={() => setActiveTab("workshops")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "workshops" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            סדנאות והרצאות
          </button>
          <button
            onClick={() => setActiveTab("registrations")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "registrations" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            נרשמים לסדנאות
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "orders" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            הזמנות ספרים
          </button>
        </div>

        {activeTab === "images" && (
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
          </>
        )}

        {activeTab === "workshops" && (
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-primary mb-4">הוספת סדנה/הרצאה חדשה</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const data = {
                  title: formData.get("title"),
                  description: formData.get("description"),
                  date: formData.get("date"),
                  location: formData.get("location"),
                  price: Number(formData.get("price")),
                  type: formData.get("type"),
                };
                const { error } = await insforge.database.from("workshops").insert(data);
                if (!error) {
                  setMessage({ type: "success", text: "הסדנה נוספה בהצלחה!" });
                  form.reset();
                  fetchWorkshops();
                } else {
                  setMessage({ type: "error", text: "שגיאה בהוספה" });
                }
              }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" placeholder="כותרת" required className="p-2 border rounded" />
                <input name="location" placeholder="מיקום" required className="p-2 border rounded" />
                <textarea name="description" placeholder="תיאור" required className="p-2 border rounded md:col-span-2" />
                <input name="date" type="datetime-local" required className="p-2 border rounded" />
                <input name="price" type="number" placeholder="מחיר" required className="p-2 border rounded" />
                <select name="type" required className="p-2 border rounded">
                   <option value="online">אונליין</option>
                   <option value="offline">פרונטלי</option>
                </select>
                <button type="submit" className="bg-primary text-white p-2 rounded md:col-span-2">הוסף סדנה</button>
              </form>
            </section>

            <section className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-primary">סדנאות קיימות ({workshops.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4">כותרת</th>
                      <th className="px-6 py-4">תאריך</th>
                      <th className="px-6 py-4">מיקום</th>
                      <th className="px-6 py-4">מחיר</th>
                      <th className="px-6 py-4">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {workshops.map(ws => (
                      <tr key={ws.id}>
                        <td className="px-6 py-4 font-medium">{ws.title}</td>
                        <td className="px-6 py-4">{new Date(ws.date).toLocaleString("he-IL")}</td>
                        <td className="px-6 py-4">{ws.location}</td>
                        <td className="px-6 py-4">{ws.price} ₪</td>
                        <td className="px-6 py-4">
                           <button onClick={async () => {
                             await insforge.database.from("workshops").delete().eq("id", ws.id);
                             fetchWorkshops();
                           }} className="text-red-500 hover:underline">מחק</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === "registrations" && (
           <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-primary">נרשמים לסדנאות ({registrations.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">שם</th>
                    <th className="px-6 py-4">אימייל</th>
                    <th className="px-6 py-4">טלפון</th>
                    <th className="px-6 py-4">סדנה</th>
                    <th className="px-6 py-4">תאריך הרשמה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="px-6 py-4 font-medium">{reg.name}</td>
                      <td className="px-6 py-4">{reg.email}</td>
                      <td className="px-6 py-4 text-ltr">{reg.phone}</td>
                      <td className="px-6 py-4">{workshops.find(w => w.id === reg.workshop_id)?.title || "לא ידוע"}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {reg.created_at ? new Date(reg.created_at).toLocaleString("he-IL") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "orders" && (
           <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-primary">הזמנות ספרים ({orders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">לקוח</th>
                    <th className="px-6 py-4">אימייל</th>
                    <th className="px-6 py-4">מוצר</th>
                    <th className="px-6 py-4">סכום</th>
                    <th className="px-6 py-4">סטטוס</th>
                    <th className="px-6 py-4">תאריך</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 font-medium">{order.customer_name}</td>
                      <td className="px-6 py-4">{order.customer_email}</td>
                      <td className="px-6 py-4">{order.item_name}</td>
                      <td className="px-6 py-4 font-bold text-green-600">{order.amount} ₪</td>
                      <td className="px-6 py-4">
                         <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                           {order.status === 'completed' ? 'שולם' : order.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleString("he-IL") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "subscriptions" && (
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-primary">רשימת נרשמים לניוזלטר ({subscriptions.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-500 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">אימייל</th>
                    <th className="px-6 py-4 font-medium">תאריך הרשמה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{sub.email}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {sub.created_at ? new Date(sub.created_at).toLocaleDateString("he-IL") : "—"}
                      </td>
                    </tr>
                  ))}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                        אין נרשמים עדיין
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
