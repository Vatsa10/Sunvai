/**
 * RFC 8785 (JCS) canonical JSON.
 *
 * This must produce byte-identical output to `jsonb_canonical()` in
 * supabase/migrations/06_ledger.sql. If the two ever diverge, receipts issued by the server
 * stop verifying in the browser and the verifier becomes a decoration.
 *
 * Accepted constraints, matching what the SQL side can guarantee:
 *   - object keys are ASCII (so byte order and UTF-16 code-unit order agree)
 *   - numbers are integers (no float formatting to disagree about)
 */

export type Canonical =
  | string
  | number
  | boolean
  | null
  | Canonical[]
  | { [k: string]: Canonical };

export function canonicalJson(value: Canonical): string {
  if (value === null) return 'null';

  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) throw new Error('canonicalJson: non-finite number');
      if (!Number.isInteger(value)) {
        throw new Error(`canonicalJson: non-integer ${value} — ledger payloads use integers`);
      }
      return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }

  const keys = Object.keys(value).sort(byCodeUnit);
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

/** Postgres `order by ... collate "C"` is a byte sort; for ASCII keys this matches. */
function byCodeUnit(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
