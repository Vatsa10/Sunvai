import { NextResponse } from 'next/server';
import { language } from '@/lib/adapters/language/openai';
import type { Lang } from '@/lib/adapters/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Speech out. Voice is not only an input here — the whole journey has to be completable by
 * someone who cannot comfortably read the screen, and that means the verdict and the consent
 * gate get read aloud too, not just the form.
 */
export async function POST(req: Request) {
  const { text, lang } = (await req.json()) as { text?: string; lang?: Lang };
  if (!text?.trim()) return NextResponse.json({ error: 'nothing to read' }, { status: 400 });

  try {
    const audio = await language.synthesize(text.slice(0, 4000), lang ?? 'hi');
    return new NextResponse(audio, {
      headers: { 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=86400' },
    });
  } catch (err) {
    console.error('tts failed', err);
    // The control disables itself with a reason rather than spinning forever.
    return NextResponse.json({ error: 'Read-aloud is unavailable right now.' }, { status: 502 });
  }
}
