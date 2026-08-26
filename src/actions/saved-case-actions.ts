'use server';

import { getCase } from '@/lib/cases';
import { isDbUnavailable } from '@/lib/db';
import { fixtureCase } from '@/lib/fixture-cases';

/**
 * Hydrating one entry of the on-device case list.
 *
 * The device remembers a reference and a subject; it does not remember whether the case still
 * opens. This checks one reference through the same read layer the case page uses, so a stale
 * or unopenable entry can be shown as exactly that rather than as a link into a 404.
 *
 * One reference per call, on purpose. The database this runs on pauses when idle, and a single
 * batch call would make the whole list fail together on the first click of the day. Per item,
 * a failure costs one muted row.
 */

export type SavedCaseStatus =
  | { ok: true; ref: string; subject: string | null }
  | { ok: false };

export async function lookupSavedCase(ref: string): Promise<SavedCaseStatus> {
  const needle = ref.trim();
  if (!needle) return { ok: false };
  try {
    let c = null;
    try {
      c = await getCase(needle);
    } catch (err) {
      // Only an unreachable database falls back to the committed copies — the same rule the
      // case page and Door A hold to. A broken query is still a real error.
      if (!isDbUnavailable(err)) throw err;
      c = fixtureCase(needle);
    }
    if (!c) return { ok: false };
    return { ok: true, ref: c.ref, subject: c.subject };
  } catch {
    // Anything else at all: this one row says it could not be opened right now. It does not
    // get to take the rest of the list, or the landing page, down with it.
    return { ok: false };
  }
}
