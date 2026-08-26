/**
 * The one thing on this device that remembers a case.
 *
 * Sunvai's premise is that the citizen comes back weeks later, after a department has closed
 * their grievance. Until now nothing here remembered anything: after Door B filed a case the
 * reference existed only in the URL, and Door A asked people to type a number they were never
 * told to write down. That is the whole hole.
 *
 * It is deliberately the smallest possible store — reference, subject, when we saved it — and
 * it lives only in this browser. No account, no sync, no row anywhere. That is a real
 * limitation (clear the browser and the list is gone) and we say so on screen rather than
 * implying a durability we do not have.
 *
 * Every access is wrapped, in the same shape as `src/components/TextSize.tsx`: a private
 * window, blocked site data or a quota error must degrade to *no list*, never to a broken
 * landing page.
 */

const KEY = 'sunvai:cases';
const CAP = 10;

export type SavedCase = {
  ref: string;
  subject: string;
  /** ISO timestamp. Used only for ordering; never shown as a claim about the case itself. */
  savedAt: string;
};

function isSavedCase(v: unknown): v is SavedCase {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.ref === 'string' && o.ref.trim() !== '' && typeof o.subject === 'string' && typeof o.savedAt === 'string';
}

/** Everything we have on this device, newest first. Any failure at all means an empty list. */
export function readSavedCases(): SavedCase[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedCase).slice(0, CAP);
  } catch {
    // Private window, blocked site data, or a value some other version of us wrote. There is
    // nothing to recover and nothing to warn about: the caller renders no list.
    return [];
  }
}

/**
 * Remember a case. Deduped on the reference, newest first, capped at ten.
 *
 * Returns nothing and throws nothing: a device that cannot store this must still be able to
 * file a grievance and read the verdict, which are the parts that matter.
 */
export function saveCase(entry: { ref: string; subject?: string | null }): void {
  const ref = entry.ref?.trim();
  if (!ref) return;
  try {
    const next: SavedCase[] = [
      { ref, subject: (entry.subject ?? '').trim(), savedAt: new Date().toISOString() },
      ...readSavedCases().filter((c) => c.ref.toUpperCase() !== ref.toUpperCase()),
    ].slice(0, CAP);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Not remembered on this device. The case itself is unaffected — it is filed, and the
    // reference is on the screen the citizen is looking at.
  }
}
