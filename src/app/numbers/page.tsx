import Link from 'next/link';
import { query, one } from '@/lib/db';
import { evalResults, pct } from '@/lib/eval-results';
import { GapMap } from '@/components/GapMap';
import { t, SHIPPED_LANGS, type ShippedLang , DEFAULT_LANG} from '@/lib/i18n/strings';
import { GuidedTour } from '@/components/GuidedTour';

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
export default async function NumbersPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  // The map speaks the reader's language, the same way every other citizen-facing surface does.
  const sp = await searchParams;
  const lang: ShippedLang = (SHIPPED_LANGS as readonly string[]).includes(sp.lang ?? '')
    ? (sp.lang as ShippedLang)
    : DEFAULT_LANG;
  const s = t(lang);

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
        <h1 className="text-3xl font-semibold tracking-tight">{s.numTitle}</h1>
        <p className="text-xl">
          {s.numLeadA} <strong>{s.numLeadB}</strong>
        </p>
        <p className="text-muted">{s.numLeadSub}</p>
      </header>

      {/* ------------------------------------------------------------ measured */}
      <section data-tour="rates" className="space-y-6 rounded border-2 border-ink p-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink">{s.numPartOne}</p>
          <h2 className="text-2xl font-semibold">{s.numMeasuredHeading}</h2>
          <p className="text-muted">{s.numMeasuredIntro}</p>
        </header>

        {evals ? (
          <>
            <dl className="divide-y divide-rule border-y border-rule">
              {[
                [s.numEvalFalseAccusation, pct(evals.falseAccusation),
                  s.numEvalFalseAccusationWhy(evals.cases)],
                [s.numEvalDeflection, pct(evals.negativeRecall), s.numEvalDeflectionWhy],
                [s.numEvalCitationGuard, pct(evals.citationGuard), s.numEvalCitationGuardWhy],
                [s.numEvalAdversarial, pct(evals.adversarialCatch),
                  s.numEvalAdversarialWhy(evals.adversarial)],
                [s.numEvalUndetermined, pct(evals.undeterminedUse), s.numEvalUndeterminedWhy],
                [s.numEvalExactMatch, pct(evals.exactMatch), s.numEvalExactMatchWhy],
              ].map(([k, v, why]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[18rem_5rem_1fr] sm:gap-4">
                  <dt className="font-semibold">{k}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                  <dd className="text-muted">{why}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-muted">
              {s.numEvalFootnote(evals.cases, evals.adversarial, evals.generated_at.slice(0, 10))}
            </p>
          </>
        ) : (
          <p className="text-muted">{s.numEvalMissing}</p>
        )}

        <div className="space-y-2 rounded border border-rule p-5">
          <h3 className="text-lg font-semibold">{s.numDisagreeHeading}</h3>
          {compared > 0 ? (
            <>
              <p className="text-muted tabular-nums">
                {s.numDisagreeBody(
                  compared.toLocaleString('en-IN'),
                  tooHarsh.toLocaleString('en-IN'),
                  tooSoft.toLocaleString('en-IN'),
                )}
              </p>
              <p className="text-sm text-muted">{s.numDisagreeSmallN}</p>
            </>
          ) : (
            <p className="text-muted">{s.numDisagreeEmpty}</p>
          )}
          <p className="text-sm text-muted">{s.numAuditNotMetric}</p>
        </div>
      </section>

      {/* ------------------------------------------------------------ simulated */}
      <section className="space-y-6 rounded border-2 border-warn p-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-warn">{s.numPartTwo}</p>
          <h2 className="text-2xl font-semibold">{s.numSimHeading}</h2>
          <p className="text-ink">{s.numSimIntro('2,800', 'supabase/seed/run.ts')}</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded border border-rule p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              {s.numDisposalLabel}
            </p>
            <p className="mt-2 text-5xl font-semibold tabular-nums">{headline?.disposal_pct}%</p>
            <p className="mt-2 text-muted tabular-nums">
              {s.numDisposalBody(
                Number(headline?.disposed).toLocaleString('en-IN'),
                Number(headline?.total).toLocaleString('en-IN'),
              )}
            </p>
          </div>

          <div className="rounded border border-rule p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              {s.numTrueResLabel}
            </p>
            <p className="mt-2 text-5xl font-semibold tabular-nums">
              {headline?.true_resolution_pct}%
            </p>
            <p className="mt-2 text-muted">{s.numTrueResBody(asked.toLocaleString('en-IN'))}</p>
          </div>
        </div>

        <div className="rounded border border-rule p-6">
          <h3 className="text-lg font-semibold">{s.numNeverAskedHeading}</h3>
          <p className="mt-2">{s.numNeverAskedBody(neverAsked.toLocaleString('en-IN'))}</p>
        </div>

        <div className="space-y-3 rounded border border-rule p-6">
          <h3 className="text-lg font-semibold">{s.numCorpusDisagreeHeading}</h3>
          <p className="text-muted tabular-nums">
            {s.numCorpusDisagreeBody(
              simTooHarsh.toLocaleString('en-IN'),
              simTooSoft.toLocaleString('en-IN'),
              simCompared.toLocaleString('en-IN'),
            )}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{s.mapHeading}</h3>
          <p className="text-muted">{s.mapIntro}</p>
          <GapMap offices={offices} lang={lang} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{s.numByOfficeHeading}</h3>
          <p className="text-muted">{s.numByOfficeIntro}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className="py-2 pr-4">{s.numColOffice}</th>
                  <th className="py-2 pr-4">{s.numColClosed}</th>
                  <th className="py-2 pr-4">{s.numColAsked}</th>
                  <th className="py-2">{s.numColFixed}</th>
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
        <Link href={`/how-this-works?lang=${lang}`} className="underline">
          {s.numFooterLink}
        </Link>
      </p>

      <GuidedTour lang={lang} />
    </div>
  );
}
