import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

const BUCKET = "diana-images";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const altText = formData.get('altText') as string;
    const tagsJson = formData.get('tags') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const tags = tagsJson ? JSON.parse(tagsJson) : [];
    
    const ext = file.name.split(".").pop() || "jpg";
    const key = `${category}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadErr } = await insforge.storage
      .from(BUCKET)
      .upload(key, file);

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message || 'Error uploading file' }, { status: 500 });
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
      return NextResponse.json({ error: dbErr.message || 'Error inserting into database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
