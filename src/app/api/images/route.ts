import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { ensureAdmin } from '@/lib/auth-utils';

const BUCKET = "diana-images";

export async function GET() {
  const authError = await ensureAdmin();
  if (authError) return authError;

  console.log('InsForge Client BaseURL:', (insforge as any).baseUrl);
  try {
    const { data, error } = await insforge.database
      .from("images")
      .select("*")
      .order("upload_date", { ascending: false });
    
    if (error) {
      console.error('Database Select Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    
    return NextResponse.json({ images: data });
  } catch (error: any) {
    // 🛡️ Sentinel: Sanitize error messages to avoid leaking internals.
    console.error('Fetch Images Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await ensureAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const storagePath = searchParams.get('storagePath');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    if (storagePath && storagePath !== 'undefined') {
      await insforge.storage.from(BUCKET).remove(storagePath);
    }

    const { error } = await insforge.database.from("images").delete().eq("id", id);
    
    if (error) {
      console.error('Database Delete Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // 🛡️ Sentinel: Sanitize error messages to avoid leaking internals.
    console.error('Delete Image Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
