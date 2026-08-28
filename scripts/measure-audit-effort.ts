/**
 * How much of the paste box's wait is reasoning we could buy less of?
 *
 * The box takes eight to thirteen seconds and that is the single most likely reason a reviewer
 * closes the tab. Before changing anything we wanted the number rather than a guess, so this
 * runs the real auditor over the same chip pair at the API default and at `low` effort, twice
 * each, and prints the wall time and the verdict for both.
 *
 * It is a measurement, not a gate. Nothing in the product reads its output; it exists so the
 * decision recorded in the commit message has a number under it, and so the next person can
 * re-measure instead of trusting ours.
 *
 * What it told us, over three matched pairs on 28 Aug 2026: default 17.2 / 8.5 / 8.4s, low
 * 7.0 / 4.7 / 5.0s. Roughly half the wait. We did not take it. The verdict was the same every
 * time, but `low` returned lower confidence (0.71–0.80 against 0.86–0.90), so the paste box
 * would have shown numbers the configuration behind `evals/results.json` does not produce. The
 * box exists to prove the published auditor is not canned; running a different one inside it,
 * however well captioned, gives that away to save six seconds we had already saved on the
 * chips by committing their audits.
 *
 *   pnpm tsx scripts/measure-audit-effort.ts
 */

import 'dotenv/config';
import { audit, type AuditOptions } from '../src/lib/agents/closure-auditor';
import { TRY_EXAMPLES } from '../src/lib/try-examples';

const example = TRY_EXAMPLES.find((e) => e.id === 'forwarded-to-concerned-office')!;
const now = Date.now();

async function once(label: string, options: AuditOptions) {
  const t0 = Date.now();
  const outcome = await audit(
    {
      narrative_original: example.complaint,
      narrative_lang: 'en',
      reply_body: example.reply,
      reply_lang: 'en',
      filed_at: new Date(now - 21 * 86_400_000).toISOString(),
      closed_at: new Date(now).toISOString(),
      sla_days: 21,
    },
    options,
  );
  const secs = (Date.now() - t0) / 1000;
  console.log(
    `${label.padEnd(10)} ${secs.toFixed(1)}s  verdict=${outcome.result.verdict} ` +
      `confidence=${outcome.result.confidence} citations=${outcome.result.citations.length} ` +
      `verified=${outcome.citationsVerified} retries=${outcome.guardFailures}`,
  );
  return secs;
}

const runs: [string, AuditOptions][] = [
  ['default', {}],
  ['low', { reasoningEffort: 'low' }],
  ['default', {}],
  ['low', { reasoningEffort: 'low' }],
  ['default', {}],
  ['low', { reasoningEffort: 'low' }],
];

const times = new Map<string, number[]>();
for (const [label, options] of runs) {
  const secs = await once(label, options);
  times.set(label, [...(times.get(label) ?? []), secs]);
}

console.log('');
for (const [label, secs] of times) {
  const mean = secs.reduce((a, b) => a + b, 0) / secs.length;
  console.log(`${label.padEnd(10)} mean ${mean.toFixed(1)}s over ${secs.length} run(s)`);
}
