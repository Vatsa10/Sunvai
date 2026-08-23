/**
 * The citation guard is the thing standing between a citizen and a confident false
 * accusation, so it gets a check that fails loudly if it ever stops being exact.
 *
 *   pnpm tsx scripts/check-citation-guard.ts
 */

import assert from 'node:assert/strict';
import { checkCitations, requiresCitation } from '../src/lib/agents/citation-guard';
import { DEMO_CASES } from '../supabase/seed/demo-cases';

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

console.log('citation guard OK');
