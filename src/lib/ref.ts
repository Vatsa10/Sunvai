/**
 * Telling a typo apart from the product's boundary.
 *
 * Every case here carries a DEMO/ reference. When someone types the registration number of a
 * complaint they actually filed, the honest answer is not "we could not find that number" —
 * that reads as a bug in us. The truth is that we have no connection to the live grievance
 * portal, we will not have one without an access agreement, and no amount of retyping will
 * change it. Saying that plainly costs the person one paragraph instead of ten minutes.
 */

export function isDemoRef(ref: string): boolean {
  return ref.trim().toUpperCase().startsWith('DEMO/');
}

/**
 * Does this look like a registration number from a real system rather than a slip of the
 * keyboard? Real ones are long, carry digits, and are usually slash- or dash-separated with a
 * four-digit year in them. We are deliberately generous: telling someone the truth about our
 * boundary is never harmful, and the fallback message still points at the examples.
 */
export function looksLikeLiveRef(ref: string): boolean {
  const r = ref.trim().toUpperCase();
  if (!r || isDemoRef(r)) return false;
  const digits = (r.match(/\d/g) ?? []).length;
  if (r.length < 8 || digits < 5) return false;
  return /^[A-Z0-9/\-]+$/.test(r);
}
