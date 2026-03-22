import React, { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { Message } from "@/types/admin";

interface MessageListProps {
  onUpdateCount: (count: number) => void;
}

export default function MessageList({ onUpdateCount }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const { data } = await insforge.database.from("messages").select("*").order("created_at", { ascending: false });
      const msgs = (data || []) as Message[];
      setMessages(msgs);
      onUpdateCount(msgs.length);
    } catch {
      setMessages([]);
      onUpdateCount(0);
    }
    setMessagesLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <section className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-xl font-bold text-primary mb-6">פניות מהאתר ({messages.length})</h2>
      {messagesLoading ? <p>טוען...</p> : messages.length === 0 ? (
        <p className="text-gray-500 text-center py-12">אין פניות עדיין. פניות מהטופס באתר יופיעו כאן.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{m.name}</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {m.created_at ? new Date(m.created_at).toLocaleString('he-IL') : ''}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-600 mb-3">
                <span>📧 <a href={`mailto:${m.email}`} className="text-primary hover:underline">{m.email}</a></span>
                {m.phone && <span>📱 <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a></span>}
              </div>
              {m.message && (
                <div className="bg-gray-50 p-3 rounded text-gray-800 whitespace-pre-wrap">
                  {m.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
