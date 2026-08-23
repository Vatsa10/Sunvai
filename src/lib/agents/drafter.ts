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
 * Every number in the draft must be traceable to something the citizen said. Runs before the
 * consent gate renders, and a failure stops the flow rather than annotating it.
 */
export function checkNumbersInSource(
  draftText: string,
  source: { narrative: string; facts: IntakeFacts },
): { ok: true } | { ok: false; invented: string[] } {
  const haystack = [
    source.narrative,
    JSON.stringify(source.facts),
  ]
    .join(' ')
    .toLowerCase();

  // Digit runs of two or more: years, amounts, claim numbers. Single digits are usually prose
  // ("two months"), and chasing them produces noise that trains people to ignore the guard.
  const numbers = [...draftText.matchAll(/\d[\d,./-]{1,}/g)].map((m) => m[0]);

  const invented = [...new Set(numbers)].filter((n) => {
    const bare = n.replace(/[^0-9]/g, '');
    if (bare.length < 2) return false;
    if (haystack.includes(n.toLowerCase())) return false;
    // Same digits, different punctuation — 06.08.2026 against 6 August 2026 is not invention.
    return !haystack.replace(/[^0-9a-z]/g, '').includes(bare);
  });

  return invented.length === 0 ? { ok: true } : { ok: false, invented };
}
