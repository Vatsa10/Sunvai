/**
 * Runs the real Closure Auditor over the six example chips and commits the verdicts.
 *
 * Same job as `scripts/audit-demo-cases.ts` does for the three demo cases, for a different
 * reason. The demo-case fixture exists so the headline path survives an OpenAI outage. This one
 * exists because the chips are fixed inputs and a reviewer with 250 submissions will not wait
 * eight to thirteen seconds to find out that a button works. The six pairs never change between
 * one click and the next, so their audits can be produced once, here, and served instantly.
 *
 * Two things keep that from being a lie:
 *
 *   1. Every field in the fixture came out of a real `audit()` call over the exact text on the
 *      chip — same model, same prompt version, same citation guard, no editing afterwards.
 *      The citations are therefore still verbatim substrings of the reply the reader can see.
 *   2. The result carries `precomputed: true` all the way to the screen, and the box says so
 *      on the verdict itself. Nothing about a pre-computed result is inferred from silence.
 *
 * Run it at the API default reasoning effort, always. The fixture has to be what the audited
 * configuration produces, not a cheaper one.
 *
 *   pnpm tsx scripts/precompute-chip-audits.ts
 */

import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'node:fs';
import { audit } from '../src/lib/agents/closure-auditor';
import { checkCitations } from '../src/lib/agents/citation-guard';
import { TRY_EXAMPLES } from '../src/lib/try-examples';

const out: Record<string, unknown> = {};
let broken = 0;

for (const e of TRY_EXAMPLES) {
  process.stdout.write(`\n${e.system} — “${e.string}”\n`);

  // The paste box builds its dates from the adapter's SLA at request time. Those dates only
  // reach the model as "closed N days after filing", so pinning them here to the same 21-day
  // gap keeps the fixture describing the same situation the live path would describe.
  const now = Date.now();
  const outcome = await audit({
    narrative_original: e.complaint,
    narrative_lang: 'en',
    reply_body: e.reply,
    reply_lang: 'en',
    filed_at: new Date(now - 21 * 86_400_000).toISOString(),
    closed_at: new Date(now).toISOString(),
    sla_days: 21,
  });

  // Re-run the guard over what we are about to commit. `audit()` already did this, but a
  // fixture is read months after it was written and the failure we are guarding against is a
  // quote that no longer matches the chip text — the one defect that would make a pre-computed
  // result actively dishonest rather than merely stale.
  const guard = checkCitations(e.reply, outcome.result.citations);
  const ok = outcome.result.citations.length === 0 || guard.ok;
  if (!ok) broken++;

  console.log(`  verdict     : ${outcome.result.verdict}  confidence ${outcome.result.confidence}`);
  console.log(`  citations   : ${outcome.result.citations.length}, verified=${outcome.citationsVerified}, guard retries=${outcome.guardFailures}`);
  console.log(`  re-checked  : ${ok ? 'every quote is still a verbatim substring of the chip' : 'QUOTE DOES NOT MATCH — not committing'}`);
  console.log(`  reasoning   : ${outcome.result.reasoning}`);

  out[e.id] = {
    // Committed so a reader of the file can see which text produced this without cross-
    // referencing, and so `check-journey` can prove the fixture still matches the chip.
    complaint: e.complaint,
    reply: e.reply,
    computedAt: new Date().toISOString(),
    ...outcome,
  };
}

if (broken > 0) {
  console.error(`\n${broken} chip audit(s) quoted text that is not in the reply. Nothing written.`);
  process.exit(1);
}

mkdirSync('evals/fixtures', { recursive: true });
writeFileSync('evals/fixtures/chip-audits.json', JSON.stringify(out, null, 2) + '\n');
console.log(`\nwrote evals/fixtures/chip-audits.json — ${TRY_EXAMPLES.length} chips`);
