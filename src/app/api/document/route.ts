import { NextResponse } from 'next/server';
import { readDocument } from '@/lib/agents/document';
import type { Lang } from '@/lib/adapters/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Read a photographed document and say — before anything is filed — whether it is usable.
 *
 * The image is held in memory for the length of this request and never written anywhere. We
 * do not want a bucket full of people's rejection letters, and a prototype has no business
 * keeping them.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const image = form.get('image');
  const lang = (form.get('lang') as Lang) ?? 'hi';

  if (!(image instanceof Blob)) return NextResponse.json({ error: 'no image' }, { status: 400 });
  if (image.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'That photo is very large. Take it again at a smaller size.' }, { status: 413 });
  }

  try {
    const base64 = Buffer.from(await image.arrayBuffer()).toString('base64');
    const result = await readDocument({
      imageBase64: base64,
      mimeType: image.type || 'image/jpeg',
      citizenLang: lang,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('document read failed', err);
    // Attachment stays; we just say plainly that we could not read it.
    return NextResponse.json(
      { error: 'We could not read that photo. You can still attach it — nobody here will check it first.' },
      { status: 502 },
    );
  }
}
