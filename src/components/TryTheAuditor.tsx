'use client';

import { useEffect, useRef, useState } from 'react';
import { auditText, type AuditPreview } from '@/actions/audit-actions';
import { verdictCopy } from '@/lib/verdicts';
import { t, type ShippedLang } from '@/lib/i18n/strings';
import { TRY_EXAMPLES, matchExample, type TryExample } from '@/lib/try-examples';

/**
 * Audit a reply we did not choose.
 *
 * Three demo cases invite one fair objection: of course it works, you picked them. So this
 * takes any closure reply — a real one somebody received, or one written specifically to fool
 * us — and judges it on the spot, quoting from the text the reader supplied rather than ours.
 *
 * The six chips answer a second, unspoken objection: does this only work on CPGRAMS? They carry
 * terminal strings observed on six different Indian public-service systems — an EPFO claim
 * rejected `OK/OK`, an Income Tax refund that failed for `Others`, a UIDAI update `rejected due
 * to technical reasons`. One engine reads all of them, and we integrated with none of them: the
 * strings are text we typed into `src/lib/try-examples.ts`, nothing more.
 *
 * Those six are fixed inputs, so their audits were run once by
 * `scripts/precompute-chip-audits.ts` and committed, and a chip click now returns at once
 * instead of after ten-odd seconds. The cost of that shortcut is that the reader has to be able
 * to tell which kind of result they are looking at, in the moment, without going hunting — so
 * `precomputed` is printed on the verdict itself, the note above the button changes while a
 * chip is loaded verbatim, and the elapsed-time line says why it was fast. Edit one character
 * and every one of those reverts, because the server-side match is exact. A hidden
 * pre-computation on the one feature whose purpose is proving the auditor is not canned would
 * be the worst thing on this page.
 *
 * Nothing here is stored. It is not a case; it is the auditor with its hands open.
 *
 * Every word of the chrome around it now comes from the dictionary rather than from string
 * literals in this file. The front page defaults to Hindi, and this box was the largest block
 * of hardcoded English underneath a Hindi headline — a reader's first fifteen seconds said
 * "unfinished" about a site whose case pages are fully translated. The six terminal strings on
 * the chips stay in the language they were observed in, because translating a rejection code
 * would be inventing one.
 */

export function TryTheAuditor({ lang, compact = false }: { lang: ShippedLang; compact?: boolean }) {
  const s = t(lang);
  const [complaint, setComplaint] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditPreview | null>(null);
  const [loaded, setLoaded] = useState<TryExample | null>(null);
  // Real elapsed seconds since the click, and the real total once it lands. The only thing that
  // moves during the wait is this counter, and it counts actual time — there is no progress bar,
  // because we cannot see inside the model call and a bar that advanced on a timer would be a
  // lie of exactly the kind this project exists to refuse.
  const [elapsed, setElapsed] = useState(0);
  const [took, setTook] = useState<number | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setElapsed((Date.now() - startedAt.current) / 1000), 100);
    return () => clearInterval(id);
  }, [busy]);

  async function run() {
    startedAt.current = Date.now();
    setElapsed(0);
    setTook(null);
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const outcome = await auditText({ complaint, reply });
      // A refusal — too long, too short, or the throttle — comes back as data rather than as a
      // thrown error, because a production build would replace a thrown message with a digest.
      if (!outcome.ok) setError(outcome.message);
      else setResult(outcome);
    } catch {
      // A genuine fault: the model call failed or the network went. It said "nothing was sent
      // anywhere", which was false: by the time this branch runs the text has already gone to
      // OpenAI. Saying it at the moment of failure is the worst possible moment to say it,
      // because it is the moment a reader is most likely to believe it.
      setError(s.tryFailed);
    } finally {
      setTook((Date.now() - startedAt.current) / 1000);
      setBusy(false);
    }
  }

  const v = result ? verdictCopy(result.result.verdict, lang) : null;
  // Exactly the test the server will apply, so the note above the button never promises
  // "instant" for text that is about to take the live path. One edited character flips it back.
  const isChip = matchExample(complaint, reply) !== null;

  return (
    <div className="space-y-4">
      {!compact && (
        <div>
          <h2 className="text-xl font-semibold">{s.tryHeading}</h2>
          <p className="mt-1 text-muted">{s.trySub}</p>
          {/* Where the words go, said where the decision to paste is taken. */}
          <p className="mt-1 text-muted">{s.sentToModel}</p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold">{s.tryChipsHeading}</h3>
          {/*
            This paragraph is the whole point of the chips, and it sits above them rather than
            below so nobody can read the six logos' worth of names and conclude we are wired
            into six portals. We are not. These are strings people have pasted into public
            forums, retyped here by hand.
          */}
          <p className="mt-1 text-muted">{s.tryChipsBody}</p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {TRY_EXAMPLES.map((e) => {
            const isLoaded = loaded?.string === e.string;
            return (
              <li key={e.system + e.string}>
                <button
                  type="button"
                  aria-pressed={isLoaded}
                  onClick={() => {
                    setComplaint(e.complaint);
                    setReply(e.reply);
                    setLoaded(e);
                    setResult(null);
                    setError(null);
                  }}
                  className={`flex min-h-touch w-full flex-col items-start gap-0.5 rounded border px-4 py-2 text-left hover:border-ink ${
                    isLoaded ? 'border-ink border-2 bg-ink/5' : 'border-rule'
                  }`}
                >
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {e.system}
                    {isLoaded && <span className="ml-2 font-normal normal-case">· {s.tryLoadedBadge}</span>}
                  </span>
                  <span className="font-serif">“{e.string}”</span>
                </button>
              </li>
            );
          })}
        </ul>

        {loaded && (
          <p className="text-muted">{s.tryAttribution(loaded.system, loaded.attribution)}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="ta-complaint" className="block font-semibold">
            {s.tryComplaintLabel}
          </label>
          <textarea
            id="ta-complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            rows={5}
            placeholder={s.tryComplaintPlaceholder}
            className="mt-1 w-full rounded border border-ink p-3"
          />
        </div>
        <div>
          <label htmlFor="ta-reply" className="block font-semibold">
            {s.tryReplyLabel}
          </label>
          <textarea
            id="ta-reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={5}
            placeholder={s.tryReplyPlaceholder}
            className="mt-1 w-full rounded border border-ink p-3"
          />
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={run}
          disabled={busy || !complaint.trim() || !reply.trim()}
          className="min-h-touch rounded bg-ink px-6 py-3 font-semibold text-paper disabled:opacity-40"
        >
          {busy ? s.tryReadingButton : s.tryJudge}
        </button>

        {/*
          Said BEFORE the click, not after it. The wait is around ten seconds, and a reader who
          is not told that reads a dimmed button as a broken one. It is also the most persuasive
          thing on the page: nothing here is looked up, so the time is a reasoning model actually
          reading this text.
        */}
        {!busy && (
          <p className="text-ink">{isChip ? s.tryTimeNoteChip : s.tryTimeNote}</p>
        )}
      </div>

      {busy && (
        <div className="rounded border-2 border-rule p-5 text-ink">
          {/*
            One announcement to a screen reader when the work starts, and one when it lands — the
            ticking number is aria-hidden, because a live region that changes ten times a second
            would be unusable.
          */}
          <p role="status" aria-live="polite" className="font-semibold">
            {s.tryBusyStatus}
          </p>
          <p aria-hidden className="mt-2 font-serif text-2xl tabular-nums">
            {elapsed.toFixed(1)}s
            <span className="ml-3 inline-block animate-pulse text-lg not-italic">▌</span>
          </p>
          {/*
            Both of these really happen, in this order, in `audit()`: the model call, then
            `checkCitations` against the reply body, which can send the model back once. What we
            cannot say is which one is running right now — there is no streaming here, so the
            client learns nothing until the whole thing returns. So they are listed as what the
            wait consists of, not staged as though we were watching them tick by.
          */}
          <p className="mt-2">{s.tryBusyDetail}</p>
        </div>
      )}

      {took !== null && !busy && (result || error) && (
        <p role="status" aria-live="polite" className="text-ink">
          {result?.precomputed ? s.tryTookPrecomputed(took.toFixed(1)) : s.tryTook(took.toFixed(1))}
        </p>
      )}

      {error && (
        <p role="alert" className="rounded border-2 border-bad p-4 text-bad">
          {error}
        </p>
      )}

      {result && v && (
        <div className={`space-y-3 rounded border-2 p-5 ${v.className}`}>
          {/*
            Above the verdict, not under it, and inside the same box so it cannot be read as
            chrome belonging to something else. It is announced too: the result box appears
            after a wait, and a screen-reader user who is told the verdict but not that it was
            committed earlier has been told less than a sighted one.
          */}
          {result.precomputed && (
            <p role="status" aria-live="polite" className="rounded border-2 border-current/50 p-3 text-ink">
              {s.tryPrecomputed}
            </p>
          )}
          <p className="flex items-center gap-3">
            <span aria-hidden className="text-2xl">{v.icon}</span>
            <span className="text-lg font-semibold uppercase tracking-wide">{v.label}</span>
          </p>
          <p className="text-lg font-semibold text-ink">{v.headline}</p>
          <p className="text-ink">{result.result.reasoning}</p>
          {/*
            The auditor writes its reasoning in English. On a Hindi or Marathi page we say so
            rather than let it read as a translation gap — and rather than machine-translating
            a verdict's own words on the way out.
          */}
          {s.tryReasoningLang && <p className="text-muted">{s.tryReasoningLang}</p>}

          {result.result.citations.length > 0 && (
            <div className="text-ink">
              <h3 className="font-semibold">{s.tryQuoted}</h3>
              <ul className="mt-1 space-y-1">
                {result.result.citations.map((c, i) => (
                  <li key={i} className="border-l-2 border-current/40 pl-3 font-serif">
                    “{c.quote}”
                  </li>
                ))}
              </ul>
              <p className="mt-2">{s.tryCheckedLine(result.citationsVerified, result.guardFailures)}</p>
            </div>
          )}

          {result.result.unaddressed.length > 0 && (
            <div className="text-ink">
              <h3 className="font-semibold">{s.tryUnaddressed}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {result.result.unaddressed.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          {result.result.injection_suspected && (
            <p className="rounded border border-bad p-3 text-bad">{s.tryInjection}</p>
          )}

          <p className="text-ink">{s.tryNotScore}</p>
        </div>
      )}
    </div>
  );
}
