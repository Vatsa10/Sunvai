/**
 * The citation guard is the thing standing between a citizen and a confident false
 * accusation, so it gets a check that fails loudly if it ever stops being exact.
 *
 *   pnpm tsx scripts/check-citation-guard.ts
 */

import assert from 'node:assert/strict';
import { checkCitations, requiresCitation } from '../src/lib/agents/citation-guard';
import { DEMO_CASES } from '../supabase/seed/demo-cases';
import { TRY_EXAMPLES, matchExample } from '../src/lib/try-examples';
import { chipAudit } from '../src/lib/chip-audits';

const reply = DEMO_CASES[0]!.reply.body;

// A verbatim span passes and reports where it sits, so the UI can highlight it in place.
const exact = checkCitations(reply, [{ quote: 'forwarded to the concerned disbursing authority' }]);
assert.equal(exact.ok, true);
assert.ok(exact.ok && reply.slice(exact.spans[0]!.start, exact.spans[0]!.end) === exact.spans[0]!.quote);

// A paraphrase does not pass, however true it sounds.
assert.equal(checkCitations(reply, [{ quote: 'forwarded to the disbursing authority' }]).ok, false);

// Neither does a quote with its whitespace tidied — replies are stored verbatim precisely so
// that "close enough" cannot creep in here.
assert.equal(checkCitations(reply, [{ quote: 'The  matter has been forwarded' }]).ok, false);

// Devanagari that differs only by Unicode normalisation form is the same quote.
const nfd = 'क़लम'.normalize('NFD');
assert.equal(checkCitations(`प्रकरण ${nfd} में है`, [{ quote: 'क़लम'.normalize('NFC') }]).ok, true);

// One bad quote among good ones fails the whole set: partial evidence is not evidence.
assert.equal(
  checkCitations(reply, [{ quote: 'The matter has been forwarded' }, { quote: 'never written' }]).ok,
  false,
);

// Only `undetermined` may stand without evidence.
assert.equal(requiresCitation('deflected'), true);
assert.equal(requiresCitation('resolved'), true);
assert.equal(requiresCitation('undetermined'), false);

// ---------------------------------------------------------------------------------------
// The paste box's committed chip audits, held to the same rule as a live one.
//
// Those six verdicts are served without a model call, so nothing at request time re-checks
// their quotes. That check has to live somewhere, and it lives here: if a chip's text is ever
// edited without re-running `scripts/precompute-chip-audits.ts`, this fails rather than the
// landing page quietly showing a reader a quote that is not in the text in front of them.

for (const e of TRY_EXAMPLES) {
  const cached = chipAudit(e.id);
  // A missing entry is allowed — `auditText` falls through to the live model for it. What is
  // not allowed is an entry that no longer describes the chip.
  if (!cached) continue;

  assert.equal(cached.complaint, e.complaint, `chip ${e.id}: committed complaint has drifted from the chip`);
  assert.equal(cached.reply, e.reply, `chip ${e.id}: committed reply has drifted from the chip`);

  if (cached.result.citations.length > 0) {
    const guard = checkCitations(e.reply, cached.result.citations);
    assert.ok(guard.ok, `chip ${e.id}: a committed quote is not a verbatim substring of the chip`);
  }
  if (requiresCitation(cached.result.verdict)) {
    assert.ok(cached.citationsVerified, `chip ${e.id}: committed a verdict whose citations were never verified`);
  }

  // And the fixture is only reachable through an exact match on both fields, so prove that the
  // lookup the server does actually finds it.
  assert.equal(matchExample(e.complaint, e.reply), e.id);
  assert.equal(matchExample(e.complaint, e.reply + '.'), null);
  assert.equal(matchExample(e.complaint.slice(0, -1), e.reply), null);
}

console.log('citation guard OK');
console.log(`   plus ${TRY_EXAMPLES.filter((e) => chipAudit(e.id)).length} committed chip audit(s) still quoting their own text`);
