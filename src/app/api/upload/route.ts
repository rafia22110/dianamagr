import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { ensureAdmin } from '@/lib/auth-utils';

const BUCKET = "diana-images";
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

export async function POST(request: Request) {
  const authError = await ensureAdmin();
  if (authError) return authError;

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
    
    const key = `${category}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

    const { data: uploadData, error: uploadErr } = await insforge.storage
      .from(BUCKET)
      .upload(key, file);

    if (uploadErr) {
      console.error('Storage Upload Error:', uploadErr);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

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
    });

    if (dbErr) {
      console.error('Database Insert Error:', dbErr);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    // 🛡️ Sentinel: Sanitize error messages to avoid leaking internals.
    console.error('Upload Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
