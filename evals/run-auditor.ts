/**
 * The auditor eval, with gates.
 *
 *   pnpm eval:auditor
 *
 * The gate that matters most is the FALSE ACCUSATION rate: a reply that genuinely answered the
 * citizen, judged negative by us. It costs more credibility than a missed deflection does,
 * because the citizen's own answer is the safety net for the misses and there is no safety net
 * for accusing someone who did their job.
 *
 * Whatever comes out of this goes in the README, including the numbers that do not flatter us.
 */

import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { audit } from '../src/lib/agents/closure-auditor';
import { checkCitations } from '../src/lib/agents/citation-guard';
import type { Lang } from '../src/lib/agents/schemas';

type Case = { id: string; label: string; lang: string; complaint: string; reply: string; note?: string };
type Adversarial = { id: string; lang: string; complaint: string; reply: string; acceptable: string[]; note?: string };

const NEGATIVE = new Set(['deflected', 'boilerplate', 'non_responsive']);

const GATES = {
  falseAccusation: { max: 0.05, label: 'False accusation rate (a blameless reply judged negative)' },
  negativeRecall: { min: 0.85, label: 'Recall on deflected + boilerplate' },
  undeterminedUse: { min: 0.6, label: 'Ambiguous cases correctly left undetermined' },
  citationGuard: { min: 0.98, label: 'Citation guard pass rate' },
  adversarialCatch: { min: 0.7, label: 'Adversarial replies caught' },
};

const CONCURRENCY = 6;

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i]!, i);
      }
    }),
  );
  return out;
}

async function judge(c: { complaint: string; reply: string; lang: string }) {
  const filed = '2026-08-01T00:00:00.000Z';
  const closed = '2026-08-19T00:00:00.000Z';
  return audit({
    narrative_original: c.complaint,
    narrative_lang: c.lang as Lang,
    reply_body: c.reply,
    reply_lang: 'en',
    filed_at: filed,
    closed_at: closed,
    sla_days: 21,
  });
}

const cases = JSON.parse(readFileSync('evals/fixtures/auditor/cases.json', 'utf8')) as Case[];
const adversarial = JSON.parse(readFileSync('evals/fixtures/adversarial/cases.json', 'utf8')) as Adversarial[];

console.log(`Auditor eval — ${cases.length} labelled cases, ${adversarial.length} adversarial\n`);

const results = await mapLimit(cases, CONCURRENCY, async (c, i) => {
  const outcome = await judge(c);
  const got = outcome.result.verdict;
  const guard = checkCitations(c.reply, outcome.result.citations);
  process.stdout.write(`${((i + 1) / cases.length * 100).toFixed(0).padStart(3)}%\r`);
  return {
    id: c.id,
    expected: c.label,
    got,
    correct: got === c.label,
    guardOk: guard.ok,
    citationsVerified: outcome.citationsVerified,
    guardFailures: outcome.guardFailures,
    reasoning: outcome.result.reasoning,
  };
});

const advResults = await mapLimit(adversarial, CONCURRENCY, async (c) => {
  const outcome = await judge(c);
  return { id: c.id, got: outcome.result.verdict, caught: c.acceptable.includes(outcome.result.verdict) };
});

// ---------------------------------------------------------------- scoring

// A reply that did nothing wrong, judged negative. That is the `resolved` slice AND the
// lawful-transfer slice: transferring a State subject or a sub judice matter to the competent
// authority is correct procedure, so calling it deflection is an accusation with nothing
// behind it. Both figures are reported; the resolved-only one stays comparable to v1.
const good = results.filter((r) => r.expected === 'resolved');
const lawful = results.filter((r) => r.expected === 'transferred_lawfully');
const isAccusation = (v: string) => NEGATIVE.has(v) || v === 'partial';
const falseAccusationResolvedOnly = good.length ? good.filter((r) => isAccusation(r.got)).length / good.length : 0;
const innocent = [...good, ...lawful];
const falseAccusation = innocent.length ? innocent.filter((r) => isAccusation(r.got)).length / innocent.length : 0;
const lawfulMisjudged = lawful.length ? lawful.filter((r) => isAccusation(r.got)).length / lawful.length : 0;

const negatives = results.filter((r) => r.expected === 'deflected' || r.expected === 'boilerplate');
const negativeRecall = negatives.length ? negatives.filter((r) => NEGATIVE.has(r.got)).length / negatives.length : 0;

const ambiguous = results.filter((r) => r.expected === 'undetermined');
const undeterminedUse = ambiguous.length ? ambiguous.filter((r) => r.got === 'undetermined').length / ambiguous.length : 0;

const citationGuard = results.filter((r) => r.guardOk).length / results.length;
const adversarialCatch = advResults.filter((r) => r.caught).length / advResults.length;

const exact = results.filter((r) => r.correct).length / results.length;

const scored = [
  ['falseAccusation', falseAccusation, GATES.falseAccusation.max, 'max', GATES.falseAccusation.label],
  ['negativeRecall', negativeRecall, GATES.negativeRecall.min, 'min', GATES.negativeRecall.label],
  ['undeterminedUse', undeterminedUse, GATES.undeterminedUse.min, 'min', GATES.undeterminedUse.label],
  ['citationGuard', citationGuard, GATES.citationGuard.min, 'min', GATES.citationGuard.label],
  ['adversarialCatch', adversarialCatch, GATES.adversarialCatch.min, 'min', GATES.adversarialCatch.label],
] as const;

console.log('\n');
let failed = 0;
for (const [, value, threshold, dir, label] of scored) {
  const pass = dir === 'max' ? value <= threshold : value >= threshold;
  if (!pass) failed++;
  const arrow = dir === 'max' ? '≤' : '≥';
  console.log(
    `${pass ? 'PASS' : 'FAIL'}  ${(value * 100).toFixed(1).padStart(5)}%  (gate ${arrow} ${(threshold * 100).toFixed(0)}%)  ${label}`,
  );
}
console.log(`      ${(exact * 100).toFixed(1).padStart(5)}%         exact verdict match across all seven classes`);
console.log(`      ${(falseAccusationResolvedOnly * 100).toFixed(1).padStart(5)}%         false accusation on the resolved slice alone (comparable to v1)`);
console.log(`      ${(lawfulMisjudged * 100).toFixed(1).padStart(5)}%         lawful transfers judged negative`);

// Confusion, so a failure says where rather than only how much.
const confusion = new Map<string, Map<string, number>>();
for (const r of results) {
  const row = confusion.get(r.expected) ?? new Map<string, number>();
  row.set(r.got, (row.get(r.got) ?? 0) + 1);
  confusion.set(r.expected, row);
}
console.log('\nWhere it disagreed with the labels:');
for (const [expected, row] of confusion) {
  const wrong = [...row].filter(([got]) => got !== expected);
  if (wrong.length === 0) continue;
  console.log(`  ${expected} → ${wrong.map(([got, n]) => `${got} (${n})`).join(', ')}`);
}

const summary = {
  generated_at: new Date().toISOString(),
  cases: cases.length,
  adversarial: adversarial.length,
  falseAccusation,
  falseAccusationResolvedOnly,
  lawfulMisjudged,
  negativeRecall,
  undeterminedUse,
  citationGuard,
  adversarialCatch,
  exactMatch: exact,
  gatesFailed: failed,
  perCase: results,
  adversarialPerCase: advResults,
};
writeFileSync('evals/results.json', JSON.stringify(summary, null, 2) + '\n');
console.log(`\nwrote evals/results.json`);
console.log(failed === 0 ? 'ALL GATES PASS' : `${failed} GATE(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
