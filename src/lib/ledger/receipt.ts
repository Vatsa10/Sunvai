import { query } from '../db';
import { GENESIS_HASH, RECEIPT_VERSION, type Receipt, type LedgerEvent } from './verify';

/**
 * The citizen's copy. They keep it; we cannot alter it after the fact; and they can check it
 * without asking us anything. That last part is the whole point — a receipt you have to bring
 * back to us to validate is not a receipt, it is a login.
 */
export async function buildReceipt(grievanceId: string, ref: string): Promise<Receipt | null> {
  const rows = await query<{
    seq: string; type: string; occurred_at: string; payload: unknown; prev_hash: string; hash: string;
  }>(
    `select seq, type,
            to_char(occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as occurred_at,
            payload, prev_hash, hash
       from events where grievance_id = $1 order by seq`,
    [grievanceId],
  );
  if (rows.length === 0) return null;

  const events: LedgerEvent[] = rows.map((r) => ({
    seq: Number(r.seq),
    type: r.type,
    occurred_at: r.occurred_at,
    payload: r.payload as LedgerEvent['payload'],
    prev_hash: r.prev_hash,
    hash: r.hash,
  }));

  return {
    sunvai_receipt_version: RECEIPT_VERSION,
    grievance_ref: ref,
    generated_at: new Date().toISOString(),
    disclaimer: 'Demo data. Not a government record.',
    events,
    head_hash: events.at(-1)?.hash ?? GENESIS_HASH,
  };
}
