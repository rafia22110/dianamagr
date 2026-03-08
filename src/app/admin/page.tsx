import { cookies } from "next/headers";
import AdminLoginClient from "@/components/AdminLoginClient";
import AdminPanel from "@/components/AdminPanel";
import { verifyCookie } from "@/app/actions/auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;

  const isAdmin = await verifyCookie(sessionCookie);

  if (!isAdmin) {
    return <AdminLoginClient />;
  }

  return <AdminPanel />;
}
