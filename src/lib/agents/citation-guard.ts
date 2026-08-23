/**
 * The citation guard.
 *
 * If the model cannot quote it, the model is not allowed to claim it. Every citation must be
 * a verbatim substring of the department's reply. Whitespace is NOT normalised away —
 * replies.body is stored exactly as received precisely so this check can be exact. Only
 * Unicode NFC normalisation is applied, because the same Devanagari string can arrive in two
 * encodings and that is an encoding difference, not a different quote.
 */

export type GuardResult =
  | { ok: true; spans: { quote: string; start: number; end: number }[] }
  | { ok: false; failed: string[] };

export function checkCitations(replyBody: string, citations: { quote: string }[]): GuardResult {
  const haystack = replyBody.normalize('NFC');
  const spans: { quote: string; start: number; end: number }[] = [];
  const failed: string[] = [];

  for (const { quote } of citations) {
    const needle = quote.normalize('NFC');
    const start = haystack.indexOf(needle);
    if (start === -1) {
      failed.push(quote);
      continue;
    }
    spans.push({ quote, start, end: start + needle.length });
  }

  return failed.length > 0 ? { ok: false, failed } : { ok: true, spans };
}

/**
 * A negative verdict with no quoted evidence is an accusation with nothing behind it, and we
 * reject it outright rather than showing it to a citizen.
 */
export function requiresCitation(verdict: string): boolean {
  return verdict !== 'undetermined';
}
