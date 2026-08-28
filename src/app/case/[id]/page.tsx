import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCase, getTimeline, daysUntil, type CaseView, type TimelineEntry } from '@/lib/cases';
import { isDbUnavailable } from '@/lib/db';
import { fixtureCase, fixtureTimeline } from '@/lib/fixture-cases';
import { FixtureBanner } from '@/components/FixtureBanner';
import { verdictCopy } from '@/lib/verdicts';
import { translateJargon } from '@/lib/jargon';
import { QuotedReply } from '@/components/QuotedReply';
import { ReadAloud } from '@/components/ReadAloud';
import { RememberCase } from '@/components/RememberCase';
import { MockBadge, MockNote } from '@/components/MockBadge';
import { confirmResolution, prepareAppeal, sendAppeal } from '@/actions/case-actions';
import { t, SHIPPED_LANGS, type ShippedLang , DEFAULT_LANG} from '@/lib/i18n/strings';
import { appealWindow, hasAppealGrounds, mayDraftAppeal } from '@/lib/agents/appeal';
import { readTranslated } from '@/lib/translated-text';

export const dynamic = 'force-dynamic';

/**
 * One page, one scroll: what they wrote, what we made of it, the question, the appeal, and
 * the office to walk into on Monday.
 *
 * The corpus specified separate /case/[id] and /case/[id]/audit routes. On a phone, on mobile
 * data, an extra navigation between the reply and the verdict is a place to lose someone in the
 * middle of the only thing we want them to see, so it is one page with anchors instead.
 *
 * Every string a citizen reads here comes from `@/lib/i18n/strings` and exists in all three
 * shipped languages. A language picker on the landing page that gives way to an English wall
 * on the page that matters is worse than no picker at all.
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

  /*
    The database this runs on pauses when idle, and the click that wakes it is the first click
    a reviewer makes. Rather than show them a stack trace, we fall back to the copy of these
    three cases committed to the repository — and say so in a banner before anything else.
    Only an unreachable database triggers this; a broken query is still a real error, because
    quietly serving fixtures over a bug is how a demo starts lying.
  */
  let c: CaseView | null = null;
  let degraded = false;
  try {
    c = await getCase(ref);
  } catch (err) {
    if (!isDbUnavailable(err)) throw err;
    degraded = true;
    c = fixtureCase(ref);
  }
  if (!c) notFound();

  const lang = (SHIPPED_LANGS as readonly string[]).includes(sp.lang ?? '')
    ? (sp.lang as ShippedLang)
    : (SHIPPED_LANGS as readonly string[]).includes(c.narrativeLang)
      ? (c.narrativeLang as ShippedLang)
      : DEFAULT_LANG;
  const s = t(lang);
  const fmt = (iso: string) => formatDate(iso, lang);

  let timeline: TimelineEntry[] = [];
  if (degraded) {
    // Dates from the seed file, not ledger entries — the ledger is in the database. The banner
    // above has already said which of the two this is.
    timeline = fixtureTimeline(c.ref);
  } else {
    try {
      timeline = await getTimeline(c.id);
    } catch (err) {
      if (!isDbUnavailable(err)) throw err;
      degraded = true;
      timeline = fixtureTimeline(c.ref);
    }
  }
  const left = daysUntil(c.slaDueAt);
  const closed = Boolean(c.closedAt);
  const v = c.audit ? verdictCopy(c.audit.verdict, lang) : null;

  const citizenSaysUnresolved = c.confirmation ? !c.confirmation.resolved : false;
  const grounds = Boolean(c.audit && hasAppealGrounds({ verdict: c.audit.verdict, citizenSaysUnresolved }));
  // The closure date is the one the clock runs from. A reply with no closure row still has a
  // date on it, and it is the one the department itself would count.
  const appealFrom = c.closedAt ?? c.reply?.receivedAt ?? null;
  const appealWin = appealFrom ? appealWindow(appealFrom) : null;
  const canAppeal = Boolean(
    c.audit &&
      mayDraftAppeal({ verdict: c.audit.verdict, citizenSaysUnresolved, closedAt: appealFrom }),
  );
  // Time-barred, with grounds, and nothing already drafted: say so instead of showing a button
  // that leads nowhere.
  const windowOpen = appealWin?.open ?? false;
  // Time-barred: grounds, out of time, and nothing already sent. A draft left over from inside
  // the window does not make the window open again, so this still says so.
  const timeBarred = closed && grounds && Boolean(appealWin) && !windowOpen && c.appeal?.status !== 'sent';
  // Premature rather than wrong: the department gave itself a date and it has not passed. We
  // say what will happen, we put the useful step first, and we still let her decide.
  const holdUntil =
    c.appealNotAdvisedBefore && Date.parse(c.appealNotAdvisedBefore) > Date.now()
      ? c.appealNotAdvisedBefore
      : null;

  // Three pieces of text of ours that were written in one language and are being read in
  // another. None of these awaits a model: a stored translation is used if there is one, and if
  // there is not, the original is shown, named as what it is, and not read aloud, while the
  // translation is fetched behind the render. The department's reply is never touched.
  const reasoning = c.audit
    ? readTranslated({
        store: 'auditReasoning',
        rowId: c.audit.id,
        parts: [c.audit.reasoning],
        stored: c.audit.reasoningTranslations,
        from: 'en',
        to: lang,
      })
    : null;

  // The list she would carry to a counter. English bullets inside a Hindi page read as the part
  // she is not trusted with.
  const unaddressed =
    c.audit && c.audit.unaddressed.length > 0
      ? readTranslated({
          store: 'auditUnaddressed',
          rowId: c.audit.id,
          parts: c.audit.unaddressed,
          stored: c.audit.unaddressedTranslations,
          from: 'en',
          to: lang,
        })
      : null;

  // Seeded once, in the case's own language — which is the wrong language for anyone reading
  // this case in either of the other two. This is the most actionable section on the page.
  const nextStep = c.nextStep
    ? readTranslated({
        store: 'nextStep',
        rowId: c.id,
        parts: [c.nextStep.heading, c.nextStep.body],
        stored: c.nextStepTranslations,
        from: c.narrativeLang,
        to: lang,
      })
    : null;
  const nextStepSpokenLang = nextStep?.state === 'translated' ? lang : c.narrativeLang;

  return (
    <div className="space-y-10">
      {/* Renders nothing. Arriving here is what puts this case on the device's own list, so a
          link someone was sent works the same way as a case they filed themselves. */}
      <RememberCase caseRef={c.ref} subject={c.subject} />

      {degraded && (
        <FixtureBanner heading={s.offlineHeading} body={s.offlineBody} writes={s.offlineWrites} />
      )}

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-muted">{c.ref}</span>
          <MockBadge what={s.simulatedCase} />
        </div>
        <h1 className="text-2xl font-semibold leading-tight">{c.subject}</h1>
        <p className="text-muted">
          {c.office} · {c.department}
        </p>
        {c.filedByRelation && (
          <p className="text-sm text-muted">{s.filedOnBehalf(c.citizen.name, c.filedByRelation)}</p>
        )}
      </header>

      {/* The status, said in words rather than in a status word. */}
      <section className="rounded border border-rule p-5">
        <h2 className="text-lg font-semibold">{s.whereThisStands}</h2>

        {/* The wait, given its own line. Nineteen days ending in a sentence that answers
            nothing is the most concrete fact on this page, and it used to be a subordinate
            clause inside the closing date. Both numbers come from the case's own dates. */}
        {closed && (
          <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
            <span className="text-3xl font-semibold tabular-nums">
              {s.elapsedDays(daysBetween(c.filedAt, c.closedAt!))}
            </span>
            <span className="text-muted">{s.elapsedCaption}</span>
          </p>
        )}

        <dl className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted">{s.theirWordFor}</dt>
            <dd className="font-semibold">{c.rawStatus}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted">{s.whatThatMeans}</dt>
            <dd>{translateJargon(c.rawStatus, lang)}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted">{s.filedOn}:</dt>
            <dd>{fmt(c.filedAt)}</dd>
          </div>
          {closed ? (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted">{s.closedOn}:</dt>
              <dd>
                {fmt(c.closedAt!)} — {s.closedAfter(daysBetween(c.filedAt, c.closedAt!))}
              </dd>
            </div>
          ) : (
            left !== null && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-muted">{s.clock}</dt>
                <dd className={left < 0 ? 'font-semibold text-bad' : ''}>
                  {left >= 0 ? s.daysLeft(left) : s.daysOver(-left)}
                </dd>
              </div>
            )
          )}
        </dl>

        <Timeline entries={timeline} labels={s.events} lang={lang} />
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
          <p className="text-sm text-muted">{s.markedText}</p>
          <ReadAloud text={c.reply.body} lang={c.reply.lang} label={s.readTheirReply} />
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
          <p className="text-ink">{reasoning!.parts[0]}</p>
          {reasoning!.state === 'translated' && <p className="text-sm text-ink/70">{s.translatedByUs}</p>}
          {reasoning!.state === 'untranslated' && <p className="text-sm text-ink/70">{s.translationFailed}</p>}

          {unaddressed && (
            <div>
              <h3 className="font-semibold text-ink">{s.whatTheyDidNotAnswer}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-ink">
                {unaddressed.parts.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
              {unaddressed.state === 'untranslated' && (
                <p className="mt-1 text-sm text-ink/70">{s.translationFailed}</p>
              )}
            </div>
          )}

          {/*
            Never hand English text to a Hindi voice. If we could not translate the reasoning,
            there is nothing here worth reading aloud in this language, and we say so above
            instead of performing an accessibility feature that does not work.
          */}
          {reasoning!.state !== 'untranslated' && (
            <ReadAloud text={`${v.headline} ${reasoning!.parts[0]}`} lang={lang} label={s.listenToThis} />
          )}

          <details open={sp.how === '1'} className="border-t border-current/20 pt-3">
            <summary className="cursor-pointer font-semibold text-ink">{s.seeHow}</summary>
            <div className="mt-3 space-y-3 text-ink">
              <p>{s.howWeJudgedBody(c.citizen.name)}</p>
              <div>
                <h4 className="font-semibold">{s.quotedFromReply}</h4>
                <ul className="mt-1 space-y-1">
                  {c.audit.citations.map((q, i) => (
                    <li key={i} className="border-l-2 border-current/40 pl-3 font-serif">
                      “{q.quote}”
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm">
                {s.checkedLine(
                  c.audit.citationsVerified,
                  Math.round(c.audit.confidence * 100),
                  c.audit.model,
                  c.audit.promptVersion,
                )}
              </p>
              <p className="text-sm">
                {s.notTheScore}{' '}
                <Link href="/numbers" className="underline">
                  {s.numbersLink}
                </Link>
                .
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
          <ReadAloud text={`${s.didItWork} ${s.didItWorkSub}`} lang={lang} label={s.readAloud} />

          {degraded ? (
            /* Nowhere to record an answer, so we do not offer a button that would throw. The
               resolution figure comes from confirmations and never from a verdict, which is
               exactly why we cannot fake one here. */
            <p className="rounded border border-warn/50 bg-warn/5 p-3 text-ink">{s.offlineWrites}</p>
          ) : c.confirmation ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold">
                {s.youSaid} {c.confirmation.resolved ? s.yes : s.no}
              </p>
              {c.audit && (c.audit.verdict === 'resolved') !== c.confirmation.resolved && (
                <p className="rounded border border-warn/40 bg-warn/5 p-3 text-warn">
                  {s.disagreement(c.audit.verdict)}{' '}
                  <Link href="/numbers" className="underline">
                    {s.numbersPageLink}
                  </Link>
                  .
                </p>
              )}
              <form action={confirmResolution}>
                <input type="hidden" name="ref" value={c.ref} />
                <input type="hidden" name="resolved" value={c.confirmation.resolved ? 'no' : 'yes'} />
                <button type="submit" className="text-sm underline">
                  {s.changeMyAnswer}
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

      {/*
        The forum. Hand-written per case by someone who knows the ladder, held in the database,
        never generated. Absent where we do not know it — a generic next step would send the
        citizen to the wrong counter with our name on it.
      */}
      {nextStep && (
        <section className="space-y-3 rounded border-2 border-ink p-5">
          <h2 className="text-xl font-semibold">{s.whatToDoNext}</h2>
          <p className="text-lg font-semibold">{nextStep.parts[0]}</p>
          <p className="whitespace-pre-wrap leading-relaxed">{nextStep.parts[1]}</p>
          {nextStep.state === 'untranslated' ? (
            // The original language, named. Never a voice speaking the wrong language at her.
            <p className="text-sm text-muted">{s.translationFailed}</p>
          ) : (
            <ReadAloud
              text={`${nextStep.parts[0]} ${nextStep.parts[1]}`}
              lang={nextStepSpokenLang}
              label={s.readAloud}
            />
          )}
        </section>
      )}


      {/*
        The appeal. Drafted before it is asked for; sent only when it is consented to — and only
        while it is still in time. Past thirty days there is no live appeal to offer, and saying
        so plainly costs a citizen one paragraph instead of one month.
      */}
      {!degraded && timeBarred && appealWin && (
        <section className="space-y-3 rounded border border-rule p-5">
          <h2 className="text-xl font-semibold">{s.windowClosedHeading}</h2>
          <p>{s.windowClosedBody(fmt(appealFrom!), -appealWin.daysLeft)}</p>
          <ReadAloud
            text={`${s.windowClosedHeading} ${s.windowClosedBody(fmt(appealFrom!), -appealWin.daysLeft)}`}
            lang={lang}
            label={s.readAloud}
          />
        </section>
      )}

      {!degraded && closed && windowOpen && (canAppeal || c.appeal) && (
        <section className="space-y-4 rounded border border-rule p-5">
          {/*
            Where the department gave itself a date that has not passed, this whole section is
            folded away behind the step above and opens only if she asks for it. She is told
            what an early appeal does and then left to decide; taking the choice away would be
            us substituting our judgement for hers on her own case.
          */}
          {holdUntil ? (
            <>
              <h2 className="text-xl font-semibold">{s.appealHoldHeading(fmt(holdUntil))}</h2>
              <p>{s.appealHoldBody(fmt(holdUntil))}</p>
              <ReadAloud
                text={`${s.appealHoldHeading(fmt(holdUntil))} ${s.appealHoldBody(fmt(holdUntil))}`}
                lang={lang}
                label={s.readAloud}
              />
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold">{s.appealReady}</h2>
              {appealWin && <p className="text-sm text-muted">{s.appealDaysLeft(appealWin.daysLeft)}</p>}
            </>
          )}

          <details open={!holdUntil} className={holdUntil ? 'border-t border-rule pt-3' : ''}>
            <summary className={holdUntil ? 'cursor-pointer font-semibold' : 'sr-only'}>
              {s.appealAnyway}
            </summary>
            <div className="mt-3 space-y-4">
          {!c.appeal ? (
            <form action={prepareAppeal} className="space-y-3">
              <input type="hidden" name="ref" value={c.ref} />
              <p className="text-muted">{s.appealIntro}</p>
              <button type="submit" className="min-h-touch rounded bg-ink px-6 py-3 font-semibold text-paper">
                {s.writeMyAppeal}
              </button>
            </form>
          ) : c.appeal.status === 'drafted' ? (
            <form action={sendAppeal} className="space-y-4">
              <input type="hidden" name="ref" value={c.ref} />

              <div>
                <h3 className="font-semibold">{s.grounds}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {c.appeal.grounds.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>

              {/* The consent gate: both versions at once, never one behind a toggle. */}
              <div className="rounded border-2 border-ink p-4">
                <h3 className="text-lg font-semibold">{s.consentTitle}</h3>
                {/*
                  This used to say "exactly what we will send" over a button saying "Send", and
                  the truth — that nothing reaches any office — appeared only on the screen
                  after the click. A citizen decided to consent while believing something would
                  be sent. The decision is made here, so it has to be true here.
                */}
                <p className="mt-2 text-sm font-semibold">{s.consentNothingSent}</p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted">
                      {s.sentEnglish}
                    </h4>
                    <p className="mt-1 whitespace-pre-wrap font-serif">{c.appeal.bodyFormal}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted">
                      {s.sentYourLang}
                    </h4>
                    <p className="mt-1 whitespace-pre-wrap font-serif">{c.appeal.bodyCitizenLang}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <ReadAloud
                    text={c.appeal.bodyCitizenLang}
                    lang={c.narrativeLang}
                    label={s.hearWhatWillBeSent}
                  />
                </div>

                <label className="mt-4 flex items-start gap-3">
                  <input type="checkbox" name="consent" className="mt-1.5 h-6 w-6" />
                  <span>{s.consentBox}</span>
                </label>

                <button type="submit" className="mt-4 min-h-touch rounded bg-ink px-6 py-3 font-semibold text-paper">
                  {s.sendMyAppeal}
                </button>
              </div>
            </form>
          ) : (
            /*
              What used to stand here was a green tick and "the officer has 30 days, the clock is
              now running". Nothing was sent anywhere, so a man read that tick and waited a month.
              This says what actually happened, in his language, on this screen.
            */
            <div className="space-y-2 rounded border-2 border-ink p-4">
              <p className="text-lg font-semibold">{s.recordedHeading}</p>
              <p>{s.recordedBody}</p>
              <ReadAloud text={`${s.recordedHeading} ${s.recordedBody}`} lang={lang} label={s.readAloud} />
            </div>
          )}
            </div>
          </details>
        </section>
      )}

      {/*
        A draft made inside the window and opened again after it: the text is still hers, but
        the consent gate is gone, because sending it would send it nowhere useful. The action
        refuses this too — the page must not be the only thing holding the line.
      */}
      {!degraded && closed && !windowOpen && c.appeal && c.appeal.status !== 'drafted' && (
        <section className="space-y-2 rounded border border-rule p-5">
          <h2 className="text-xl font-semibold">{s.appealReady}</h2>
          <p className="text-lg font-semibold">{s.recordedHeading}</p>
          <p>{s.recordedBody}</p>
          <ReadAloud text={`${s.recordedHeading} ${s.recordedBody}`} lang={lang} label={s.readAloud} />
        </section>
      )}

      {/* Counts, never who. */}
      {c.cluster && (
        <section className="rounded border border-rule p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">{s.notOnlyOne}</h2>
            {/* Measured or labelled simulated, never a third category. These counts come from
                the synthetic corpus, and they say so where they are read, not on another page. */}
            <MockBadge what={s.simulatedCounts} />
          </div>
          <p className="mt-2 text-lg">{s.clusterLine(c.cluster.members - 1, c.cluster.saidNotFixed, c.cluster.neverAsked)}</p>
          <p className="mt-1 text-muted">{c.cluster.label}</p>
          <Link href={`/cluster/${c.cluster.id}`} className="mt-3 inline-block underline">
            {s.clusterSee}
          </Link>
        </section>
      )}

      {/* The receipt is built from ledger rows. With no database there are no rows, and an
          offered download that cannot be produced is worse than none. */}
      {degraded ? (
        <p className="text-muted">{s.offlineWrites}</p>
      ) : (
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
      )}

      <MockNote>{s.mockNote}</MockNote>
    </div>
  );
}

function Timeline({
  entries,
  labels,
  lang,
}: {
  entries: { seq: number; type: string; occurredAt: string }[];
  labels: Record<string, string>;
  lang: ShippedLang;
}) {
  if (entries.length === 0) return null;
  return (
    <ol className="mt-5 space-y-0 border-l-2 border-rule pl-5">
      {entries.map((e) => (
        <li key={e.seq} className="relative pb-4 last:pb-0">
          <span aria-hidden className="absolute -left-[27px] top-2 h-3 w-3 rounded-full bg-ink" />
          <p className="font-semibold">{labels[e.type] ?? e.type.replace(/_/g, ' ')}</p>
          <p className="text-sm text-muted">{formatDate(e.occurredAt, lang)}</p>
        </li>
      ))}
    </ol>
  );
}

const LOCALES: Record<ShippedLang, string> = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

function formatDate(iso: string, lang: ShippedLang = 'en'): string {
  return new Date(iso).toLocaleDateString(LOCALES[lang], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}
