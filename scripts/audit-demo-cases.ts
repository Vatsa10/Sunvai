/**
 * Runs the Closure Auditor over the three demo cases and writes the results to
 * evals/fixtures/precomputed-audits.json.
 *
 * Two jobs. It is the exit test for the auditor — the verdicts and the citation guard have to
 * come out right on cases we know the answer to. And its output is committed, so the demo
 * still works with the OpenAI key removed, which is how it survives the review window.
 *
 *   pnpm tsx scripts/audit-demo-cases.ts
 */

import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'node:fs';
import { audit } from '../src/lib/agents/closure-auditor';
import { DEMO_CASES } from '../supabase/seed/demo-cases';

const results: Record<string, unknown> = {};
let wrong = 0;

for (const c of DEMO_CASES) {
  process.stdout.write(`\n${c.ref}  ${c.citizen.name} — ${c.subject}\n`);

  const outcome = await audit({
    narrative_original: c.narrative,
    narrative_lang: c.narrativeLang,
    reply_body: c.reply.body,
    reply_lang: c.reply.lang,
    filed_at: c.filedAt,
    closed_at: c.closedAt,
    sla_days: 21,
  });

  const { result } = outcome;
  const matched = result.verdict === c.expected.verdict;
  if (!matched) wrong++;

  console.log(`  verdict     : ${result.verdict}  (expected ${c.expected.verdict}) ${matched ? 'OK' : 'MISMATCH'}`);
  console.log(`  confidence  : ${result.confidence}`);
  console.log(`  citations   : ${result.citations.length}, verified=${outcome.citationsVerified}, guard retries=${outcome.guardFailures}`);
  console.log(`  reasoning   : ${result.reasoning}`);
  for (const u of result.unaddressed) console.log(`  unaddressed : ${u}`);

  results[c.ref] = { ...outcome, expected: c.expected };
}

mkdirSync('evals/fixtures', { recursive: true });
writeFileSync('evals/fixtures/precomputed-audits.json', JSON.stringify(results, null, 2) + '\n');

console.log(`\nwrote evals/fixtures/precomputed-audits.json`);
console.log(wrong === 0 ? 'all three verdicts as expected' : `${wrong} verdict(s) off expectation`);
process.exit(wrong === 0 ? 0 : 1);
