/**
 * Two things Door B promises that were silently not happening.
 *
 *   pnpm tsx scripts/check-doorb-guards.ts
 *
 * 1. A citizen who overrides our routing gets that recorded. `routerOverridden` was hardcoded
 *    false at the call site, so the `routing_overridden_by_citizen` event fired for nobody.
 *    The product's claim is that if it is not in the ledger it did not happen; a disagreement
 *    with our own router is exactly the kind of fact we said we would keep.
 * 2. The numbers guard sees Devanagari digits. It is the only thing between a citizen and an
 *    invented amount filed under her name, and it was ASCII-only — off in two of the three
 *    languages we claim to ship properly.
 */

import 'dotenv/config';
import assert from 'node:assert/strict';
import { checkNumbersInSource } from '../src/lib/agents/drafter.js';
import { fileGrievance } from '../src/actions/file-actions.js';
import { getCase, getTimeline } from '../src/lib/cases.js';
import { query } from '../src/lib/db.js';

const OVERRIDE_EVENT = 'routing_overridden_by_citizen';

// ---------------------------------------------------------------------------
// 1. The numbers guard, in both scripts.
// ---------------------------------------------------------------------------

const said = (narrative: string) => ({ narrative, facts: {} });

// ASCII, unchanged behaviour: a number she said passes, one she did not is blocked.
assert.equal(checkNumbersInSource('Pension of 5000 stopped in 2026.', said('मुझे 5000 रुपये की पेंशन 2026 से नहीं मिली')).ok, true);
const asciiBad = checkNumbersInSource('Pension of 8500 stopped.', said('मुझे पेंशन नहीं मिली'));
assert.equal(asciiBad.ok, false);
assert.deepEqual(asciiBad.ok === false && asciiBad.invented, ['8500']);

// Devanagari in the draft, and she never said it. This is the case that used to slip through.
const devBad = checkNumbersInSource('पेंशन ५,००० रुपये अगस्त २०२६ से बंद है।', said('मेरी पेंशन बंद हो गई है, कुछ महीने हो गए'));
assert.equal(devBad.ok, false, 'Devanagari digits she never said must block the gate');
assert.deepEqual(devBad.ok === false && devBad.invented, ['५,०००', '२०२६']);
// Quoted back in the script she is reading, not transliterated at her.
assert.ok(devBad.ok === false && devBad.invented.every((n) => /[०-९]/.test(n)));

// Devanagari in the draft that she did say, in either script, is not invention.
assert.equal(checkNumbersInSource('पेंशन ५००० रुपये।', said('मुझे ५००० रुपये मिलते थे')).ok, true, 'same script');
assert.equal(checkNumbersInSource('पेंशन ५००० रुपये।', said('मुझे 5000 रुपये मिलते थे')).ok, true, 'she typed ASCII, draft used Devanagari');
assert.equal(checkNumbersInSource('Pension of 5000.', said('मुझे ५००० रुपये मिलते थे')).ok, true, 'she spoke Devanagari, draft used ASCII');
// A thousands separator does not turn an amount she gave into one she did not.
assert.equal(checkNumbersInSource('पेंशन ५,००० रुपये।', said('मुझे ५००० रुपये मिलते थे')).ok, true, 'same digits, different punctuation');

console.log('1. numbers guard: ASCII and Devanagari both checked, both directions, script preserved in the error');

// ---------------------------------------------------------------------------
// 2. The override event fires when, and only when, a citizen overrode us.
// ---------------------------------------------------------------------------

const depts = await query<{ id: string }>(`select id from departments order by id limit 2`);
assert.ok(depts.length >= 2, 'need two departments to override between — run `pnpm seed`');
const office = await query<{ id: string }>(`select id from offices where department_id = $1 limit 1`, [depts[1]!.id]);

async function file(overridden: boolean) {
  const { ref } = await fileGrievance({
    narrative: 'Guard check filing.',
    lang: 'hi',
    name: 'Guard Check',
    departmentId: depts[1]!.id,
    officeId: office[0]?.id ?? null,
    formalText: 'Guard check filing.',
    citizenLangText: 'जाँच के लिए दर्ज।',
    subject: `Door B guard check (${overridden ? 'overridden' : 'normal'})`,
    consented: true,
    routerReasoning: 'guard check',
    routerOverridden: overridden,
  });
  const c = await getCase(ref);
  const types = (await getTimeline(c!.id)).map((e) => e.type);
  return { ref, types };
}

const normal = await file(false);
assert.ok(!normal.types.includes(OVERRIDE_EVENT), `a normal filing must not record ${OVERRIDE_EVENT}`);
console.log(`2. normal filing   ${normal.ref} → ${normal.types.join(' → ')}`);

const forced = await file(true);
assert.ok(forced.types.includes(OVERRIDE_EVENT), `an overridden filing must record ${OVERRIDE_EVENT}`);
console.log(`   overridden filing ${forced.ref} → ${forced.types.join(' → ')}`);

console.log('\nDOOR B GUARDS OK');
process.exit(0);
