import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

const BUCKET = "diana-images";

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("images")
      .select("*")
      .order("upload_date", { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ images: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
