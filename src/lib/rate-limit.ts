/**
 * A demo-scale guard on the one feature that spends money per click.
 *
 * The paste box runs a reasoning model on whatever it is given. Without a throttle, one person
 * with a loop empties the key, and every reviewer who arrives after them finds the only
 * interactive thing on the site broken — with no way to tell that it ever worked.
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

export const PER_MINUTE = 5;
export const PER_DAY = 40;

/** Keep the map from growing without bound on a long-lived instance. */
const MAX_KEYS = 5_000;

export type RateVerdict = { ok: true } | { ok: false; message: string };

export function checkRateLimit(key: string, now = Date.now()): RateVerdict {
  if (BUCKETS.size > MAX_KEYS) BUCKETS.clear();

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
  return { ok: true };
}

/** Test seam. Never called from the app. */
export function __resetRateLimit(): void {
  BUCKETS.clear();
}
