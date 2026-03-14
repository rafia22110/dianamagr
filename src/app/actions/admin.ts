"use server";

import { cookies } from "next/headers";
import { verifyCookie } from "@/app/actions/auth";
import { insforge } from "@/lib/insforge";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  const isAdmin = await verifyCookie(sessionCookie);
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }
}

export async function uploadImageAction(formData: FormData) {
  await ensureAdmin();

  const file = formData.get("file") as File;
  const category = formData.get("category") as string;
  const altText = formData.get("altText") as string;
  const tags = JSON.parse(formData.get("tags") as string || "[]");

  if (!file) throw new Error("No file provided");

  const BUCKET = "diana-images";
  const ext = file.name.split(".").pop() || "jpg";
  const key = `${category}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

  const { data: uploadData, error: uploadErr } = await insforge.storage
    .from(BUCKET)
    .upload(key, file);

  if (uploadErr) throw new Error(uploadErr.message);

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
    upload_date: new Date().toISOString(),
  });

  if (dbErr) throw new Error(dbErr.message);

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteImageAction(id: string, storagePath?: string) {
  await ensureAdmin();

  const BUCKET = "diana-images";
  if (storagePath) {
    await insforge.storage.from(BUCKET).remove(storagePath);
  }

  const { error } = await insforge.database.from("images").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { success: true };
}

export async function addLinkAction(linkData: {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  type?: string;
  display_order?: number;
}) {
  await ensureAdmin();

  const { error } = await insforge.database.from("links").insert([linkData]);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteLinkAction(id: string) {
  await ensureAdmin();

  const { error } = await insforge.database.from("links").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteSubscriberAction(id: string) {
  await ensureAdmin();

  const { error } = await insforge.database.from("subscribers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { success: true };
}
