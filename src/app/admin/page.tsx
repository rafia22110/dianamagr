"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import AdminPanel from "@/components/AdminPanel";
import LoginForm from "@/components/LoginForm";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      setUser(data?.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  if (!user) {
    return <LoginForm onLogin={() => {
      insforge.auth.getCurrentUser().then(({ data }) => {
        setUser(data?.user);
      });
    }} />;
  }

  return <AdminPanel />;
}
