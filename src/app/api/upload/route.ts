import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { insforge } from '@/lib/insforge';
import { verifyCookie } from '@/app/actions/auth';

const BUCKET = "diana-images";
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  const isAdmin = await verifyCookie(sessionCookie);

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const altText = formData.get('altText') as string;
    const tagsJson = formData.get('tags') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 🛡️ Sentinel: Server-side MIME type and extension validation to prevent malicious uploads.
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const tags = tagsJson ? JSON.parse(tagsJson) : [];
    
    const key = `${category}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadErr } = await insforge.storage
      .from(BUCKET)
      .upload(key, file);

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message || 'Error uploading file' }, { status: 500 });
    }

    const url = (uploadData as any)?.url || "";
    const storagePath = (uploadData as any)?.key || key;

    const { error: dbErr } = await insforge.database.from("images").insert({
      filename: file.name,
      original_name: file.name,
      category,
      tags: tags,
      alt_text: altText || null,
      storage_path: storagePath,
      url,
    });

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message || 'Error inserting into database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
