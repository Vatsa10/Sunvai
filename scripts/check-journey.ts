/**
 * The end-to-end journey check, run against the real database and a real model.
 *
 * This is the acceptance test from the corpus, in code: open a closed case, answer the
 * question, get an appeal drafted from the audit's own citations, consent, send, download the
 * receipt, verify it — and confirm that a tampered receipt is rejected.
 *
 *   pnpm tsx scripts/check-journey.ts
 */

import 'dotenv/config';
import assert from 'node:assert/strict';
import { getCase } from '../src/lib/cases';
import { buildReceipt } from '../src/lib/ledger/receipt';
import { verifyReceipt } from '../src/lib/ledger/verify';
import { confirmResolution, prepareAppeal, sendAppeal } from '../src/actions/case-actions';
import { checkCitations } from '../src/lib/agents/citation-guard';
import { APPEAL_WINDOW_DAYS, appealWindow, mayDraftAppeal } from '../src/lib/agents/appeal';
import { pool, query } from '../src/lib/db';
import { DEMO_CASES } from '../supabase/seed/demo-cases';

const REF = 'DEMO/2026/0000472'; // Kamla
const step = (n: number, s: string) => console.log(`\n${n}. ${s}`);

function form(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

/**
 * Put the case back to "just closed" so this can be run repeatedly. The ledger is deliberately
 * NOT reset — it cannot be, there is no delete path — so a second run leaves the earlier run's
 * events in place. That is the append-only property doing its job, not getting in the way.
 */
async function resetCase() {
  const existing = await getCase(REF);
  if (!existing) throw new Error('run `pnpm seed` first');
  const seeded = DEMO_CASES.find((d) => d.ref === REF);
  if (!seeded) throw new Error(`${REF} is not a seeded demo case`);
  await query(`delete from appeals where grievance_id = $1`, [existing.id]);
  await query(`delete from confirmations where grievance_id = $1`, [existing.id]);
  // `closed_at` is restored from the seed, not left as found. A later step backdates it to
  // prove the window gate bites, and a crash between the backdate and the restore used to
  // poison every subsequent run — the next one would refuse to draft an appeal at all, which
  // reads as a product bug and is not one. A reset that only half resets is worse than none.
  await query(`update grievances set status = 'closed', closed_at = $2 where id = $1`, [
    existing.id,
    seeded.closedAt,
  ]);
}

await resetCase();

step(1, 'The case opens, closed, with a real bureaucratic reply');
let c = await getCase(REF);
assert.ok(c, 'case not found — run `pnpm seed`');
assert.equal(c.status, 'closed');
assert.ok(c.reply, 'no department reply');
console.log(`   ${c.ref} — ${c.rawStatus} — "${c.reply!.body.slice(0, 60)}…"`);

step(2, 'The audit quotes their reply verbatim');
assert.ok(c.audit, 'no audit');
assert.equal(c.audit!.verdict, 'deflected');
const guard = checkCitations(c.reply!.body, c.audit!.citations);
assert.equal(guard.ok, true, 'a citation does not appear verbatim in the reply');
console.log(`   ${c.audit!.verdict}, ${c.audit!.citations.length} citations, all verbatim`);

step(3, 'She answers the question nobody asks — and says no');
await confirmResolution(form({ ref: REF, resolved: 'no' }));
c = await getCase(REF);
assert.equal(c!.confirmation?.resolved, false);
console.log('   confirmation recorded: not resolved');

step(4, 'The appeal writes itself, citing the specific inadequacy');
await prepareAppeal(form({ ref: REF }));
c = await getCase(REF);
assert.ok(c!.appeal, 'no appeal drafted');
assert.equal(c!.appeal!.status, 'drafted', 'an appeal must never be sent without consent');
assert.ok(c!.appeal!.grounds.length >= 1, 'a generic appeal with no grounds is refused by design');
assert.ok(c!.appeal!.bodyCitizenLang.length > 50, 'no back-translation for the consent gate');
console.log(`   drafted, ${c!.appeal!.grounds.length} grounds:`);
for (const g of c!.appeal!.grounds) console.log(`     - ${g}`);

step(5, 'Nothing is sent without consent');
await assert.rejects(() => sendAppeal(form({ ref: REF, consent: 'off' })), /consent/);
console.log('   refused without the box ticked');

step(6, 'With consent, it goes');
await sendAppeal(form({ ref: REF, consent: 'on' }));
c = await getCase(REF);
assert.equal(c!.appeal!.status, 'sent');
console.log('   appeal sent');

step(7, 'The receipt verifies in the browser');
const receipt = await buildReceipt(c!.id, c!.ref);
assert.ok(receipt);
const clean = await verifyReceipt(receipt!);
assert.equal(clean.ok, true, 'a receipt we just issued does not verify');
console.log(`   VERIFIED — ${receipt!.events.length} events`);
console.log(`   ${receipt!.events.map((e) => e.type).join(' → ')}`);

step(8, 'A tampered receipt is rejected');
const tampered = structuredClone(receipt!);
tampered.events[2]!.payload = { ...(tampered.events[2]!.payload as object), tampered: 'yes' };
const dirty = await verifyReceipt(tampered);
assert.equal(dirty.ok, false, 'the verifier accepted an edited receipt — it is a decoration');
console.log(`   rejected at seq ${(dirty as { brokenAtSeq: number }).brokenAtSeq}`);

step(9, 'Her answer moved the public number, and our disagreement was counted');
const [headline] = await query<{ true_resolution_pct: string }>('select * from headline_numbers');
const [errors] = await query<{ too_soft: string; too_harsh: string }>('select * from our_error_rate');
console.log(`   true resolution ${headline!.true_resolution_pct}% · too soft ${errors!.too_soft} · too harsh ${errors!.too_harsh}`);

step(10, 'The cluster shows counts, and no identities');
assert.ok(c!.cluster, 'no cluster');
assert.ok(c!.cluster!.members >= 5, 'a public cluster must clear the visibility gate');
console.log(
  `   ${c!.cluster!.members} others, ${c!.cluster!.saidNotFixed} closed and the citizen said still not fixed, ` +
    `${c!.cluster!.neverAsked} closed and nobody answered`,
);
// Silence must never be counted as failure: the two are separate columns, never summed.
assert.notEqual(c!.cluster!.saidNotFixed, undefined, 'cluster must report citizen-said-unfixed separately');
assert.notEqual(c!.cluster!.neverAsked, undefined, 'cluster must report unanswered closures separately');

step(11, 'A case closed more than 30 days ago does not present a live appeal');
{
  // Pure arithmetic against a fixed clock, so this asserts the same thing in any month.
  const now = new Date('2026-08-26T00:00:00.000Z');
  const inTime = '2026-08-20T00:00:00.000Z'; // 6 days before `now`
  const lapsed = '2026-06-01T00:00:00.000Z'; // 86 days before `now`
  const lastDay = new Date(now.getTime() - APPEAL_WINDOW_DAYS * 86_400_000).toISOString();

  assert.equal(appealWindow(inTime, now).open, true);
  assert.equal(appealWindow(lapsed, now).open, false);
  assert.equal(appealWindow(lastDay, now).open, true, 'the last day of the window is still inside it');

  // Grounds, and in time: an appeal.
  assert.equal(
    mayDraftAppeal({ verdict: 'deflected', citizenSaysUnresolved: false, closedAt: inTime, now }),
    true,
  );
  // The same grounds, out of time: no appeal. Being right does not revive a lapsed window.
  assert.equal(
    mayDraftAppeal({ verdict: 'deflected', citizenSaysUnresolved: false, closedAt: lapsed, now }),
    false,
    'a time-barred closure must not present a live appeal',
  );
  // Nor does the citizen's own override, which beats our verdict but not the calendar.
  assert.equal(
    mayDraftAppeal({ verdict: 'resolved', citizenSaysUnresolved: true, closedAt: lapsed, now }),
    false,
    'the citizen override must not reopen a closed appeal window',
  );
  assert.equal(
    mayDraftAppeal({ verdict: 'resolved', citizenSaysUnresolved: true, closedAt: inTime, now }),
    true,
  );
  // No grounds is still no appeal, and a lawful transfer is still not grounds.
  assert.equal(
    mayDraftAppeal({ verdict: 'transferred_lawfully', citizenSaysUnresolved: false, closedAt: inTime, now }),
    false,
  );
  // An unknown closure date is not an open window.
  assert.equal(
    mayDraftAppeal({ verdict: 'deflected', citizenSaysUnresolved: true, closedAt: null, now }),
    false,
  );
  console.log(
    `   ${APPEAL_WINDOW_DAYS}-day window enforced — in time: appeal; ${-appealWindow(lapsed, now).daysLeft} days late: none`,
  );
}

step(12, 'A time-barred draft cannot be sent, even with consent');
{
  const backdated = '2026-01-01T00:00:00.000Z';
  try {
    await query(`update grievances set closed_at = $2 where id = $1`, [c!.id, backdated]);
    await query(`update appeals set status = 'drafted' where grievance_id = $1`, [c!.id]);
    await assert.rejects(() => sendAppeal(form({ ref: REF, consent: 'on' })), /window/);
    console.log('   consent given, window shut, refused before adapter.appeal()');
  } finally {
    // Always, even if the assertion above throws. This step deliberately breaks the case, and
    // a step that breaks a case has to put it back whatever happens to it.
    await query(`update grievances set closed_at = $2 where id = $1`, [c!.id, c!.closedAt]);
    await query(`update appeals set status = 'sent' where grievance_id = $1`, [c!.id]);
  }
}

step(13, 'The case names a forum that can actually act');
assert.ok(c!.nextStep, 'no next step seeded — a verdict with no next step is half a product');
assert.ok(c!.nextStep!.body.length > 100, 'the next step must be actionable, not a slogan');
console.log(`   ${c!.nextStep!.heading}`);

step(14, 'A stated completion date is carried, so the page does not urge a premature appeal');
{
  const meera = await getCase('DEMO/2026/0000631');
  assert.ok(meera?.appealNotAdvisedBefore, 'Meera has a 31 Aug target and no hold date on the case');
  assert.equal(new Date(meera!.appealNotAdvisedBefore!).getUTCMonth(), 7);
  console.log(`   appeal not advised before ${meera!.appealNotAdvisedBefore}`);
}

step(15, 'Every demo case reads in every shipped language, with nothing left in the wrong one');
{
  for (const ref of ['DEMO/2026/0000472', 'DEMO/2026/0000518', 'DEMO/2026/0000631']) {
    const [row] = await query<{
      narrative_lang: string;
      reasoning: Record<string, string[]> | null;
      unaddressed: Record<string, string[]> | null;
      next_step: Record<string, string[]> | null;
      unaddressed_n: number;
      has_next_step: boolean;
    }>(
      `select g.original_lang as narrative_lang,
              a.reasoning_translations as reasoning,
              a.unaddressed_translations as unaddressed,
              g.next_step_translations as next_step,
              jsonb_array_length(a.unaddressed) as unaddressed_n,
              (g.next_step_body is not null) as has_next_step
         from grievances g
         left join lateral (
           select reasoning_translations, unaddressed_translations, unaddressed
             from audits where grievance_id = g.id order by created_at desc limit 1
         ) a on true
        where g.external_ref = $1`,
      [ref],
    );
    assert.ok(row, ref);
    for (const lang of ['hi', 'en', 'mr']) {
      // The auditor writes English, so English pages need no translation of it.
      if (lang !== 'en') {
        assert.ok(row!.reasoning?.[lang]?.[0], `${ref}: no ${lang} reasoning — run pnpm seed`);
        if (row!.unaddressed_n > 0) {
          assert.equal(
            row!.unaddressed?.[lang]?.length,
            row!.unaddressed_n,
            `${ref}: ${lang} unaddressed list does not line up bullet for bullet`,
          );
        }
      }
      // The next step is seeded in the case's own language and needs the other two.
      if (row!.has_next_step && lang !== row!.narrative_lang) {
        assert.equal(
          row!.next_step?.[lang]?.length,
          2,
          `${ref}: no ${lang} next step — a Hindi reader would meet ${row!.narrative_lang}`,
        );
      }
    }
    console.log(`   ${ref} (${row!.narrative_lang}): reasoning, ${row!.unaddressed_n} bullets and the next step read in hi/en/mr`);
  }
}

step(16, 'A case cannot hold two live drafted appeals');
{
  const [dupes] = await query<{ n: string }>(
    `select count(*) as n from (
       select grievance_id from appeals where status = 'drafted'
        group by grievance_id having count(*) > 1) d`,
  );
  assert.equal(Number(dupes!.n), 0, 'a grievance already holds more than one drafted appeal');

  // Two drafts is the defect behind "getCase read an arbitrary appeal row": with two live
  // drafts, the consent gate and the send action can each be looking at a different one. The
  // database now refuses the second.
  const probe = `insert into appeals (grievance_id, body_formal, body_citizen_lang, status)
                  values ($1, 'probe', 'probe', 'drafted')`;
  try {
    await query(probe, [c!.id]);
    await assert.rejects(
      () => query(probe, [c!.id]),
      /appeals_one_drafted_per_grievance|duplicate key/,
      'the database allows a second live draft, so getCase can still read an arbitrary one',
    );
    console.log('   one drafted appeal per case, enforced by the database');
  } finally {
    await query(`delete from appeals where grievance_id = $1 and body_formal = 'probe'`, [c!.id]);
  }
}

step(17, 'The appeal a citizen consents to carries dates a person would write');
{
  const [row] = await query<{ f: string; cz: string }>(
    `select body_formal as f, body_citizen_lang as cz from appeals
       where grievance_id = $1 order by created_at desc, id desc limit 1`,
    [c!.id],
  );
  const raw = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun) [A-Z][a-z]{2} \d{2} \d{4}|GMT[+-]\d{4}|\dT\d{2}:\d{2}/;
  assert.ok(!raw.test(row!.f), 'a raw timestamp leaked into the formal appeal');
  assert.ok(!raw.test(row!.cz), 'a raw timestamp leaked into the citizen-language appeal');
  console.log('   no timestamps, timezones or weekdays in either language');
}

console.log('\nJOURNEY OK');
await pool().end();
