import Link from 'next/link';
import { query, one } from '@/lib/db';
import { MockNote } from '@/components/MockBadge';

export const dynamic = 'force-dynamic';

/**
 * One page, not a dashboard.
 *
 * The number on the left is the one the system already publishes. The number on the right does
 * not exist in India today, and it comes from citizens answering a yes/no question — never
 * from our model. That separation is the whole design: once departments know a model reads
 * their replies, some will write for the model, and a metric a model can be persuaded by is a
 * metric that will be gamed.
 *
 * Our own error rate sits beside both, in both directions.
 */
export default async function NumbersPage() {
  const headline = await one<{
    disposed: string; total: string; disposal_pct: string;
    citizens_asked: string; confirmed_resolved: string; true_resolution_pct: string;
  }>('select * from headline_numbers');

  const errors = await one<{ too_soft: string; too_harsh: string; total_compared: string }>(
    'select * from our_error_rate',
  );

  const offices = await query<{
    office_name: string; department: string; state: string;
    disposed: string; citizens_asked: string; true_resolution_pct: string | null;
  }>(
    `select office_name, department, state, disposed, citizens_asked, true_resolution_pct
       from true_resolution_rate
      where citizens_asked > 20
      order by true_resolution_pct asc nulls last`,
  );

  const asked = Number(headline?.citizens_asked ?? 0);
  const closed = Number(headline?.disposed ?? 0);
  const neverAsked = closed - asked;
  const tooSoft = Number(errors?.too_soft ?? 0);
  const tooHarsh = Number(errors?.too_harsh ?? 0);
  const compared = Number(errors?.total_compared ?? 0);
  const disagreementPct = compared ? ((tooSoft + tooHarsh) / compared) * 100 : 0;

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">The numbers</h1>
        <p className="text-xl">
          CPGRAMS measures disposal. <strong>We measure resolution.</strong>
        </p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="rounded border border-rule p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">Disposal rate</p>
          <p className="mt-2 text-5xl font-semibold tabular-nums">{headline?.disposal_pct}%</p>
          <p className="mt-2 text-muted">
            {Number(headline?.disposed).toLocaleString('en-IN')} of{' '}
            {Number(headline?.total).toLocaleString('en-IN')} complaints marked finished by the department.
            This is the number that exists today.
          </p>
        </div>

        <div className="rounded border-2 border-ink p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink">True resolution rate</p>
          <p className="mt-2 text-5xl font-semibold tabular-nums">{headline?.true_resolution_pct}%</p>
          <p className="mt-2 text-muted">
            Of the {asked.toLocaleString('en-IN')} people we asked, this many said the thing they complained
            about actually got fixed. <strong>This number does not exist in India today.</strong>
          </p>
        </div>
      </section>

      <section className="rounded border border-rule p-6">
        <h2 className="text-xl font-semibold">The people nobody asks</h2>
        <p className="mt-2">
          <strong className="tabular-nums">{neverAsked.toLocaleString('en-IN')}</strong> of these closures were
          never followed up with the person who complained. In the real system that share is far larger — and
          the appeal that would hold someone to account only unlocks if you rate the closure “Poor”, which is a
          question most people are never asked.
        </p>
      </section>

      {/* Our own error rate, published beside the metric rather than in a footnote. */}
      <section className="space-y-4 rounded border-2 border-warn p-6">
        <h2 className="text-xl font-semibold text-ink">Where we were wrong</h2>
        <p className="text-ink">
          Every time our audit and the citizen disagreed, we counted it. Both directions, published here rather
          than discovered by someone else.
        </p>
        <dl className="grid gap-5 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-muted">Too harsh</dt>
            <dd className="text-3xl font-semibold tabular-nums text-ink">{tooHarsh.toLocaleString('en-IN')}</dd>
            <p className="text-sm text-muted">
              We said the reply was not an answer. The citizen told us the problem was fixed. This is the one we
              watch hardest — it means we were unfair to someone who did their job.
            </p>
          </div>
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-muted">Too soft</dt>
            <dd className="text-3xl font-semibold tabular-nums text-ink">{tooSoft.toLocaleString('en-IN')}</dd>
            <p className="text-sm text-muted">
              We accepted the reply. The citizen told us nothing had changed. Meera’s case, one of our three
              demos, is deliberately one of these.
            </p>
          </div>
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-muted">Disagreement rate</dt>
            <dd className="text-3xl font-semibold tabular-nums text-ink">{disagreementPct.toFixed(1)}%</dd>
            <p className="text-sm text-muted">
              Across {compared.toLocaleString('en-IN')} cases where we had both a verdict and an answer.
            </p>
          </div>
        </dl>
        <p className="text-sm text-ink">
          None of this changes the resolution rate above. Our verdict is triage and explanation; the metric is
          the citizen’s answer. A department can write a flawless reply and still score zero if the pension
          never arrived.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">By office</h2>
        <p className="text-muted">
          Aggregated by office, never by named official. We know what a reply said. We do not know who is good
          at their job, and we will not pretend otherwise.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="py-2 pr-4">Office</th>
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
      </section>

      <MockNote>
        These figures come from a synthetic corpus of ~2,800 cases built for this prototype. They are shaped to
        match the published national picture — disposal in the nineties, resolution far below it — but they are
        not real measurements of any real office, and the office names here are invented.{' '}
        <Link href="/how-this-works" className="underline">
          Full disclosure
        </Link>
        .
      </MockNote>
    </div>
  );
}
