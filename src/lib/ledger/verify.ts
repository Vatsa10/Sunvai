/**
 * Receipt verification. One implementation, two runtimes: this file runs unchanged in Node
 * and in the browser, using WebCrypto in both (Node 18+ exposes globalThis.crypto.subtle).
 *
 * The citizen verifies their own receipt in their own browser. Our server is not asked, and
 * is not trusted. See 02-architecture/03-ledger.md.
 */

import { canonicalJson, type Canonical } from './canonical-json';

export const GENESIS_HASH = '0'.repeat(64);
export const RECEIPT_VERSION = 1;

export type LedgerEvent = {
  seq: number;
  type: string;
  occurred_at: string; // RFC3339, UTC, milliseconds — exactly as hashed
  payload: Canonical;
  prev_hash: string;
  hash: string;
};

export type Receipt = {
  sunvai_receipt_version: number;
  grievance_ref: string;
  generated_at: string;
  disclaimer: string;
  events: LedgerEvent[];
  head_hash: string;
};

export type VerifyResult =
  | { ok: true; count: number; linksChecked: number }
  | { ok: false; brokenAtSeq: number; reason: string };

/** The exact preimage the database hashes in ledger_append(). Keep the two in step. */
export function preimage(e: Pick<LedgerEvent, 'seq' | 'type' | 'occurred_at' | 'payload' | 'prev_hash'>): string {
  return [e.prev_hash, String(e.seq), e.type, e.occurred_at, canonicalJson(e.payload)].join('\n');
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyReceipt(receipt: Receipt): Promise<VerifyResult> {
  if (receipt?.sunvai_receipt_version !== RECEIPT_VERSION) {
    return { ok: false, brokenAtSeq: 0, reason: 'Not a Sunvai receipt, or a version we cannot read.' };
  }
  if (!Array.isArray(receipt.events) || receipt.events.length === 0) {
    return { ok: false, brokenAtSeq: 0, reason: 'This receipt has no events in it.' };
  }

  // A receipt is a SLICE of one shared chain — your case's entries, not everybody's. So the
  // events in it are usually not adjacent in the chain (seq 7 might be followed by seq 20,
  // with other people's cases in between). Two different things are therefore checkable, and
  // conflating them would be claiming more than we can show:
  //
  //   1. Every entry's own hash. This catches any edit to any entry, always.
  //   2. The link between two entries, but only where the receipt actually holds both sides
  //      of it — that is, where the sequence numbers are adjacent.
  //
  // What a slice cannot prove on its own is that nothing was removed from the gaps. Saying so
  // is on /how-this-works, next to the anchoring gap.
  let previous: LedgerEvent | null = null;
  let linksChecked = 0;

  for (const e of receipt.events) {
    let recomputed: string;
    try {
      recomputed = await sha256Hex(preimage(e));
    } catch {
      return { ok: false, brokenAtSeq: e.seq, reason: 'This step could not be read.' };
    }

    if (recomputed !== e.hash) {
      return { ok: false, brokenAtSeq: e.seq, reason: 'This step has been changed since it was recorded.' };
    }

    if (previous && e.seq === previous.seq + 1) {
      if (e.prev_hash !== previous.hash) {
        return { ok: false, brokenAtSeq: e.seq, reason: 'One step does not follow from the one before it.' };
      }
      linksChecked++;
    }

    previous = e;
  }

  if (previous && receipt.head_hash !== previous.hash) {
    return { ok: false, brokenAtSeq: previous.seq, reason: 'Steps have been removed from the end of this record.' };
  }

  return { ok: true, count: receipt.events.length, linksChecked };
}
