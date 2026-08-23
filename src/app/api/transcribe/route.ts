import { NextResponse } from 'next/server';
import { language } from '@/lib/adapters/language/openai';
import type { Lang } from '@/lib/adapters/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Speech in. The audio never lands in a database — only the text the citizen can see and edit. */
export async function POST(req: Request) {
  const form = await req.formData();
  const audio = form.get('audio');
  const lang = (form.get('lang') as Lang) ?? 'hi';

  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: 'no audio' }, { status: 400 });
  }
  if (audio.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'that recording is too long' }, { status: 413 });
  }

  try {
    const { text } = await language.transcribe(audio, lang);
    return NextResponse.json({ text });
  } catch (err) {
    // No silent failure and no fabricated transcript: say what happened and let them type.
    console.error('transcribe failed', err);
    return NextResponse.json(
      { error: 'We could not hear that. Try again, or type it instead.' },
      { status: 502 },
    );
  }
}
