/**
 * The Drafter, and the guard that stands in front of the consent gate.
 *
 * The guard matters more than the prompt: any date, amount or reference number that appears in
 * the formal draft but not in what the citizen actually said BLOCKS the gate. It does not warn.
 * A number we invented, filed under someone's name, is the worst thing this product could do.
 */

import { DraftResultSchema, type DraftResult, type IntakeFacts, type Lang } from './schemas';
import { MODELS, loadPrompt, structuredCall } from './openai';

export const DRAFTER_PROMPT_VERSION = 'drafter.v1';

export async function draft(args: {
  narrative: string;
  facts: IntakeFacts;
  departmentName: string;
  officeName: string | null;
  officialLang: Lang;
  citizenLang: Lang;
}): Promise<DraftResult> {
  const user = `Department: ${args.departmentName}${args.officeName ? ` — ${args.officeName}` : ''}

The citizen's account, in their own words (${args.citizenLang}):
<citizen_complaint>
${args.narrative}
</citizen_complaint>

What we understood:
${JSON.stringify(args.facts, null, 2)}

Write \`formalText\` in ${args.officialLang} and \`citizenLangText\` as a faithful back-translation
in ${args.citizenLang}.

Return JSON only:
{"formalText": "...", "citizenLangText": "...", "subject": "..."}`;

  return structuredCall({
    model: MODELS.fast,
    system: loadPrompt(DRAFTER_PROMPT_VERSION),
    user,
    schema: DraftResultSchema,
  });
}

/**
 * Devanagari digits are digits.
 *
 * Hindi and Marathi are two of the three languages we claim to ship properly, and a citizen
 * speaking either of them may say a date or an amount as १२, २०२६ or ५,०००. An ASCII-only
 * guard does not see those, which means the one check standing between a citizen and a number
 * we invented switches itself off in exactly the languages we said we served. Normalising to
 * one form before comparing is smaller than widening every comparison.
 */
const DEVANAGARI_ZERO = 0x0966;
const DIGIT = '0-9०-९';

function toAsciiDigits(text: string): string {
  return text.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - DEVANAGARI_ZERO));
}

/**
 * Every number in the draft must be traceable to something the citizen said. Runs before the
 * consent gate renders, and a failure stops the flow rather than annotating it.
 */
export function checkNumbersInSource(
  draftText: string,
  source: { narrative: string; facts: IntakeFacts },
): { ok: true } | { ok: false; invented: string[] } {
  // Both sides are normalised to ASCII digits, so २०२६ in the draft is checked against 2026 in
  // what she said, and against २०२६, and either counts as having been said.
  const haystack = toAsciiDigits([source.narrative, JSON.stringify(source.facts)].join(' ')).toLowerCase();

  // Digit runs of two or more: years, amounts, claim numbers. Single digits are usually prose
  // ("two months"), and chasing them produces noise that trains people to ignore the guard.
  // Matched against the draft as written, so the number we quote back to her in the error is
  // in the script she is reading rather than transliterated into one she may not use.
  const numbers = [...draftText.matchAll(new RegExp(`[${DIGIT}][${DIGIT},./-]{1,}`, 'g'))].map(
    (m) => m[0],
  );

  const invented = [...new Set(numbers)].filter((n) => {
    const ascii = toAsciiDigits(n);
    const bare = ascii.replace(/[^0-9]/g, '');
    if (bare.length < 2) return false;
    if (haystack.includes(ascii.toLowerCase())) return false;
    // Same digits, different punctuation — 06.08.2026 against 6 August 2026 is not invention.
    return !haystack.replace(/[^0-9a-z]/g, '').includes(bare);
  });

  return invented.length === 0 ? { ok: true } : { ok: false, invented };
}
