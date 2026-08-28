import Link from 'next/link';
import { query, one } from '@/lib/db';
import { evalResults, pct } from '@/lib/eval-results';
import { GapMap } from '@/components/GapMap';

export const dynamic = 'force-dynamic';

/**
 * One page, in two parts, and the split is structural rather than a footnote.
 *
 * **What we measured** is the eval — closure replies labelled by hand before the prompt was
 * tuned against them, scored by real model calls — plus our error rate computed over real
 * model runs only, at whatever honest n that currently is.
 *
 * **What we simulated** is everything derived from the 2,800-case synthetic corpus: disposal,
 * true resolution, the office table. Those are shaped to match the published national picture.
 * They are not measurements, no office named is real, and the heading says so before any
 * number appears.
 *
 * A number on this page is one or the other. There is no third category — an earlier version
 * of this page published arithmetic over seeded constants as "how often we are wrong", and
 * that is the mistake this split exists to make impossible to repeat.
 *
 * The resolution rate itself comes from `confirmations` — the citizen's own yes/no — and never
 * from a model verdict, simulated or not.
 */
export default async function NumbersPage() {
  const evals = evalResults();

  const headline = await one<{
    disposed: string; total: string; disposal_pct: string;
    citizens_asked: string; confirmed_resolved: string; true_resolution_pct: string;
  }>('select * from headline_numbers');

  // Real model runs only. Seeded rows are excluded by the view — see migration 11.
  const errors = await one<{ too_soft: string; too_harsh: string; total_compared: string }>(
    'select * from our_error_rate',
  );

  const simulated = await one<{ too_soft: string; too_harsh: string; total_compared: string }>(
    'select * from simulated_corpus_rate',
  );

  const offices = await query<{
    office_name: string; department: string; state: string;
    disposed: string; citizens_asked: string; true_resolution_pct: string | null;
    lat: string | null; lon: string | null;
  }>(
    `select office_name, department, state, disposed, citizens_asked, true_resolution_pct, lat, lon
       from true_resolution_rate
      where citizens_asked > 20
      order by true_resolution_pct asc nulls last`,
  );

  const asked = Number(headline?.citizens_asked ?? 0);
  const closed = Number(headline?.disposed ?? 0);
  const neverAsked = closed - asked;

  const compared = Number(errors?.total_compared ?? 0);
  const tooSoft = Number(errors?.too_soft ?? 0);
  const tooHarsh = Number(errors?.too_harsh ?? 0);

  const simCompared = Number(simulated?.total_compared ?? 0);
  const simTooSoft = Number(simulated?.too_soft ?? 0);
  const simTooHarsh = Number(simulated?.too_harsh ?? 0);

  return (
    <div className="space-y-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">The numbers</h1>
        <p className="text-xl">
          CPGRAMS measures disposal. <strong>We measure resolution.</strong>
        </p>
        <p className="text-muted">
          This page is in two parts, and the order is deliberate. First what we actually measured. Then what we
          simulated, said plainly, before any figure from it appears.
        </p>
      </header>

      {/* ------------------------------------------------------------ measured */}
      <section className="space-y-6 rounded border-2 border-ink p-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink">Part one</p>
          <h2 className="text-2xl font-semibold">What we measured</h2>
          <p className="text-muted">
            Real model calls against replies we labelled by hand <em>before</em> the prompt was written against
            them. These are the only numbers on this site that describe how well the auditor works.
          </p>
        </header>

        {evals ? (
          <>
            <dl className="divide-y divide-rule border-y border-rule">
              {[
                ['False accusation rate', pct(evals.falseAccusation),
                  `A genuinely good reply judged negative. Across ${evals.cases} labelled cases. The number we care most about keeping low.`],
                ['Deflection and boilerplate caught', pct(evals.negativeRecall),
                  'Of replies we labelled as deflected or boilerplate.'],
                ['Citation guard pass rate', pct(evals.citationGuard),
                  'Every quoted span appeared verbatim in the reply, character for character.'],
                ['Adversarial replies caught', pct(evals.adversarialCatch),
                  `Of ${evals.adversarial} replies written by us specifically to beat our own auditor.`],
                ['Ambiguous cases left undetermined', pct(evals.undeterminedUse),
                  'A gate we FAIL, at a threshold of 60%. It is left failing rather than relabelled until it goes green.'],
                ['Exact verdict match', pct(evals.exactMatch),
                  'Across all seven verdict classes, including the ones a coarser score would hide.'],
              ].map(([k, v, why]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[18rem_5rem_1fr] sm:gap-4">
                  <dt className="font-semibold">{k}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                  <dd className="text-muted">{why}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-muted">
              {evals.cases} cases, {evals.adversarial} of them adversarial, run{' '}
              {evals.generated_at.slice(0, 10)}. Every figure above is read from{' '}
              <code>evals/results.json</code> at render time, so this table cannot drift from the eval. Method
              and the full case list are in <code>evals/README.md</code>, which ships with the code.
            </p>
          </>
        ) : (
          <p className="text-muted">
            The eval has not been run against this checkout, so there is nothing measured to show. We would
            rather show nothing here than a number we did not produce.
          </p>
        )}

        <div className="space-y-2 rounded border border-rule p-5">
          <h3 className="text-lg font-semibold">Where a real audit disagreed with a real citizen</h3>
          {compared > 0 ? (
            <>
              <p className="text-muted">
                Across <strong className="tabular-nums">{compared.toLocaleString('en-IN')}</strong>{' '}
                {compared === 1 ? 'case' : 'cases'} where a model verdict and a citizen&rsquo;s own yes/no both
                exist: we were too harsh{' '}
                <strong className="tabular-nums">{tooHarsh.toLocaleString('en-IN')}</strong>{' '}
                {tooHarsh === 1 ? 'time' : 'times'} and too soft{' '}
                <strong className="tabular-nums">{tooSoft.toLocaleString('en-IN')}</strong>{' '}
                {tooSoft === 1 ? 'time' : 'times'}.
              </p>
              <p className="text-sm text-muted">
                That is a small n, and we publish it at whatever size it is rather than padding it.
              </p>
            </>
          ) : (
            <p className="text-muted">
              <strong>Nothing to report yet — n = 0.</strong> This counts only cases where a real model run and a
              real citizen&rsquo;s answer both exist. In this prototype no such pair has been created, so there is
              no rate to publish. An earlier version of this page filled that gap with arithmetic over the
              synthetic corpus below and called it &ldquo;how often we are wrong&rdquo;. It measured nothing, and
              it is gone.
            </p>
          )}
          <p className="text-sm text-muted">
            None of this could change the resolution rate below in any case. Our verdict is triage and
            explanation; the metric is the citizen&rsquo;s answer. A department can write a flawless reply and
            still score zero if the pension never arrived.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ simulated */}
      <section className="space-y-6 rounded border-2 border-warn p-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-warn">Part two — simulated</p>
          <h2 className="text-2xl font-semibold">What we simulated</h2>
          <p className="text-ink">
            Everything below this line comes from a <strong>synthetic corpus of ~2,800 cases</strong> generated
            by <code>supabase/seed/run.ts</code>, shaped to match the published national picture — disposal in
            the nineties, resolution far below it. <strong>These are not measurements.</strong> No office named
            here is real, no citizen is real, and no reply was written by any government department. They exist
            to show what the product would display against real volume.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded border border-rule p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Disposal rate · simulated</p>
            <p className="mt-2 text-5xl font-semibold tabular-nums">{headline?.disposal_pct}%</p>
            <p className="mt-2 text-muted">
              {Number(headline?.disposed).toLocaleString('en-IN')} of{' '}
              {Number(headline?.total).toLocaleString('en-IN')} synthetic complaints marked finished by the
              department. This is the shape of the number that exists today.
            </p>
          </div>

          <div className="rounded border border-rule p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              True resolution rate · simulated
            </p>
            <p className="mt-2 text-5xl font-semibold tabular-nums">{headline?.true_resolution_pct}%</p>
            <p className="mt-2 text-muted">
              Of the {asked.toLocaleString('en-IN')} synthetic citizens asked, this many said the thing they
              complained about actually got fixed. Computed from their yes/no, never from a verdict.{' '}
              <strong>DARPG named this capability in August 2026</strong> — validating whether a closure
              resolved anything, rather than counting that it happened. We have not found it in an engineering
              spec or a live portal. This is what it looks like built: the figure above is over cases we
              generated, and the method is the part that would carry over.
            </p>
          </div>
        </div>

        <div className="rounded border border-rule p-6">
          <h3 className="text-lg font-semibold">The people nobody asks</h3>
          <p className="mt-2">
            <strong className="tabular-nums">{neverAsked.toLocaleString('en-IN')}</strong> of these simulated
            closures were never followed up with the person who complained. The published national figures for
            May 2026 are about 2.6 lakh grievances closed against roughly 79,000 people reached by the feedback
            call centre — about seven in ten never asked. That comparison is the reason this project exists, and
            it is a figure we read rather than one we measured. And the appeal that would hold someone to
            account only unlocks if you rate the closure &ldquo;Poor&rdquo;, which is a question most people are
            never asked.
          </p>
        </div>

        <div className="space-y-3 rounded border border-rule p-6">
          <h3 className="text-lg font-semibold">How much the corpus disagrees with itself</h3>
          <p className="text-muted">
            In the synthetic corpus the seed assigned both the verdict and the citizen&rsquo;s answer. Comparing
            the two tells you about the seed, not about the auditor, so it is reported here and nowhere else: too
            harsh <span className="tabular-nums">{simTooHarsh.toLocaleString('en-IN')}</span>, too soft{' '}
            <span className="tabular-nums">{simTooSoft.toLocaleString('en-IN')}</span>, across{' '}
            <span className="tabular-nums">{simCompared.toLocaleString('en-IN')}</span> synthetic cases. It is a
            plausible shape, deliberately not a flattering one, and it is evidence of nothing.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Where the gap falls · simulated</h3>
          <p className="text-muted">
            The two figures above are national averages, and an average hides the only thing worth knowing:
            the gap is not spread evenly. Each circle below is one invented office, sized and numbered by how
            often its <em>closed</em> cases were <em>not</em> confirmed fixed by the citizen who complained —
            their own yes/no, never a verdict from our auditor. Number 1 is the worst. The full ranking is
            written out under the map, so nothing here depends on reading a colour or squinting at a dot.
          </p>
          <GapMap offices={offices} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">By office · simulated</h3>
          <p className="text-muted">
            Every office name in this table is invented. Aggregated by office, never by named official — even in
            simulation, because we know what a reply said, not who is good at their job.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className="py-2 pr-4">Office (invented)</th>
                  <th className="py-2 pr-4">Closed</th>
                  <th className="py-2 pr-4">Asked</th>
                  <th className="py-2">Actually fixed</th>
                </tr>
              </thead>
              <tbody>
                {offices.map((o) => (
                  <tr key={o.office_name} className="border-b border-rule">
                    <td className="py-2 pr-4">
                      {o.office_name}
                      <span className="block text-sm text-muted">
                        {o.department} · {o.state}
                      </span>
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{o.disposed}</td>
                    <td className="py-2 pr-4 tabular-nums">{o.citizens_asked}</td>
                    <td className="py-2 tabular-nums font-semibold">
                      {o.true_resolution_pct === null ? '—' : `${o.true_resolution_pct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <p className="text-muted">
        <Link href="/how-this-works" className="underline">
          What is real, what is simulated, and what we got wrong
        </Link>
        .
      </p>
    </div>
  );
}
