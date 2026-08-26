/**
 * A demo-scale guard on the one feature that spends money per click.
 *
 * The paste box runs a reasoning model on whatever it is given. Without a throttle, one person
 * with a loop empties the key, and every reviewer who arrives after them finds the only
 * interactive thing on the site broken — with no way to tell that it ever worked.
 *
 * Two ceilings, because they defend against different things. The per-IP one keeps an honest
 * visitor from leaning on the button; it is keyed on `x-forwarded-for`, whose first hop is
 * written by the client off a trusted proxy, so anyone willing to rotate that header walks
 * straight past it. The process-wide one is the ceiling that actually protects the API key: it
 * does not care who is asking, so there is nothing to rotate.
 *
 * Deliberately in memory and deliberately small. This state lives in one server instance: it
 * resets on deploy and it does not add up across instances, so on a multi-instance deployment
 * the real ceiling is this number times the instance count. That is fine for a demo and is not
 * what you would ship — that wants a shared store and a token bucket per key, not per IP. It is
 * written down here so nobody later mistakes this for the real thing.
 */

type Bucket = { minute: number[]; day: number[] };

const BUCKETS = new Map<string, Bucket>();

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

/**
 * Ten, because the paste box now carries six sourced examples and the whole point of them is
 * that one person clicks through all six to watch a single engine read a terminal string from
 * six different systems. At five, the sixth click — on the feature designed to be clicked six
 * times — was refused by our own guard. Ten leaves room for all six plus a few pastes of the
 * reader's own. Loosening this costs nothing that matters: the ceiling that actually protects
 * the key is GLOBAL_PER_DAY, which is keyed on nothing and so cannot be walked past. This one
 * only stops a single impatient person leaning on the button.
 */
export const PER_MINUTE = 10;
export const PER_DAY = 40;
/**
 * Everyone, together, in a rolling day. Sized so the three demo cases plus a few hundred
 * curious pastes cost less than the key is worth, and so no single visitor can spend it all
 * even if they defeat the per-IP key entirely.
 */
export const GLOBAL_PER_DAY = 300;

/** Keep the map from growing without bound on a long-lived instance. */
const MAX_KEYS = 5_000;

export type RateVerdict = { ok: true } | { ok: false; message: string };

/** The process-wide window. Not keyed on anything a caller can change. */
let GLOBAL: number[] = [];

export function checkRateLimit(key: string, now = Date.now()): RateVerdict {
  if (BUCKETS.size > MAX_KEYS) BUCKETS.clear();

  GLOBAL = GLOBAL.filter((t) => now - t < DAY_MS);
  if (GLOBAL.length >= GLOBAL_PER_DAY) {
    return {
      ok: false,
      message:
        'This box has been used as much as we can afford today, across everybody. It runs a real model call each time and the budget behind it is one person’s. The three demo cases still work, and every verdict on them was produced by the same auditor. It resets tomorrow.',
    };
  }

  const b = BUCKETS.get(key) ?? { minute: [], day: [] };
  b.minute = b.minute.filter((t) => now - t < MINUTE_MS);
  b.day = b.day.filter((t) => now - t < DAY_MS);

  if (b.minute.length >= PER_MINUTE) {
    BUCKETS.set(key, b);
    return {
      ok: false,
      message:
        'That is a few too many in a row. Every one of these runs a real model call, and we are keeping the key alive for the next person. Wait a minute and try again.',
    };
  }
  if (b.day.length >= PER_DAY) {
    BUCKETS.set(key, b);
    return {
      ok: false,
      message:
        'You have used today\u2019s allowance for this box. It is a small one on purpose — this runs a real model call each time. The three demo cases below still work, and the allowance resets tomorrow.',
    };
  }

  b.minute.push(now);
  b.day.push(now);
  BUCKETS.set(key, b);
  GLOBAL.push(now);
  return { ok: true };
}

/** Test seam. Never called from the app. */
export function __resetRateLimit(): void {
  BUCKETS.clear();
  GLOBAL = [];
}
