/**
 * The load-bearing check: hashes computed by Postgres must be reproducible by the code that
 * runs in a citizen's browser. If these two ever drift, every receipt we issue fails to
 * verify and the verifier becomes a decoration.
 *
 *   pnpm tsx scripts/check-ledger-parity.ts <chain.json>
 *
 * where chain.json is the output of the ledger self-test query (see the README).
 */

import { readFileSync } from 'node:fs';
import { preimage, sha256Hex, successCopy, verifyReceipt, GENESIS_HASH, RECEIPT_VERSION } from '../src/lib/ledger/verify';
import type { LedgerEvent } from '../src/lib/ledger/verify';

const path = process.argv[2];
if (!path) {
  console.error('usage: tsx scripts/check-ledger-parity.ts <chain.json>');
  process.exit(2);
}

const events = JSON.parse(readFileSync(path, 'utf8')) as LedgerEvent[];

let failures = 0;

for (const e of events) {
  const recomputed = await sha256Hex(preimage(e));
  const ok = recomputed === e.hash;
  if (!ok) failures++;
  console.log(`seq ${e.seq}  ${ok ? 'match' : 'MISMATCH'}`);
  if (!ok) {
    console.log(`  postgres : ${e.hash}`);
    console.log(`  typescript: ${recomputed}`);
    console.log(`  preimage  : ${JSON.stringify(preimage(e))}`);
  }
}

// And the whole-receipt path, including the negative case: a tampered receipt must fail.
const receipt = {
  sunvai_receipt_version: RECEIPT_VERSION,
  grievance_ref: 'DEMO/SELFTEST',
  generated_at: new Date().toISOString(),
  disclaimer: 'Demo data. Not a government record.',
  events,
  head_hash: events.at(-1)?.hash ?? GENESIS_HASH,
};

const clean = await verifyReceipt(receipt);
console.log('clean receipt   :', clean.ok ? 'VERIFIED' : `BROKEN — ${clean.reason}`);

const tampered = structuredClone(receipt);
tampered.events[0]!.occurred_at = '2020-01-01T00:00:00.000Z';
const dirty = await verifyReceipt(tampered);
console.log('tampered receipt:', dirty.ok ? 'VERIFIED (BAD — the guard is not working)' : `rejected at seq ${dirty.brokenAtSeq}`);

// The honest boundary. A receipt is a slice of one shared chain, so a truncated receipt is
// still internally consistent and MUST verify — that is the algorithm behaving correctly, not
// a hole. What must never happen is the copy beside that green tick claiming the record is
// complete. successCopy() is the only text /verify renders on a pass (verify/page.tsx calls it
// for both lines of the success box), so asserting on it here reaches the real claim.
const truncated = structuredClone(receipt);
if (truncated.events.length > 2) {
  truncated.events = [truncated.events[0]!, truncated.events.at(-1)!];
}
const cut = await verifyReceipt(truncated);
console.log('truncated receipt:', cut.ok ? `VERIFIED (expected — a slice cannot see its own gaps)` : `rejected — ${cut.reason}`);

let copyOk = true;
if (cut.ok) {
  const { headline, scope } = successCopy(cut);
  const words = `${headline} ${scope}`.toLowerCase();
  const forbidden = ['unaltered', 'complete', 'nothing was removed', 'whole record', 'full history', 'tamper-proof', 'immutable'];
  const found = forbidden.filter((w) => words.includes(w));
  const admitsGaps = scope.includes('removed from between');
  if (found.length > 0) {
    copyOk = false;
    console.log(`  BAD — success copy overclaims: ${found.join(', ')}`);
  }
  if (!admitsGaps) {
    copyOk = false;
    console.log('  BAD — success copy does not disclose that removals from the gaps are unprovable');
  }
  if (copyOk) console.log(`  copy discloses the gap: ${JSON.stringify(scope)}`);
} else {
  copyOk = false;
  console.log('  BAD — a truncated slice should still verify; the algorithm has been weakened');
}

const pass = failures === 0 && clean.ok && !dirty.ok && copyOk;
console.log(pass ? '\nPARITY OK' : '\nPARITY FAILED');
process.exit(pass ? 0 : 1);
