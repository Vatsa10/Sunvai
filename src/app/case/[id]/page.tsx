import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCase, getTimeline, daysUntil } from '@/lib/cases';
import { verdictCopy } from '@/lib/verdicts';
import { translateJargon } from '@/lib/jargon';
import { QuotedReply } from '@/components/QuotedReply';
import { MockBadge, MockNote } from '@/components/MockBadge';
import { confirmResolution, prepareAppeal, sendAppeal } from '@/actions/case-actions';
import { t, SHIPPED_LANGS, type ShippedLang } from '@/lib/i18n/strings';
import { mayDraftAppeal } from '@/lib/agents/appeal';

export const dynamic = 'force-dynamic';

/**
 * One page, one scroll: what they wrote, what we made of it, the question, the appeal.
 *
 * The corpus specified separate /case/[id] and /case/[id]/audit routes. On a phone, on mobile
 * data, an extra navigation between the reply and the verdict is a place to lose someone in the
 * middle of the only thing we want them to see, so it is one page with anchors instead.
 */
export default async function CasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string; how?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const ref = decodeURIComponent(id);

  const c = await getCase(ref);
  if (!c) notFound();

  const lang = (SHIPPED_LANGS as readonly string[]).includes(sp.lang ?? '')
    ? (sp.lang as ShippedLang)
    : (SHIPPED_LANGS as readonly string[]).includes(c.narrativeLang)
      ? (c.narrativeLang as ShippedLang)
      : 'hi';
  const s = t(lang);

  const timeline = await getTimeline(c.id);
  const left = daysUntil(c.slaDueAt);
  const closed = Boolean(c.closedAt);
  const v = c.audit ? verdictCopy(c.audit.verdict, lang) : null;
  const canAppeal =
    c.audit &&
    mayDraftAppeal({
      verdict: c.audit.verdict,
      citizenSaysUnresolved: c.confirmation ? !c.confirmation.resolved : false,
    });

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-muted">{c.ref}</span>
          <MockBadge what="Simulated case" />
        </div>
        <h1 className="text-2xl font-semibold leading-tight">{c.subject}</h1>
        <p className="text-muted">
          {c.office} · {c.department}
        </p>
        {c.filedByRelation && (
          <p className="text-sm text-muted">
            Filed on {c.citizen.name}’s behalf — {c.filedByRelation}. Her consent is recorded in the ledger.
          </p>
        )}
      </header>

      {/* The status, said in words rather than in a status word. */}
      <section className="rounded border border-rule p-5">
        <h2 className="text-lg font-semibold">Where this stands</h2>
        <dl className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted">Their word for it:</dt>
            <dd className="font-semibold">{c.rawStatus}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted">What that means:</dt>
            <dd>{translateJargon(c.rawStatus, lang)}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted">{s.filedOn}:</dt>
            <dd>{formatDate(c.filedAt)}</dd>
          </div>
          {closed ? (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted">{s.closedOn}:</dt>
              <dd>
                {formatDate(c.closedAt!)} — {daysBetween(c.filedAt, c.closedAt!)} days after it was filed
              </dd>
            </div>
          ) : (
            left !== null && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-muted">Clock:</dt>
                <dd className={left < 0 ? 'font-semibold text-bad' : ''}>
                  {left >= 0 ? s.daysLeft(left) : s.daysOver(-left)}
                </dd>
              </div>
            )
          )}
        </dl>

        <Timeline entries={timeline} />
      </section>

      {/* Their words first, unedited. Trust is built by showing the thing, not by summarising it. */}
      {c.reply && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{s.theyWrote}</h2>
          <blockquote className="border-l-4 border-rule bg-black/[0.02] p-4">
            {c.audit ? (
              <QuotedReply body={c.reply.body} citations={c.audit.citations} />
            ) : (
              <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed">{c.reply.body}</p>
            )}
          </blockquote>
          <p className="text-sm text-muted">
            Marked text is what our audit quoted — copied out of their reply, word for word.
          </p>
        </section>
      )}

      {/* ★ The audit. */}
      {c.audit && v && (
        <section id="audit" className={`space-y-4 rounded border-2 p-5 ${v.className}`}>
          <div className="flex flex-wrap items-center gap-3">
            <span aria-hidden className="text-2xl">{v.icon}</span>
            <span className="text-lg font-semibold uppercase tracking-wide">{v.label}</span>
          </div>
          <p className="text-xl font-semibold leading-snug text-ink">{v.headline}</p>
          <p className="text-ink">{c.audit.reasoning}</p>

          {c.audit.unaddressed.length > 0 && (
            <div>
              <h3 className="font-semibold text-ink">What they did not answer</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-ink">
                {c.audit.unaddressed.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          <details open={sp.how === '1'} className="border-t border-current/20 pt-3">
            <summary className="cursor-pointer font-semibold text-ink">{s.seeHow}</summary>
            <div className="mt-3 space-y-3 text-ink">
              <p>
                We compared their reply against what {c.citizen.name} actually asked for, in the language each
                was written in. We are only allowed to claim something if we can quote it.
              </p>
              <div>
                <h4 className="font-semibold">Quoted from their reply</h4>
                <ul className="mt-1 space-y-1">
                  {c.audit.citations.map((q, i) => (
                    <li key={i} className="border-l-2 border-current/40 pl-3 font-serif">
                      “{q.quote}”
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm">
                Every quote above was checked, character by character, against their reply before this verdict
                was shown to anyone. Checked: <strong>{c.audit.citationsVerified ? 'yes' : 'no'}</strong> ·
                confidence {Math.round(c.audit.confidence * 100)}% · model {c.audit.model} · prompt{' '}
                {c.audit.promptVersion}
              </p>
              <p className="text-sm">
                This verdict is not the score. What counts is your answer to the question below.{' '}
                <Link href="/numbers" className="underline">We publish how often we get this wrong</Link>.
              </p>
            </div>
          </details>
        </section>
      )}

      {/* ★★ The metric. */}
      {closed && (
        <section className="space-y-3 rounded border-2 border-ink p-5">
          <h2 className="text-xl font-semibold">{s.didItWork}</h2>
          <p className="text-muted">{s.didItWorkSub}</p>

          {c.confirmation ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold">
                You said: {c.confirmation.resolved ? s.yes : s.no}
              </p>
              {c.audit && (c.audit.verdict === 'resolved') !== c.confirmation.resolved && (
                <p className="rounded border border-warn/40 bg-warn/5 p-3 text-warn">
                  Our audit said “{c.audit.verdict}” and you say otherwise. Your answer is what counts, and
                  this disagreement is counted as our error on{' '}
                  <Link href="/numbers" className="underline">the numbers page</Link>.
                </p>
              )}
              <form action={confirmResolution}>
                <input type="hidden" name="ref" value={c.ref} />
                <input type="hidden" name="resolved" value={c.confirmation.resolved ? 'no' : 'yes'} />
                <button type="submit" className="text-sm underline">
                  Change my answer
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {(['yes', 'no'] as const).map((answer) => (
                <form key={answer} action={confirmResolution}>
                  <input type="hidden" name="ref" value={c.ref} />
                  <input type="hidden" name="resolved" value={answer} />
                  <button
                    type="submit"
                    className={`min-h-touch rounded px-6 py-3 text-lg font-semibold ${
                      answer === 'yes' ? 'border-2 border-ink text-ink' : 'bg-ink text-paper'
                    }`}
                  >
                    {answer === 'yes' ? s.yes : s.no}
                  </button>
                </form>
              ))}
            </div>
          )}
        </section>
      )}

      {/* The appeal. Drafted before it is asked for; sent only when it is consented to. */}
      {closed && canAppeal && (
        <section className="space-y-4 rounded border border-rule p-5">
          <h2 className="text-xl font-semibold">{s.appealReady}</h2>

          {!c.appeal ? (
            <form action={prepareAppeal} className="space-y-3">
              <input type="hidden" name="ref" value={c.ref} />
              <p className="text-muted">
                In the government system, this door only opens if you rate the closure “Poor” — a question most
                people are never asked. We write the appeal for you first, and you decide whether it goes.
              </p>
              <button type="submit" className="min-h-touch rounded bg-ink px-6 py-3 font-semibold text-paper">
                Write my appeal
              </button>
            </form>
          ) : c.appeal.status === 'drafted' ? (
            <form action={sendAppeal} className="space-y-4">
              <input type="hidden" name="ref" value={c.ref} />

              <div>
                <h3 className="font-semibold">Grounds</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {c.appeal.grounds.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>

              {/* The consent gate: both versions at once, never one behind a toggle. */}
              <div className="rounded border-2 border-ink p-4">
                <h3 className="text-lg font-semibold">This is exactly what we will send. Nothing else.</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted">
                      What is sent (English)
                    </h4>
                    <p className="mt-1 whitespace-pre-wrap font-serif">{c.appeal.bodyFormal}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted">
                      The same thing, in your language
                    </h4>
                    <p className="mt-1 whitespace-pre-wrap font-serif">{c.appeal.bodyCitizenLang}</p>
                  </div>
                </div>

                <label className="mt-4 flex items-start gap-3">
                  <input type="checkbox" name="consent" className="mt-1.5 h-6 w-6" />
                  <span>I have read this and I want it sent.</span>
                </label>

                <button type="submit" className="mt-4 min-h-touch rounded bg-ink px-6 py-3 font-semibold text-paper">
                  Send my appeal
                </button>
              </div>
            </form>
          ) : (
            <p className="text-lg font-semibold text-good">
              ✔ Sent. The appellate officer has {30} days to reply, and the clock is now running.
            </p>
          )}
        </section>
      )}

      {/* Counts, never who. */}
      {c.cluster && (
        <section className="rounded border border-rule p-5">
          <h2 className="text-xl font-semibold">You are not the only one</h2>
          <p className="mt-2 text-lg">
            <strong>{c.cluster.members - 1} other people</strong> have complained about the same thing at the same
            office. <strong>{c.cluster.closedUnresolved}</strong> of those were closed without the problem being
            fixed.
          </p>
          <p className="mt-1 text-muted">{c.cluster.label}</p>
          <Link href={`/cluster/${c.cluster.id}`} className="mt-3 inline-block underline">
            See the pattern
          </Link>
        </section>
      )}

      <section className="flex flex-wrap gap-4">
        <Link
          href={`/api/receipt/${encodeURIComponent(c.ref)}`}
          className="min-h-touch rounded border border-ink px-5 py-2 font-semibold no-underline"
        >
          {s.downloadReceipt}
        </Link>
        <Link href="/verify" className="min-h-touch rounded border border-rule px-5 py-2 no-underline">
          {s.verifyReceipt}
        </Link>
      </section>

      <MockNote>
        This case, this citizen and this department reply are synthetic. The audit above was produced by a real
        model run against that text, and the ledger entries behind the receipt are real hashes of real events.
      </MockNote>
    </div>
  );
}

function Timeline({ entries }: { entries: { seq: number; type: string; occurredAt: string }[] }) {
  if (entries.length === 0) return null;
  return (
    <ol className="mt-5 space-y-0 border-l-2 border-rule pl-5">
      {entries.map((e) => (
        <li key={e.seq} className="relative pb-4 last:pb-0">
          <span aria-hidden className="absolute -left-[27px] top-2 h-3 w-3 rounded-full bg-ink" />
          <p className="font-semibold">{EVENT_LABELS[e.type] ?? e.type.replace(/_/g, ' ')}</p>
          <p className="text-sm text-muted">{formatDate(e.occurredAt)}</p>
        </li>
      ))}
    </ol>
  );
}

const EVENT_LABELS: Record<string, string> = {
  grievance_filed: 'Complaint filed',
  assisted_filing_declared: 'Filed by someone on her behalf, with her consent',
  acknowledged: 'Received by the office',
  assigned: 'Given to an officer',
  reply_received: 'They replied',
  closed: 'They marked it closed',
  audit_completed: 'We read their reply',
  citizen_confirmed_resolved: 'You told us it was fixed',
  citizen_confirmed_unresolved: 'You told us nothing changed',
  confirmation_superseded: 'You changed your answer',
  appeal_drafted: 'We wrote your appeal',
  appeal_consented: 'You agreed to send it',
  appeal_filed: 'Appeal sent',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}
