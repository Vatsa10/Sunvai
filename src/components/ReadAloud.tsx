'use client';

import { useRef, useState } from 'react';
import type { Lang } from '@/lib/adapters/types';

/**
 * Read-aloud.
 *
 * Voice is an OUTPUT here, not just an input. Literacy and language are different problems: a
 * woman who speaks Hindi fluently may not read it comfortably, and she is exactly the person
 * whose pension stopped. The whole journey has to be completable by ear — so the verdict, the
 * question and the consent text all get this control, not just the form.
 *
 * When speech is unavailable the button says so and disables itself. It never spins forever.
 */
export function ReadAloud({ text, lang, label = 'Read this aloud' }: { text: string; lang: Lang; label?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'unavailable'>('idle');
  const audio = useRef<HTMLAudioElement | null>(null);
  const cached = useRef<string | null>(null);

  async function play() {
    if (state === 'playing') {
      audio.current?.pause();
      setState('idle');
      return;
    }

    setState('loading');
    try {
      if (!cached.current) {
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text, lang }),
        });
        if (!res.ok) throw new Error('tts unavailable');
        cached.current = URL.createObjectURL(await res.blob());
      }
      const el = new Audio(cached.current);
      audio.current = el;
      el.onended = () => setState('idle');
      el.onerror = () => setState('unavailable');
      await el.play();
      setState('playing');
    } catch {
      setState('unavailable');
    }
  }

  if (state === 'unavailable') {
    return (
      <p className="text-sm text-muted">
        <span aria-hidden>🔇 </span>Reading aloud is not working right now. The words are all above.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={play}
      disabled={state === 'loading'}
      className="inline-flex min-h-touch items-center gap-2 rounded border border-rule px-4 py-2 text-base disabled:opacity-50"
    >
      <span aria-hidden>{state === 'playing' ? '⏸' : '🔊'}</span>
      {state === 'loading' ? 'One moment…' : state === 'playing' ? 'Stop' : label}
    </button>
  );
}
