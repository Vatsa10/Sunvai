/**
 * Text of ours, in the language the page is being read in.
 *
 * Three pieces of the case page are written once, in one language, and read by people in
 * another: the auditor's reasoning (English), the "what they did not answer" list (English),
 * and the next step (the case's own language, so Marathi at a Hindi reader and English at a
 * Marathi one). Each is ours to translate. Each is the part of the page a citizen would carry
 * to a counter. Surrounded by Hindi, an English list reads as the part she is not trusted
 * with.
 *
 * The mechanism was built for the reasoning in migration 14 and is generalised here, because a
 * third caller arrived within a day and a fourth is likely:
 *
 *   1. Store the translation next to the row it belongs to, keyed by language. The rows are
 *      immutable, so a translation of one is a fact about it.
 *   2. Never await a model during a render. A missing translation shows the original
 *      immediately, says what language it is in, and is not read aloud.
 *   3. Fill the gap behind the render, write through, so the cost is paid once ever rather
 *      than once per instance.
 *   4. Pre-warm the demo cases at seed time, so a reviewer's first click never pays at all.
 *
 * Everything is a `string[]` at this boundary: one part for a paragraph, two for a
 * heading/body pair, N for a list. That is what lets one store and one code path serve all
 * three callers.
 *
 * Presentation, not evidence. The auditor's prompt and schema are untouched — the published
 * accuracy figures measure a fixed prompt version — the original columns are never rewritten,
 * and the department's own reply is never translated in place, because the citation guard
 * matches that exact text.
 */

import { language } from '@/lib/adapters/language/openai';
import { query } from '@/lib/db';
import type { Lang } from '@/lib/adapters/types';

/** Table and column are looked up here, never interpolated from a caller's string. */
const STORES = {
  auditReasoning: { table: 'audits', column: 'reasoning_translations' },
  auditUnaddressed: { table: 'audits', column: 'unaddressed_translations' },
  nextStep: { table: 'grievances', column: 'next_step_translations' },
} as const;

export type StoreKey = keyof typeof STORES;

export type TranslationState =
  /** The page language is the language it was written in. */
  | 'original'
  /** Ours, and labelled as ours. */
  | 'translated'
  /** We do not have one to show. The original, said to be the original, and not read aloud. */
  | 'untranslated';

export type TranslatedParts = { parts: string[]; state: TranslationState };

export type TranslationRequest = {
  store: StoreKey;
  rowId: string;
  /** The original text, split into the parts that must survive as separate parts. */
  parts: string[];
  /** What is already stored on that row: lang code to parts. */
  stored: Record<string, string[]>;
  from: Lang;
  to: string;
};

/** In-flight guard, so one cold page does not fire the same translation several times. */
const PENDING = new Set<string>();

/**
 * Synchronous by design: nothing here may make the page wait. If the translation is missing it
 * is requested in the background and this render shows the original.
 */
export function readTranslated(req: TranslationRequest): TranslatedParts {
  const { parts, stored, from, to } = req;
  if (to === from) return { parts, state: 'original' };
  if (parts.length === 0) return { parts, state: 'original' };

  const hit = stored?.[to];
  // A stored translation must line up part for part, or a list would render against the wrong
  // bullets. A shape mismatch is treated as absent rather than patched over.
  if (Array.isArray(hit) && hit.length === parts.length && hit.every((p) => p && p.trim())) {
    return { parts: hit, state: 'translated' };
  }

  void fillInBackground(req);
  return { parts, state: 'untranslated' };
}

async function fillInBackground(req: TranslationRequest) {
  const key = `${req.store}:${req.rowId}:${req.to}`;
  if (PENDING.has(key)) return;
  PENDING.add(key);
  try {
    await warmTranslated(req);
  } catch {
    // No network, no key, no quota. The page already rendered and already told the truth about
    // what it was showing. The next render will try again.
  } finally {
    PENDING.delete(key);
  }
}

/**
 * Translate and store, awaited. Used by the background fill and by `pnpm seed`, which pre-warms
 * the demo cases. A page must never call this directly, because a page must never wait for it.
 */
export async function warmTranslated(req: TranslationRequest): Promise<boolean> {
  const { store, rowId, parts, from, to } = req;
  if (to === from || parts.length === 0) return false;

  const translated = await Promise.all(
    parts.map((part) => language.translate(part, from, to as Lang)),
  );
  // An empty or unchanged part is a failure wearing a success's clothes. Storing it would cache
  // the failure forever, so the whole bundle is discarded and retried on the next render.
  if (translated.some((t, i) => !t.trim() || t.trim() === parts[i]!.trim())) return false;

  await storeTranslated(store, rowId, to, translated);
  return true;
}

/**
 * Write-through. This is a cache of our own sentences, not a state change and not an event, so
 * it does not go through a Server Action and nothing is appended to the ledger: nothing a
 * citizen or a department did is being recorded here. `jsonb || jsonb` merges rather than
 * replaces, so two languages filled at different times both survive.
 */
export async function storeTranslated(
  store: StoreKey,
  rowId: string,
  lang: string,
  parts: string[],
) {
  const { table, column } = STORES[store];
  await query(
    `update ${table}
        set ${column} = coalesce(${column}, '{}'::jsonb) || jsonb_build_object($2::text, $3::jsonb)
      where id = $1`,
    [rowId, lang, JSON.stringify(parts)],
  );
}
