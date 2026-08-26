/**
 * The verdict's explanation, in the language the page is being read in.
 *
 * The auditor writes its reasoning in English, and that sentence is the most important one on
 * the case page: it is what the verdict word actually means for this person. Rendering it in
 * English on a Hindi page — and worse, handing it to a Hindi text-to-speech voice, which then
 * pronounces English letter shapes at someone who cannot read them — is worse than silence.
 *
 * It is translated, but never on the critical path. The first version of this awaited a model
 * call during render: fourteen seconds of blank screen on the headline demo case, and because
 * the cache lived in process memory, every new instance paid it again. A citizen who waits
 * fifteen seconds for a page has already been failed, whatever language it eventually arrives
 * in.
 *
 * So: read the stored translation, or show the English immediately and say so. The translation
 * is filled in behind the render and stored on the audit row, so the cost is paid once ever
 * rather than once per instance, and the demo cases are pre-warmed at seed time so a judge's
 * first click is never the click that pays.
 *
 * Presentation, not audit. The auditor's prompt and schema are untouched — the published
 * accuracy figures measure a fixed prompt version — its `reasoning` column is never rewritten,
 * and the department's own reply is never translated in place, because the citation guard
 * matches that exact text.
 */

import { language } from '@/lib/adapters/language/openai';
import { query } from '@/lib/db';
import type { Lang } from '@/lib/adapters/types';

export type ReadableReasoning = {
  text: string;
  /**
   * `original`     — the page language is the language it was written in.
   * `translated`   — ours, and labelled as ours.
   * `untranslated` — we do not have one to show. English, said to be English, and not read
   *                  aloud, because a wrong-language voice is not an accessibility win.
   */
  state: 'original' | 'translated' | 'untranslated';
};

/** In-flight guard, so one cold page does not fire the same translation several times. */
const PENDING = new Set<string>();

/**
 * Synchronous by design: nothing here may make the page wait. If the translation is missing it
 * is requested in the background and this render shows the English.
 */
export function readableReasoning(args: {
  auditId: string;
  reasoning: string;
  stored: Record<string, string>;
  from: Lang;
  to: string;
}): ReadableReasoning {
  const { auditId, reasoning, stored, from, to } = args;
  if (to === from) return { text: reasoning, state: 'original' };

  const hit = stored[to];
  if (hit && hit.trim()) return { text: hit, state: 'translated' };

  void fillInBackground(auditId, reasoning, from, to);
  return { text: reasoning, state: 'untranslated' };
}

/**
 * Write-through. This is a cache of our own sentence, not a state change and not an event, so
 * it does not go through a Server Action and it is not appended to the ledger: nothing a
 * citizen or a department did is being recorded here. `jsonb || jsonb` merges rather than
 * replaces, so two languages filled at different times both survive.
 */
async function fillInBackground(auditId: string, reasoning: string, from: Lang, to: string) {
  const key = `${auditId}:${to}`;
  if (PENDING.has(key)) return;
  PENDING.add(key);
  try {
    const translated = await language.translate(reasoning, from, to as Lang);
    // An empty or unchanged result is a failure wearing a success's clothes. Storing it would
    // cache the failure forever.
    if (!translated.trim() || translated.trim() === reasoning.trim()) return;
    await storeTranslation(auditId, to, translated);
  } catch {
    // No network, no key, no quota. The page already rendered and already told the truth about
    // what it was showing. The next render will try again.
  } finally {
    PENDING.delete(key);
  }
}

/** Used by the background fill and by `pnpm seed`, which pre-warms the demo cases. */
export async function storeTranslation(auditId: string, lang: string, text: string) {
  await query(
    `update audits
        set reasoning_translations = coalesce(reasoning_translations, '{}'::jsonb)
                                     || jsonb_build_object($2::text, $3::text)
      where id = $1`,
    [auditId, lang, text],
  );
}

/**
 * Translate and store, awaited. For seed time only — a page must never call this, because a
 * page must never wait for it.
 */
export async function warmTranslation(
  auditId: string,
  reasoning: string,
  from: Lang,
  to: string,
): Promise<boolean> {
  if (to === from) return false;
  const translated = await language.translate(reasoning, from, to as Lang);
  if (!translated.trim() || translated.trim() === reasoning.trim()) return false;
  await storeTranslation(auditId, to, translated);
  return true;
}
