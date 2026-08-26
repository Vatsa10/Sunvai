/**
 * The verdict's explanation, in the language the page is being read in.
 *
 * The auditor writes its reasoning in English, and that sentence is the most important one on
 * the case page: it is what the verdict word actually means for this person. Rendering it in
 * English on a Hindi page — and worse, handing it to a Hindi text-to-speech voice, which then
 * pronounces English letter shapes at someone who cannot read them — is worse than silence.
 *
 * It is translated here, at render, rather than in the auditor. The auditor's prompt and
 * schema are fixed: the published accuracy figures are measurements of a specific prompt
 * version, and changing it would invalidate them. Translation is presentation, so it belongs
 * in the presentation layer.
 *
 * The translation is ours, not the department's, and the page says so. The department's own
 * reply is never translated in place — it is shown verbatim, because the citation guard
 * matches against that exact text.
 */

import { language } from '@/lib/adapters/language/openai';
import type { Lang } from '@/lib/adapters/types';

export type ReadableReasoning = {
  text: string;
  /**
   * `original`     — the page language is the language it was written in.
   * `translated`   — ours, and labelled as ours.
   * `untranslated` — we tried and could not. Shown in English, said to be English, and not
   *                  read aloud, because a wrong-language voice is not an accessibility win.
   */
  state: 'original' | 'translated' | 'untranslated';
};

/**
 * Keyed by audit id, so it survives every re-render of a case and never collides across cases.
 * An audit row is immutable once written, which is what makes this safe to cache at all.
 * Bounded, because a long-lived server should not grow a map for every case ever opened.
 */
const CACHE = new Map<string, string>();
const CACHE_MAX = 500;

export async function readableReasoning(
  auditId: string,
  reasoning: string,
  from: Lang,
  to: string,
): Promise<ReadableReasoning> {
  if (to === from) return { text: reasoning, state: 'original' };

  const key = `${auditId}:${to}`;
  const hit = CACHE.get(key);
  if (hit) return { text: hit, state: 'translated' };

  try {
    const translated = await language.translate(reasoning, from, to as Lang);
    // An empty or unchanged result is a failure wearing a success's clothes.
    if (!translated.trim() || translated.trim() === reasoning.trim()) {
      return { text: reasoning, state: 'untranslated' };
    }
    if (CACHE.size >= CACHE_MAX) CACHE.delete(CACHE.keys().next().value!);
    CACHE.set(key, translated);
    return { text: translated, state: 'translated' };
  } catch {
    // No network, no key, no quota — the citizen still gets the sentence, and gets told what
    // it is. Never a silent English wall pretending to be their language.
    return { text: reasoning, state: 'untranslated' };
  }
}
